import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;

export async function getDb(): Promise<Db> {
  if (!clientPromise) {
    throw new Error('MongoDB client not initialized. Set MONGODB_URI environment variable.');
  }
  const client = await clientPromise;
  return client.db('edulytics');
}

export async function checkConnection(): Promise<boolean> {
  try {
    if (!clientPromise) {
      return false;
    }
    const client = await clientPromise;
    await client.db('admin').command({ ping: 1 });
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}
