const dns = require('dns');
const mongoose = require('mongoose');

/**
 * Convert mongodb+srv://… using an explicit DNS resolver (Google/Cloudflare).
 * Avoids Windows Node default-resolver querySrv ECONNREFUSED.
 */
const expandSrvUri = async (uri) => {
  if (!uri.startsWith('mongodb+srv://')) return uri;

  const withoutProtocol = uri.slice('mongodb+srv://'.length);
  const at = withoutProtocol.lastIndexOf('@');
  if (at === -1) throw new Error('Invalid MONGO_URI (missing @)');

  const credentials = withoutProtocol.slice(0, at);
  const hostAndRest = withoutProtocol.slice(at + 1);
  const slash = hostAndRest.indexOf('/');
  const qIdx = hostAndRest.indexOf('?');
  const hostEnd = slash === -1 ? (qIdx === -1 ? hostAndRest.length : qIdx) : slash;
  const host = hostAndRest.slice(0, hostEnd);
  const pathAndQuery = hostAndRest.slice(hostEnd); // includes /db?params or ?params

  const resolver = new dns.promises.Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

  const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
  if (!srvRecords?.length) {
    throw new Error(`No SRV records found for ${host}`);
  }

  const hosts = srvRecords
    .map((r) => `${String(r.name).replace(/\.$/, '')}:${r.port || 27017}`)
    .join(',');

  let authSource = 'admin';
  try {
    const txt = await resolver.resolveTxt(host);
    const flat = txt.flat().join('');
    const match = flat.match(/authSource=([^&\s]+)/);
    if (match) authSource = match[1];
  } catch {
    // Atlas defaults to admin
  }

  const hasPath = pathAndQuery.startsWith('/');
  const pathPart = hasPath ? pathAndQuery : `/${pathAndQuery}`;
  const joiner = pathPart.includes('?') ? '&' : '?';
  return `mongodb://${credentials}@${hosts}${pathPart}${joiner}ssl=true&authSource=${authSource}&retryWrites=true&w=majority`;
};

const connectDB = async () => {
  const raw = process.env.MONGO_URI;
  if (!raw || raw.includes('<db_username>')) {
    throw new Error(
      'MONGO_URI is missing or still contains <db_username>. Set your Atlas username in backend/.env'
    );
  }

  const uri = await expandSrvUri(raw);
  await mongoose.connect(uri, {
    family: 4,
    serverSelectionTimeoutMS: 20000,
  });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};

module.exports = connectDB;
