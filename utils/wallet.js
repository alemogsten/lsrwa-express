// src/utils/wallet.js
import { ethers } from "ethers"

let _provider = null
let _signer = null

export async function connectWallet() {
  if (typeof window === "undefined") return null

  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not detected")
    return null
  }

  if (_provider && _signer) {
    return { provider: _provider, signer: _signer }
  }

  _provider = new ethers.BrowserProvider(window.ethereum)
  await _provider.send("eth_requestAccounts", [])
  _signer = await _provider.getSigner()
  return { provider: _provider, signer: _signer }
}
