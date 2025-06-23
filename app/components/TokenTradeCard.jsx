'use client';

import { useState } from 'react';
import Image from 'next/image';
import VerifyForm from "./VerifyForm";

export default function TradeBox() {
  const [mode, setMode] = useState('buy');
  const [sourceToken, setSourceToken] = useState('RWA');
  const [destinationToken, setDestinationToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const price = 1.05; // 1 LSRWA = 1.05 USDC
  const destinationAmount =
    mode === 'buy'
      ? (parseFloat(amount || '0') / price).toFixed(4)
      : (parseFloat(amount || '0') * price).toFixed(2);

  const handleSwapTokens = () => {
    setSourceToken(destinationToken);
    setDestinationToken(sourceToken);
    setAmount('');
  };

  return (
    <div className="w-full p-6 bg-white shadow-lg rounded-2xl space-y-6">
      <p className='font-bold text-[24px] leading-[30px] mb-0'>Swap Token</p>
      <p className='text-gray-500'>Trade tokens in an instant</p>
      {/* Mode Toggle */}
      <div className="flex justify-between">
        <button
          onClick={() => setMode('buy')}
          className={`w-1/2 py-2 font-semibold rounded-l-xl ${
            mode === 'buy' ? 'bg-[#0A1339] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`w-1/2 py-2 font-semibold rounded-r-xl ${
            mode === 'sell' ? 'bg-[#0A1339] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Source Input */}
      <div className="space-y-1">
        <label className="text-sm text-gray-500">{sourceToken} Amount</label>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-lg"
        />
      </div>

      {/* Swap Icon */}
      <div className="flex justify-center">
        <button
          onClick={handleSwapTokens}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
        ><Image src="/assets/Up-down.svg"
            alt="contract"
            width={24}
            height={24}
            priority />
        </button>
      </div>

      {/* Destination Display */}
      <div className="">
        <label className="text-sm text-gray-500">{destinationToken}</label>
        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-lg">
          {destinationAmount}
        </div>
      </div>

      {/* Price Display */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>Price</span>
        <span>
          1 {destinationToken} = {price} {sourceToken}
        </span>
      </div>

      {/* Action Button */}
      <button
        className={`w-full py-3 font-semibold text-white rounded-xl ${
          mode === 'buy' ? 'bg-green hover:bg-black' : 'bg-red-500 hover:bg-black'
        } transition`}
      >
        {mode === 'buy' ? `Buy ${destinationToken}` : `Sell ${sourceToken}`}
      </button>

      <div className='mt-6'>
        <VerifyForm />
      </div>
    </div>
  );
}
