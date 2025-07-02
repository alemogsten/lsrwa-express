// app/api/depositor/route.js
import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongo';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const collection = db.collection('users');

  try {
    
    const user = await collection.findOne(
      { address: address }
    );

    return NextResponse.json({ success: true, user: user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
