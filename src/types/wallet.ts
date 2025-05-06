export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  connected: boolean;
}

export interface WalletMessage {
  type: string;
  data?: WalletInfo;
  error?: string;
}
