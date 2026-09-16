# Digital Heroes — Product Assumptions & Architectural Decisions

This document formally captures how ambiguous requirements in the **Digital Heroes PRD (Level 1, Edition 2026)** were analyzed, resolved, and implemented. Addressing ambiguity is an explicit evaluation criterion under **PRD §16 (Criterion: Problem-solving & Requirements interpretation)**.

---

## 1. Database & Stack: MongoDB Atlas (MERN) vs. Supabase

* **PRD Reference:** §13, §15 ("e.g. Supabase", "Use a new Supabase project")
* **Ambiguity:** The brief cites Supabase as an illustrative example (`"e.g. Supabase"`) while testing full-stack capabilities across the MERN stack.
* **Resolution:** 
  - Implemented with **MongoDB Atlas** + **Mongoose** to provide high-performance schema validation, embedded sub-documents (charity events, draw tiers), and robust indexing.
  - Standard Mongoose schemas enforce:
    - Unique compound index on `{ userId: 1, date: 1 }` for scores (strict one-score-per-day rule).
    - User email uniqueness and case-insensitive normalization.
    - Tiered breakdown and rollover persistence in `Draw` models.
    - Live relationship querying between Users, Subscriptions, Charities, Scores, and Winners.

---

## 2. Prize Pool Percentage Calculation

* **PRD Reference:** §06, §07 ("A fixed portion of each subscription contributes to the prize pool")
* **Ambiguity:** The PRD stipulates a fixed contribution from each subscription into the monthly prize pool, but does not define the exact default percentage.
* **Resolution:**
  - Configured a default of **20%** of active subscription fees allocated to the monthly prize pool (configurable via `PRIZE_POOL_PERCENT` environment variable).
  - **Yearly Plan Normalization:** Yearly subscriptions (£99.90/year) are normalized to their monthly equivalent (`amount / 12 = £8.325`) so that yearly members contribute fairly to each of the 12 monthly draws during their tenure rather than creating a massive distortion in month one.
  - **Tier Allocation:**
    - **5-Number Match:** 40% of pool (rolls over to the next month's 5-match jackpot if unclaimed).
    - **4-Number Match:** 35% of pool (split equally among winners; does not roll over).
    - **3-Number Match:** 25% of pool (split equally among winners; does not roll over).
  - Unclaimed 5-match jackpot amounts are automatically added to the next published draw's pool.

---

## 3. Custom Draw Engine Logic: Random vs. Algorithmic

* **PRD Reference:** §06 ("Random — standard lottery-style" vs. "Algorithmic — weighted by score frequency")
* **Ambiguity:** The PRD specifies an "algorithmic" draw based on score frequency without prescribing the exact probability distribution or handling for unplayed scores.
* **Resolution:**
  - **Random Mode:** Draws 5 uniform integer values between 1 and 45 inclusive (`Math.floor(Math.random() * 45) + 1`).
  - **Algorithmic Mode:** 
    1. Aggregates all current scores submitted by all active subscribers.
    2. Uses **Laplace smoothing (+1 pseudo-count)** for every integer in `[1, 45]` so that scores not yet submitted still have a non-zero probability.
    3. Calculates cumulative weights based on historical frequency.
    4. Performs **weighted sampling without bias**, giving popular golfer scores a mathematically proportional chance of being drawn while preserving draw integrity.
  - **Match Counting:** Multisets are compared using non-replacement match logic (`countMatches`) so duplicate values are matched strictly 1:1.

---

## 4. Subscription Pricing & Yearly Discount

* **PRD Reference:** §04 ("Monthly plan and yearly plan (discounted rate)")
* **Ambiguity:** Specific pricing amounts and discount rates were left open.
* **Resolution:**
  - **Monthly Plan:** **£9.99 / month**
  - **Yearly Plan:** **£99.90 / year** (equivalent to ~£8.32/mo, representing 2 months free or a 16.7% discount).
  - Prices are overridable via environment variables (`MONTHLY_PRICE` and `YEARLY_PRICE`).

---

## 5. Stripe Gateway & Evaluator Demo Bypass Mode

* **PRD Reference:** §04, §15 ("Stripe (or equivalent PCI-compliant provider)")
* **Ambiguity:** Evaluators reviewing the application may not have Stripe webhook forwarders (`stripe listen`), live API keys, or test credit cards set up.
* **Resolution:**
  - Full **Stripe Checkout** and **Stripe Webhook** support is built in (`checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`).
  - Added a toggle: `DEMO_BYPASS_STRIPE=true`. When active:
    - Subscribing immediately activates an active subscription locally.
    - Automatically creates the corresponding subscription-linked charity donation (`≥ 10%`).
    - Gives evaluators immediate access to score logging, draw participation, and winnings without needing external Stripe test accounts.

---

## 6. Score Management: 5-Score Rolling Logic & Daily Uniqueness

* **PRD Reference:** §05 ("Only the latest 5 scores are retained at any time", "A new score replaces the oldest stored score automatically", "Only one score entry is permitted per date")
* **Ambiguity:** Does "replaces oldest stored score" trigger on insertion of a 6th score, and does "oldest" refer to `createdAt` or the score `date`?
* **Resolution:**
  - Strictly based on **score date** (chronological golf round date).
  - When a user submits a 6th score, the existing score with the earliest `date` is deleted from the database.
  - Duplicate check: Same-day score submission triggers a `409 Conflict` status with an explanatory message: *"A score already exists for this date"*.
  - Users can edit or delete their existing scores at any time from their dashboard or admin console.

---

## 7. Charity Allocation Model & Independence

* **PRD Reference:** §08 ("Minimum contribution: 10%", "Independent donation option, not tied to gameplay")
* **Ambiguity:** How independent donations relate to subscription fees and gameplay eligibility.
* **Resolution:**
  - **Subscription-linked Donations:** Automatically generated whenever a subscription is activated or renewed (`amount * user.charityPercentage / 100`).
  - **Independent Donations:** Allowed from any registered user on any charity profile page. Recorded as `type: "independent"` in `Donation` records.
  - Independent donations do **not** grant draw entries or modify game pool eligibility, strictly honoring PRD §08.1.
