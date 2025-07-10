'use client';

import { formatUnits, ethers } from "ethers";
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export function useBorrows() {
  
  const fetchBorrowers = async(vault) => {

    const borrowEvents = await vault.queryFilter("BorrowRequested", 0, "latest");

    let borrowers = [];

    for (const event of borrowEvents) {
      const [ user, amount ] = event.args;
      if (!borrowers.includes(user)) {
        borrowers.push(user);
      }
    }
    return borrowers;
  }

  const fetchBorrows = async (signer, page=1, limit=10, owner='', isAdmin=true) => {
    const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);
    const borrowers = isAdmin ? await fetchBorrowers(vault) : [owner];
    console.log('borrowers', borrowers);
    let requests = [];
    if (borrowers.length > 0) {
      const data = await vault.getBorrowRequests(borrowers);
        console.log('borrows', data);
        
        requests = data.map((item, index) => ({
          user: borrowers[index],
          amount: formatUnits(item[0], parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS)),
          repaid: item[1],
          approved: item[2]
        }));
        requests = requests.filter(item => !item.repaid)
        requests = requests.slice((page-1)*limit, limit);
    }

      return { data: requests, total:borrowers.length};
  }

  return {
    fetchBorrows,
  };
}
