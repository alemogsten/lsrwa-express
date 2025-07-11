// lib/mongo.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const options = {};

let client;
let clientPromise;

// Reuse connection in development to avoid exhausting connections on hot reload
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
