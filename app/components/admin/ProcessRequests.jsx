'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProcessRequests() {
    const [requests, setRequests] = useState([]);
    const [status, setStatus] = useState('');
    const [type, setType] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const [processingRequests, setProcessingRequests] = useState(false);
    const handleProcessRequests = async () => {
        setProcessingRequests(true);
        try {
            const res = await axios.post('/api/admin/process-requests');
            alert(res.data.success ? "Requests processed!" : "Failed!");
            fetchRequests();
        } catch (err) {
            console.error("Failed to process requests:", err);
            alert("Error processing requests");
        } finally {
            setProcessingRequests(false);
        }
    };

    const fetchRequests = async () => {
        const params = new URLSearchParams({
            page,
            limit,
            ...(status && { status }),
            ...(type && { type }),
        });

        const res = await fetch(`/api/admin/requests?${params}`);
        const json = await res.json();
        setRequests(json.data);
        setTotal(json.total);
    };
    
    useEffect(() => {
        fetchRequests();
    }, [status, type, page]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-6 space-y-6">
            <div className="flex gap-4 items-center">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="executed">Executed</option>
                </select>
                <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded">
                    <option value="">All Types</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdraw">Withdraw</option>
                </select>
                <button
                    onClick={handleProcessRequests}
                    disabled={processingRequests || total === 0}
                    className={`px-4 py-2 flex items-center gap-2 rounded text-white ${
                        processingRequests ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 disabled:opacity-50' 
                    }`}
                >
                    {processingRequests ? 'Processing...' : 'Process Requests'}
                </button>
            </div>

            <div className="overflow-auto rounded-lg shadow border">
                <table className="w-full table-auto text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">User</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2">Amount</th>
                            <th className="px-4 py-2">Timestamp</th>
                            <th className="px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req._id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{req.requestId}</td>
                                <td className="px-4 py-2">{req.user}</td>
                                <td className="px-4 py-2 capitalize">{req.isWithdraw ? 'Withdraw' : 'Deposit'}</td>
                                <td className="px-4 py-2">${req.amount}</td>
                                <td className="px-4 py-2">{new Date(req.timestamp * 1000).toLocaleString()}</td>
                                <td className="px-4 py-2">
                                    {req.executed ? 'Executed' : req.processed ? 'Completed' : req.approved ? 'Approved' : 'Pending'}
                                </td>
                            </tr>
                        ))}
                        {requests.length == 0 && <tr className="border-t hover:bg-gray-50"><td className="px-4 py-2 text-center">No requests</td></tr>}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center pt-4">
                <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="text-sm">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
