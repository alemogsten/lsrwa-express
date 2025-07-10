'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import vaultAbi from '@/abis/Vault.json';

const AVERAGE_BLOCK_TIME_MS = process.env.NEXT_PUBLIC_BLOCK_TIME * 1000;
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export default function EpochProgressBar({refresh=false}) {
  const [progress, setProgress] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [startTimeMs, setStartTimeMs] = useState(0);
  const [endTimestampMs, setEndTimestampMs] = useState(0);

  useEffect(() => {
    let interval;

    async function getEpochBlocks() {
      const vault = new ethers.Contract(vaultAddress, vaultAbi, provider);
      const epochDuration = Number(await vault.epochDuration());
      const startBlock = await vault.epochStart();
      
      const durationMs = epochDuration * AVERAGE_BLOCK_TIME_MS;

      const block = await provider.getBlock(startBlock);
      const startTimestampMs = Number(block.timestamp) * 1000;
      setStartTimeMs(startTimestampMs);
      
      const endTimestampMs = startTimestampMs + durationMs;
      setEndTimestampMs(endTimestampMs)
      displayTime()
      function displayTime() {
        const now = Date.now();
        
        const timeLeft = Math.max(0, endTimestampMs - now);
        
        const progressPercent = Math.min(100, ((durationMs - timeLeft) / durationMs) * 100);

        setTimeLeftMs(timeLeft);
        setProgress(progressPercent);
      }

      interval = setInterval(() => {
        displayTime();
      }, 60000);
    }

    getEpochBlocks();

    return () => clearInterval(interval);
  }, [refresh]);

  const formattedTimeLeft = formatDuration(
    intervalToDuration({ start: 0, end: timeLeftMs }),
    { format: ['days','hours','minutes', 'seconds'] }
  );

  const formattedStartDate = startTimeMs
    ? format(startTimeMs, 'MMM d, yyyy')
    : 'Loading...';
  const formattedStartTime = startTimeMs
    ? format(startTimeMs, 'HH:mm')
    : 'Loading...';
  const formattedEnd = endTimestampMs
    ? format(endTimestampMs, 'MMM d, yyyy HH:mm')
    : 'Loading...';

  return (
    <div className='lg:flex justify-between gap-2 w-full mt-4 items-center whitespace-nowrap'>
      <div className='flex gap-2'>
        <div className='text-center'>
          <p className='font-bold text-center'>{formattedStartDate}</p>
          <p className='font-medium text-gray text-center'>Start Date</p>
        </div>
        <div className='text-center'>
          <p className='font-bold text-center'>{formattedStartTime} UTC</p>
          <p className='font-medium text-gray text-center'>Start Time</p>
        </div>
      </div>
      <div className="w-full h-3 bg-[#DEF1E6] rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className='text-center'>
        <p className='font-bold text-center'>{formattedTimeLeft}</p>
        <p className='font-medium text-gray text-center'>Expected Next Epoch In</p>
      </div>
    </div>
  );
}
