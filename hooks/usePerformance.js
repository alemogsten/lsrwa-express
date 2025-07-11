import { ethers, parseUnits, formatUnits } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import vaultAbi from '@/abis/Vault.json';
import usdcAbi from "@/abis/ERC20.json";
import {formatNumber} from '@/utils/helper'

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export function usePerformance() {

  const fetchTotalValue = async (signer) => {
    
    const vault = new ethers.Contract(VAULT_ADDRESS, vaultAbi, signer);

    let users = [];
    const depsoitEvents = await vault.queryFilter("DepositApproved", 0, "latest");
    
    for (const event of depsoitEvents) {
      const { requestId, user, amount } = event.args;
      if (!users.includes(user)) {
        users.push(user);
      }
    }

    const totalValue = await vault.totalDepositValue(users);
    return formatNumber(formatUnits(totalValue, parseInt(process.env.NEXT_PUBLIC_USDC_DECIMALS || '6')));
  }

  const collateralValue = async () => {
    
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC);
    const token = new ethers.Contract(process.env.NEXT_PUBLIC_TOKEN_ADDRESS, usdcAbi, provider);
    let poolToken = await token.balanceOf(VAULT_ADDRESS);
    poolToken = formatUnits(poolToken, 18);
    const tokenPrice = parseFloat(process.env.NEXT_PUBLIC_TOKEN_PRICE || '1');

    return formatNumber(poolToken*tokenPrice);
  }

  return {
    fetchTotalValue,
    collateralValue
  };
}
