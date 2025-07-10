'use client';

import { useEffect, useState } from 'react';
import { useBorrows } from '@/hooks/useBorrows';
import { connectWallet } from "@/utils/wallet";

export default function Borrows() {
    const {fetchBorrows} = useBorrows();

    const [requests, setRequests] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const fetchRequests = async () => {
        const { signer, address } = await connectWallet();
        const {data, total} = await fetchBorrows(signer, page, limit, address);
        setRequests(data);
        setTotal(total);
    };

    useEffect(() => {
        fetchRequests();
    }, [page]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-6 space-y-6">
            <h2 className='text-lg font-bold'>Borrows</h2>
            <div className="overflow-auto rounded-lg shadow border">
                <table className="w-full table-auto text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-2">User</th>
                            <th className="px-4 py-2">Amount</th>
                            <th className="px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req, index) => (
                            <tr key={index} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{req.user}</td>
                                <td className="px-4 py-2">${req.amount}</td>
                                <td className="px-4 py-2">
                                    {req.repaid ? 'Repaid' : (req.approved ? 'Lending': 'Pending')}
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
