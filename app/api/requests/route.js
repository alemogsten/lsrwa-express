// app/api/requests/route.js
import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';
// import { useDepositorRequests } from "@/hooks/useDepositorRequests";


export async function POST(request) {
  const { address } = await request.json();
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);
  
  const requests = await db
    .collection('requests')
    .find({ user: address })
    .sort({ timestamp: -1 })
    .toArray();

  // const [requests, isLoading] = useDepositorRequests(address);

  return NextResponse.json({ requests });
}
