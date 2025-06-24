'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

import ProcessRequests from '../components/admin/ProcessRequests';
import ProcessEpoch from '../components/admin/ProcessEpoch';
import EpochProgressBar from '../components/EpochProgressBar';
import EpochDurationManager from '../components/admin/EpochDurationManager';
import RewardAPRManager from '../components/admin/RewardAprManager';
import MaxEpochSetting from '../components/admin/MaxEpochSetting';
import CollateralRatioSetting from '../components/admin/CollateralRatioSetting';

export default function AdminDashboard() {

    return (
        <div className="p-6 space-y-6">
            <ProcessRequests />
            <div className='mt-10'>
                <RewardAPRManager />
            </div>
            <div className='mt-10'>
                <MaxEpochSetting />
            </div>
            <div className='mt-10'>
                <CollateralRatioSetting />
            </div>
            <div className='mt-10'>
                <EpochDurationManager />
            </div>
            <div className='mt-10'>
                <ProcessEpoch />
            </div>
            
        </div>
    );
}
