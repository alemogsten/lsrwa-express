// app/api/requests/route.js
import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';


export async function POST(req) {
  const { address } = await req.json();
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  
  const requests = await db
    .collection('requests')
    .find({ user: address })
    .sort({ timestamp: -1 })
    .toArray();

  return NextResponse.json({ requests });
}
