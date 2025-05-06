import { WalletInfo } from '../types/wallet';

interface WalletDisplayProps {
  walletInfo: WalletInfo | null;
}

const WalletDisplay = ({ walletInfo }: WalletDisplayProps) => {
  if (!walletInfo) {
    return (
      <div className="wallet-info">
        <p>No wallet connected. Click "Connect Wallet" to connect your wallet.</p>
      </div>
    );
  }

  return (
    <div className="wallet-info">
      <h2>Wallet Information</h2>
      <p><strong>Address:</strong> {walletInfo.address}</p>
      <p><strong>Balance:</strong> {walletInfo.balance}</p>
      {walletInfo.network && (
        <p><strong>Network:</strong> {walletInfo.network}</p>
      )}
    </div>
  );
};

export default WalletDisplay;
