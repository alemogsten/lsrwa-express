'use client';

import { useState, useEffect } from "react";
import { useAccount } from 'wagmi';
import axios from 'axios';

export function useDepositorAccount() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [compounding, setCompounding] = useState(false);
  const [autocompounding, setAutoCompounding] = useState(false);
  const [harvesting, setHarvesting] = useState(false);
  const [deposited, setDeposit] = useState(0);
  const [autoCompound, setAutoCompound] = useState(false);
  const [reward, setReward] = useState(0);
  const { address } = useAccount();

  const fetchAccount = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/depositor', { params: {address:address} });
      const user = res.data.user;
      if(user) {
        setDeposit(parseFloat(user.deposit));
        setReward(parseFloat(user.reward));
        setAutoCompound(user.autoCompound);
      }
    } catch (err) {
        console.error("Failed to fetch account:", err);
        setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if(address && !isLoading)
    fetchAccount();
  }, [address]);

  const handleAutoCompound = async (status) => {
    try {
      setAutoCompounding(true);
      const res = await axios.post('/api/depositor/set_autocompound', {address, status});
    } catch (err) {
        console.error("Failed to set autocompound:", err);
        setError(err);
    } finally {
      setAutoCompounding(false);
    }
  }

  const compound = async () => {
    setCompounding(true);
    try {
      const res = await axios.post('/api/depositor/compound', {address});
      await fetchAccount();
    } catch (err) {
      console.error('Update failed:', err);
      setError(err);
    } finally {
      setCompounding(false);
    }
  }

  const harvestReward = async () => {
    setHarvesting(true);
    try {
      const res = await axios.post('/api/depositor/harvest-reward', {address, reward});
      await fetchAccount();
    } catch (err) {
      console.error('Update failed:', err);
      setError(err);
    } finally {
      setHarvesting(false);
    }
  }

  return {
    deposited,
    reward,
    autoCompound,
    autocompounding,
    handleAutoCompound,
    compound,
    compounding,
    harvestReward,
    harvesting,
    isLoading,
    error,
  };
}
