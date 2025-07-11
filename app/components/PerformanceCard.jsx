'use client'

import { useEffect, useState } from 'react'
import { connectWallet } from "@/utils/wallet";
import { useDepositorAccount } from '@/hooks/useDepositorAccount'
import { usePerformance } from '@/hooks/usePerformance'
import Progressbar from "./Progressbar"

export default function AccountCard() {
  const { rewardAPR, isLoading } = useDepositorAccount()
  const { fetchTotalValue, collateralValue } = usePerformance()

  const [totalValue, setTotalValue] = useState('0')
  const [collateral, setCollateral] = useState('0')

  useEffect(() => {
    const fetchValues = async () => {
      const {signer} = await connectWallet();
      const total = await fetchTotalValue(signer)
      const col = await collateralValue()

      setTotalValue(total)
      setCollateral(col)
    }

    fetchValues()
  }, [])

  return (
    <div className="flex flex-col justify-between w-full h-[175px] border border-green bg-white rounded-[11px] shadow-[1px_3px_4px_0px_rgba(0,0,0,0.15)] p-[14px]">
      <p className='text-base font-medium leading-[22px]'>Performance Metrics</p>
      <div className='flex gap-1 h-[69px]'>
        <div className='flex flex-col items-center justify-center w-full h-full rounded-[6px] bg-[#F6F8F9]'>
          <p className='text-center font-medium leading-[30px] text-[#0A133999]'>Total Value Locked</p>
          <p className='text-center font-bold text-[24px] leading-[30px]'>${totalValue}</p>
        </div>
        <div className='flex flex-col items-center justify-center w-full h-full rounded-[6px] bg-[#F6F8F9]'>
          <p className='text-center font-medium leading-[30px] text-[#0A133999]'>Current APR</p>
          <p className='text-center font-bold text-[24px] leading-[30px]'>{isLoading ? '0' : rewardAPR}%</p>
        </div>
      </div>
      <div className='w-full'>
        <Progressbar progress={67} height={9} />
        <p className='text-center font-medium leading-[20px]'>Vault Capacity: ${collateral}</p>
      </div>
    </div>
  )
}
