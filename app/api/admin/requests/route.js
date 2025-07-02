// app/api/admin/requests/route.js
import clientPromise from '@/lib/mongo';

export async function GET(request) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const status = url.searchParams.get('status'); // 'pending', 'approved', 'executed'
  const type = url.searchParams.get('type');     // 'deposit' or 'withdraw'

  const query = {};
  if (status === 'pending') {query.processed = false;}
  if (status === 'completed') query.processed = true;
  if (status === 'executed') query.executed = true;
  if (type === 'deposit' || type === 'withdraw') query.isWithdraw = type === 'withdraw';

  const total = await db.collection('requests').countDocuments(query);
  const requests = url.searchParams.get('page') ? await db
    .collection('requests')
    .find(query)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray() : 
    await db
    .collection('requests')
    .find(query)
    .sort({ timestamp: -1 })
    .toArray();

  return Response.json({ data: requests, total });
}
