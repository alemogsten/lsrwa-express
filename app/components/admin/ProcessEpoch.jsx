'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAdminSummary } from '@/hooks/useAdminSummary';
import EpochProgressBar from '../EpochProgressBar';

export default function ProcessEpoch() {
    const {refetch} = useAdminSummary();
    const [processingEpoch, setProcessingEpoch] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const handleProcessEpoch = async () => {
        setProcessingEpoch(true);
        try {
            const res = await axios.post('/api/admin/process-epoch');
            alert(res.data.success ? "Epoch processed!" : "Failed!");
            setRefresh(true);
            refetch();
        } catch (err) {
            console.error("Failed to process epoch:", err);
            alert("Error processing epoch");
        } finally {
            setProcessingEpoch(false);
        }
    };

    return (
        <div className="">
            <div className='flex justify-between '>
                <p className='font-bold text-base'>Epoch Information</p>
                <button
                    onClick={handleProcessEpoch}
                    disabled={processingEpoch}
                    className={`hidden px-4 py-2 flex items-center gap-2 rounded text-white ${
                        processingEpoch ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {processingEpoch ? 'Processing...' : 'Process Epoch'}
                </button>
            </div>
            <EpochProgressBar refresh={refresh}/>
            
        </div>
    );
}
