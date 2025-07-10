import { useAccount, useReadContracts } from 'wagmi';
import { formatUnits } from "ethers";
import vaultAbi from '@/abis/Vault.json';

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS;

export function useOriginatorAccount() {
  const { address } = useAccount();

  const { data, isLoading, refetch, error } = useReadContracts({
    contracts: [
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'collateralDeposits',
        args: [address],
      },
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'borrowRequests',
        args: [address],
      },
      {
        address: VAULT_ADDRESS,
        abi: vaultAbi,
        functionName: 'collateralRatio',
      },
      {
        abi: vaultAbi,
        address: VAULT_ADDRESS,
        functionName: 'repaymentRequired',
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!address,
    },
  });

  const deposited = formatUnits(data?.[0] ?? 0n, 18);
  const borrowRequest = data?.[1] ?? null;
  const borrowed = borrowRequest!= null && borrowRequest[1] == false && borrowRequest[2] == true ? formatUnits(borrowRequest[0], 18) : 0;
  const collateralRatio = Number(data?.[2]?? 0n) ;
  const repaymentRequired = data?.[3]?? false ;
  const repaid = !isLoading && borrowRequest[2] == false && Number(borrowRequest[1]) != 0 && repaymentRequired;

  return {
    deposited,
    borrowed,
    collateralRatio,
    repaymentRequired,
    repaid,
    refetch,
    isLoading,
    error,
  };
}
