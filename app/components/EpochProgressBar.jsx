'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import vaultAbi from '@/abis/Vault.json';

const AVERAGE_BLOCK_TIME_MS = 12 * 1000; // 12 seconds
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export default function EpochProgressBar() {
  const [progress, setProgress] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [startTimeMs, setStartTimeMs] = useState(0);

  useEffect(() => {
    let interval;

    async function getEpochBlocks() {
      const vault = new ethers.Contract(vaultAddress, vaultAbi, provider);
      const epoch = await vault.currentEpoch();
      
      const startBlock = Number(epoch.startBlock);
      const endBlock = Number(epoch.endBlock);
      
      const durationMs = (endBlock - startBlock) * AVERAGE_BLOCK_TIME_MS;

      const block = await provider.getBlock(startBlock);
      const startTimestampMs = Number(block.timestamp) * 1000;
      setStartTimeMs(startTimestampMs);
      
      const endTimestampMs = startTimestampMs + durationMs;

      interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, endTimestampMs - now);
        
        const progressPercent = Math.min(100, ((durationMs - timeLeft) / durationMs) * 100);

        setTimeLeftMs(timeLeft);
        setProgress(progressPercent);
      }, 60000);
    }

    getEpochBlocks();

    return () => clearInterval(interval);
  }, []);

  const formattedTimeLeft = formatDuration(
    intervalToDuration({ start: 0, end: timeLeftMs }),
    { format: ['minutes', 'seconds'] }
  );

  const formattedStart = startTimeMs
    ? format(startTimeMs, 'MMM d, yyyy HH:mm')
    : 'Loading...';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-sm text-gray-500">
        <span className="text-left">{formattedStart}</span>
        <span className="text-right">{formattedTimeLeft || 'Completed'}</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
