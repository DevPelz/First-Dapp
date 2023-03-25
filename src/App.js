import React, { useState, useEffect } from "react";
import ADDRESS from "./contracts/Token-address.json";
import ABI from "./contracts/Token.json";
import { ethers } from "ethers";
import "./App.css";
import axios from "axios";
import BigNumber from "bignumber.js";

const MATIC_DECIMALS = 18;
const MUMBAI_CHAIN_ID = 80001;

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [tokenUri, setTokenUri] =useState(null);
  const [nfts, setNfts] = useState([])
  const [notifMessage, setNotifMessage]  = useState(null);


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

  const fetchNfts = async () => {
    if (parseInt(chainId) != MUMBAI_CHAIN_ID){
      setNotifMessage("Please switch to Polygon Mumbai network");
      return;
    }
    setNotifMessage("Loading dapp..")
    try{
      const {ethereum} = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bal = Number(await signer.getBalance()).toString();
        const tokenContract = new ethers.Contract(ADDRESS.Token, ABI.abi, signer);

        const tokenlength = Number(await tokenContract.tokenCounter())
        const _tokens = [];
        for (let counter = 0; counter < tokenlength; counter++){
          const tokenUri = await tokenContract.tokenURI(counter)
          const tokenMeta = await axios.get(tokenUri);
          _tokens.push(tokenMeta.data)
        }
        setWalletBalance(bal);
        setNfts(_tokens)
      }else{
        console.log("Metamask not installed")
      }
    }catch (e){
      console.log(e)
    }finally{
      setNotifMessage(null)
    }
  }

  const mintNft = async () => {
    if (!tokenUri){
      setNotifMessage("Please enter valid token URI");
      return;
    }

    if(!walletAddress){
      setNotifMessage("Please connect Metamask to comtinue");
      return;
    }
    
    if(parseInt(chainId) != MUMBAI_CHAIN_ID){
      setNotifMessage("Please switch network to Polygon Mumbai");
      return;
    }

    setNotifMessage("Minting NFT🔥🔥🔥")

    try {
      const {ethereum} = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(ADDRESS.Token, ABI.abi, signer);
        const txn = await tokenContract.safeMint(tokenUri);
        await txn.wait(1);
        
        setNotifMessage("Successfully minted nft🚀🚀🚀");

        await fetchNfts();
      }
    }catch(e){
      console.log(e)
    }
  }

  useEffect(() => {
    if (walletAddress && chainId){
      fetchNfts()
    }
  }, [walletAddress, chainId])

  useEffect(() => {
    checkWalletStatus();
  }, []);

  return (
    <div className="app">
      {notifMessage && (
        <div className="notice">
          <span className="msg">{notifMessage}</span>{" "}
          <span onClick={() => setNotifMessage(null)} className="close">
            &times;
          </span>
        </div>
      )}
      <div className="nav">
        {walletAddress ? (
          <>
            <div className="nav_bal">{new BigNumber(walletBalance).shiftedBy(-MATIC_DECIMALS).toFixed(2)} MATIC</div>
            <div className="nav_address">{walletAddress}</div>
          </>
        ) : (
          <div className="nav_connect" onClick={() => connectWallet()}>
            Connect
          </div>
        )}
      </div>
      <div className="mint-form">
        <input
          onChange={(e) => setTokenUri(e.target.value)}
          placeholder="Enter NFT CID here"
        />
        <button onClick={() => mintNft()}>Mint</button>
      </div>
      <div className="nft-list">
        {nfts.length > 0 ? (
          nfts.map((nft) => (
            <div className="nft-card">
              <img src={nft.image} />
              <div className="nft-card_details">
                <div className="nft-name">{nft.name}</div>
                <div className="nft-desc">{nft.description}</div>
              </div>
            </div>
          ))
        ) : (
          <div>You have not minted any NFT yet</div>
        )}
      </div>
    </div>
  );
}

export default App;
