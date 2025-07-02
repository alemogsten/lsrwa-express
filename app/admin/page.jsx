'use client';

import ProcessRequests from '../components/admin/ProcessRequests';
import ProcessEpoch from '../components/admin/ProcessEpoch';
import SettingForms from '../components/admin/SettingForms';
import LiquidityCard from '../components/admin/LiquidityCard';
import PendingWithdrawalCard from '../components/admin/PendingWithdrawalCard';
import LendingCard from '../components/admin/LendingCard';
import LiquidityTokenCard from '../components/admin/LiquidityTokenCard';
// import TopupUSDC from '../components/admin/TopupUSDC';

import { useAdminSummary } from '@/hooks/useAdminSummary';
import { useSettings } from '@/hooks/useSettings';

export default function AdminDashboard() {
    const {
        poolUSDC,
        borrowingUSDC,
        poolLSRWA,
        repaymentRequiredEpochId,
        currentEpochId, 
        refetch
    } = useAdminSummary();

    const {maxEpochsBeforeLiquidation, epochDuration} = useSettings();

    return (
        <div className="p-6 space-y-6">
            <div className='grid grid-cols-4 gap-2'>
                <LiquidityCard poolUSDC={poolUSDC}/>
                <PendingWithdrawalCard />
                <LendingCard 
                    borrowingUSDC={borrowingUSDC} 
                    repaymentRequiredEpochId={repaymentRequiredEpochId}
                    currentEpochId={currentEpochId}
                    maxEpochsBeforeLiquidation={maxEpochsBeforeLiquidation}
                    refetch={refetch}
                />
                <LiquidityTokenCard 
                    poolLSRWA={poolLSRWA} 
                    borrowingUSDC={borrowingUSDC} 
                    repaymentRequiredEpochId={repaymentRequiredEpochId}
                    currentEpochId={currentEpochId}
                    maxEpochsBeforeLiquidation={maxEpochsBeforeLiquidation}
                    refetch={refetch}
                />
            </div>
            <ProcessRequests />
            <SettingForms />
            <div className='mt-10'>
                <ProcessEpoch refetch={refetch} epochDuration={epochDuration}/>
            </div>
            
        </div>
    );
}
