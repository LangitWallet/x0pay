export type IClearCacheOnAppState = {
  tokenAndNFT: boolean;
  transactionHistory: boolean;
  swapHistory: boolean;
  browserCache: boolean;
  browserHistory: boolean;
  connectSites: boolean;
  signatureRecord: boolean;
};

export enum EReasonForNeedPassword {
  CreateOrRemoveWallet = 'CreateOrRemoveWallet',
  CreateTransaction = 'CreateTransaction',
  LightningNetworkAuth = 'LightningNetworkAuth',
  Security = 'Security',
  Default = 'Default', // Default is for the case that the reason is not specified
}
