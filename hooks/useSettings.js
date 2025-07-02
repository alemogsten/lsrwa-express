'use client';

import { useState, useEffect } from "react";
import axios from 'axios';


export function useSettings() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [epochDuration, setEpochDuration] = useState(0);
  const [rewardAPR, setRewardAPR] = useState(0);
  const [maxEpochsBeforeLiquidation, setMaxEpoch] = useState(0);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/settings');
      const settings = res.data.settings;
      if (settings) {
        setEpochDuration(settings.epochDuration);
        setRewardAPR(settings.rewardAPR);
        setMaxEpoch(settings.maxEpochsBeforeLiquidation);
      }
    } catch (err) {
        console.error("Failed to process requests:", err);
        setError(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
      fetchSettings();
    }, []);

  const refetch = async() => {
    await fetchSettings();
  }
  return {
    rewardAPR: rewardAPR * 0.01,
    epochDuration,
    maxEpochsBeforeLiquidation,
    refetch,
    isLoading,
    error,
  };
}
