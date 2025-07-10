'use client';

import { useEffect, useState } from 'react';
import { useRequests } from '@/hooks/useRequests';
import { connectWallet } from "@/utils/wallet";

export default function ProcessRequests() {
    const {fetchRequests, processRequests} = useRequests();

    const [requests, setRequests] = useState([]);
    const [processed, setStatus] = useState(false);
    const [type, setType] = useState(0);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const [processingRequests, setProcessingRequests] = useState(false);
    const handleProcessRequests = async () => {
        setProcessingRequests(true);
        try {
            const { signer } = await connectWallet();
            await processRequests(signer);
            alert("Requests processed!");
            fetchRequest();
        } catch (err) {
            console.error("Failed to process requests:", err);
            alert("Error processing requests");
        } finally {
            setProcessingRequests(false);
        }
    };

    const fetchRequest = async () => {
        const { signer } = await connectWallet();
        const {data, total} = await fetchRequests(signer, type, processed, page, limit);
        setRequests(data);
        setTotal(total);
    };

    useEffect(() => {
        fetchRequest();
    }, [processed, type, page]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-6 space-y-6">
            <div className="flex gap-4 items-center">
                <select key={1} value={processed} onChange={(e) => setStatus(e.target.value === 'true')} className="p-2 border rounded">
                    <option value="false">Pending</option>
                    <option value="true">Completed</option>
                </select>
                <select  key={2} value={type} onChange={(e) => setType(e.target.value)} className="p-2 border rounded">
                    <option value="0">All Types</option>
                    <option value="1">Deposit</option>
                    <option value="2">Withdraw</option>
                </select>
                <button
                    onClick={handleProcessRequests}
                    disabled={processingRequests}
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
                            <tr key={req.requestId} className="border-t hover:bg-gray-50">
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
