// app/api/settings/route.js
import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongo';

export async function GET() {

  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  const collection = db.collection('settings');

  try {
    const settings = await collection.findOne({});

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}