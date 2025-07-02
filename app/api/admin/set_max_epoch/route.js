// app/api/admin/set_max_epoch/route.js
import { NextResponse } from "next/server";
import clientPromise from '@/lib/mongo';

export async function POST(request) {
  try {
    const {value} = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB);
    const collection = db.collection('settings');
    await collection.updateOne({}, {$set: {maxEpochsBeforeLiquidation: value}});

    return NextResponse.json({ status: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
