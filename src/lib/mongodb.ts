import mongoose from 'mongoose';

function getMongoUri(): string {
  // Preferă mereu conexiunea directă (fără SRV) pentru a evita querySrv ECONNREFUSED
  const direct = process.env.MONGODB_URI_DIRECT;
  if (direct && direct.startsWith('mongodb://')) return direct;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Adaugă MONGODB_URI sau MONGODB_URI_DIRECT în .env.local');
  // Dacă e SRV, convertește la format direct ca fallback (evită querySrv)
  if (uri.startsWith('mongodb+srv://')) {
    const match = uri.match(/^mongodb\+srv:\/\/([^@]+)@cluster0\.(ai2325w\.mongodb\.net)(\/[^?]*)?(\?.*)?$/);
    if (match) {
      const [, auth, domain, pathPart, queryPart] = match;
      const path = pathPart && pathPart !== '/' ? pathPart : '/magazin';
      const query = queryPart ? '&' + queryPart.slice(1) : '';
      return `mongodb://${auth}@cluster0-shard-00-00.${domain}:27017,cluster0-shard-00-01.${domain}:27017,cluster0-shard-00-02.${domain}:27017${path}?ssl=true&authSource=admin${query}`;
    }
  }
  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };
if (process.env.NODE_ENV !== 'production') global.mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = getMongoUri();
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
