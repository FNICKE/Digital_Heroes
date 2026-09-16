import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import * as charityService from '../services/charityService';

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    charityService.listCharities().then((res) => {
      const all = res.data.charities || [];
      const spotlight = all.filter((c) => c.isFeatured);
      setFeatured(spotlight.length ? spotlight.slice(0, 3) : all.slice(0, 3));
    });
  }, []);

  return (
    <div className="page home-page">
      <Navbar />
      <section className="hero">
        <div className="hero-veil" />
        <div className="hero-content">
          <p className="brand-mark">Digital Heroes</p>
          <h1>Give first. Play fair. Win together.</h1>
          <p className="hero-sub">
            A membership that funds the causes you care about — and enters you into a
            monthly prize draw powered by your Stableford scores.
          </p>
          <div className="cta-row">
            <Link to="/signup" className="btn">
              Subscribe now
            </Link>
            <Link to="/charities" className="btn btn-ghost">
              Meet the causes
            </Link>
          </div>
        </div>
      </section>

      <section className="section steps-section">
        <p className="eyebrow">What you do</p>
        <h2>Three moves. One membership.</h2>
        <div className="steps-grid">
          <article className="step">
            <span className="step-num">01</span>
            <h3>Subscribe</h3>
            <p>Monthly or yearly. Part of every fee supports a charity you choose (min 10%).</p>
          </article>
          <article className="step">
            <span className="step-num">02</span>
            <h3>Log scores</h3>
            <p>Enter your last five Stableford scores (1–45). Only the newest five are kept.</p>
          </article>
          <article className="step">
            <span className="step-num">03</span>
            <h3>Enter the draw</h3>
            <p>Each month your scores compete for 5-, 4-, and 3-number match prize pools.</p>
          </article>
        </div>
      </section>

      <section className="section draw-section">
        <p className="eyebrow">How you win</p>
        <h2>Monthly draws — random or algorithm-powered</h2>
        <p className="lede">
          Five winning Stableford values are drawn. Match 5 for the jackpot (40%, rolls over if
          unclaimed), 4 for 35%, or 3 for 25%. Multiple winners share the tier equally. Admins
          simulate before publishing results.
        </p>
        <ul className="tier-list">
          <li>
            <strong>5-match</strong> — 40% jackpot · rolls over
          </li>
          <li>
            <strong>4-match</strong> — 35% of the pool
          </li>
          <li>
            <strong>3-match</strong> — 25% of the pool
          </li>
        </ul>
      </section>

      <section className="section spotlight-section">
        <p className="eyebrow">Featured causes</p>
        <h2>Charity impact leads the story</h2>
        <p className="lede">
          Every subscriber directs a portion of their fee to a cause — independent of winning.
        </p>
        <div className="charity-grid">
          {featured.map((c) => (
            <article key={c._id} className="charity-card">
              {c.images?.[0] && (
                <div
                  className="charity-card-media"
                  style={{ backgroundImage: `url(${c.images[0]})` }}
                />
              )}
              <div className="charity-card-body">
                <h3>{c.name}</h3>
                <p>{c.description.slice(0, 120)}…</p>
                <Link to={`/charities/${c._id}`} className="btn btn-ghost">
                  View cause
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="cta-row" style={{ marginTop: '2rem' }}>
          <Link to="/signup" className="btn">
            Become a member
          </Link>
          <Link to="/charities" className="btn btn-ghost">
            Full directory
          </Link>
        </div>
      </section>
    </div>
  );
}
