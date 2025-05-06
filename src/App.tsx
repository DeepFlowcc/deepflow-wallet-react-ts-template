import React, { useState, useEffect } from 'react';
import useEthereumProxy from "./hook/useEthereumProxy";
import WalletDisplay from './components/WalletDisplay';
import { WalletInfo } from './types/wallet';
import {ethers} from "ethers";

const App: React.FC = () => {
  const { ethereum } = useEthereumProxy();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null); // 钱包信息
  const [isConnecting, setIsConnecting] = useState(false); // 连接状态


  // Handle wallet connection
  const handleConnect = async () => {
    try {
      setIsConnecting(true);

      await getAccounts();
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = () => {
    setWalletInfo(null);
  };

  const getAccounts = async () => {
    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        const address = accounts[0] as string;
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        const network = getNetworkName(chainId);
        setWalletInfo({
          address,
          balance: "Loading...",
          network: network,
          connected: true
        });

        getBalance(address)
            .then(({ balance, error }) => {

              setWalletInfo(prev => ({
                ...prev,
                balance: error ? "Error" : balance || "0"
              }));

              if (error) {
                console.warn('Balance Error:', error);
              } else {
                console.log('Balance Updated:', balance, 'ETH');
              }
          });


      }
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  };

  const getBalance = async (
      address: string,
      timeout = 15000
  ): Promise<{ balance: string | null; error: string | null }> => {
    try {

      const balancePromise = ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      const balanceHex = await Promise.race([
        balancePromise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
        )
      ]);
      const balance = ethers.utils.formatEther(balanceHex);
      return { balance, error: null };

    } catch (error) {
      console.error('Balance fetch error:', error);
      // 友好错误提示
      let errorMsg = 'Failed to get balance';
      if (error.message.includes('timeout')) {
        errorMsg = 'Network timeout - Please check your connection';
      } else if (error.message.includes('user rejected')) {
        errorMsg = 'Request rejected by wallet';
      }
      return { balance: null, error: errorMsg };
    }
  };

  function getNetworkName(chainId: string): string {
    const networks: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0x2a': 'Kovan Testnet',
      '0x89': 'Polygon Mainnet',
      '0x38': 'Binance Smart Chain',
      '0xaa36a7': 'Sepolia Testnet',
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  }


  // 消息监听器
  // useEffect(() => {
  //   const handleMessage = (event: MessageEvent) => {
  //     // 处理MetaMask提供者消息
  //     if (event.data?.target === "metamask-inpage") {
  //       const providerData = event.data.data;

  //       // 网络变更事件
  //       if (providerData?.method === "metamask_chainChanged") {
  //         const chainId = providerData.params?.chainId;
  //         // 根据chainId设置网络名称
  //         let networkName = "Unknown Network";
  //         switch (chainId) {
  //           case "0x1": networkName = "Ethereum Mainnet"; break;
  //           case "0x3": networkName = "Ropsten Testnet"; break;
  //           case "0x4": networkName = "Rinkeby Testnet"; break;
  //           case "0x5": networkName = "Goerli Testnet"; break;
  //           case "0x2a": networkName = "Kovan Testnet"; break;
  //           case "0x89": networkName = "Polygon Mainnet"; break;
  //           case "0x38": networkName = "Binance Smart Chain"; break;
  //         }

  //         // 更新钱包网络信息
  //         setWalletInfo(prev => prev ? {...prev, network: networkName} : prev);
  //       }

  //       // 账户变更事件
  //       if (providerData?.method === "metamask_accountsChanged") {
  //         const accounts = providerData.params;
  //         if (accounts?.length > 0) {
  //           // 更新钱包地址
  //           setWalletInfo(prev => prev ? {...prev, address: accounts[0]} : prev);
  //         } else {
  //           // 断开连接
  //           setWalletInfo(null);
  //         }
  //       }
  //     }
  //   };

  //   window.addEventListener('message', handleMessage);
  //   return () => window.removeEventListener('message', handleMessage);
  // }, [walletInfo]);

  return (
      <div className="container">
        <h1>Wallet Connection Demo</h1>

        <div>
          <button
              onClick={handleConnect}
              disabled={isConnecting || (walletInfo?.connected || false)}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          <button
              onClick={handleDisconnect}
              disabled={!(walletInfo?.connected || false)}
          >
            Disconnect Wallet
          </button>
        </div>

        <WalletDisplay walletInfo={walletInfo} />

      </div>
  );
};

export default App;
