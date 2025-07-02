// app/api/depositor/set_autocompound/route.js
import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongo';

export async function POST(request) {
  const { status, address } = await request.json();

  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const collection = db.collection('users');

  try {
    
    await collection.updateOne(
      { address: address },
      { $set: { autoCompound: status } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}