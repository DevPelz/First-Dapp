import React, { useState, useEffect } from "react";
import ADDRESS from "./contracts/Token-address.json";
import ABI from "./contracts/Token.json";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Check if Metamask is already connected, then set user account
  const checkWalletStatus = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Metamask not installed");
      return;
    } else {
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) setWalletAddress(accounts[0]);

      const chainId = await ethereum.request({ method: "eth_chainId" });
      setChainId(chainId);

      ethereum.on("chainChanged", handleChainChange);

      function handleChainChange(_chainId) {
        window.location.reload();
      }
    }
  };

  // Connect Metamask to dapp
  const connectWallet = async () => {
    try {

      // Check if Metamask is installed
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please install Metamask wallet");
        return;
      } else {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    checkWalletStatus();
  }, []);

  return (
    <div className="app">
      <div className="nav">
        {walletAddress ? (
          <div className="nav_address">{walletAddress}</div>
        ) : (
          <div className="nav_connect" onClick={() => connectWallet()}>
            Connect
          </div>
        )}
      </div>
      <div className="mint-form">
        <input placeholder="Enter NFT CID here" />
        <button>Mint</button>
      </div>
      <div className="nft-list">
      {/* List of all minted NFTs */}
      </div>
    </div>
  );
}

export default App;
