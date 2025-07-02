// app/api/originator/route.js
import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongo';

export async function GET(request) {
  const { address } = await request.json();

  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const collection = db.collection('borrows');

  try {
    
    const user = await collection.findOne(
      { user: address }
    );

    return NextResponse.json({ success: true, user: user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
