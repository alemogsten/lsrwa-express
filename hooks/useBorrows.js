'use client';

import { useReadContracts } from 'wagmi';
import { formatUnits } from "ethers";
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC;
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);

export function useBorrows() {

  const fetchBorrowers = async() => {

    const latestBlock = await provider.getBlockNumber();
    const startBlock = 0n;
  
    const borrowEvents = await vault.queryFilter("BorrowRequested", startBlock, latestBlock);

    let borrowers;

    for (const event of borrowEvents) {
      const { user, amount } = event.args;
      if (!borrowers.includes(user)) {
        borrowers.push(user);
      }
    }
    return borrowers;
  }

  const fetchBorrows = async (repaid, page, limit, owner, isAdmin) => {
    const borrowers = isAdmin ? await fetchBorrowers() : [owner];
    const { data: borrows, isLoading, error } = useReadContracts({
        contracts: [
          {
            abi: vaultAbi,
            address: VAULT_ADDRESS,
            functionName: 'getBorrowRequests',
            args: [borrowers, repaid, page, limit]
          }
        ],
        allowFailure: false,
      });

    console.log('borrows', borrows);
    return {borrows, isLoading, error}
  }

  return {
    fetchBorrows,
  };
}
