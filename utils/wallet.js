// src/utils/wallet.js
import { ethers } from "ethers";

export async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not detected");
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { provider, signer };
}
