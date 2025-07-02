// app/api/depositor/compound/route.js
import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongo';

export async function POST(request) {
  const { address } = await request.json();

  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const collection = db.collection('users');

  try {
    const user = await collection.findOne({address: address});
    await collection.updateOne(
      { address: address },
      { $set: { deposit: user.deposit+user.reward, reward: 0 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}