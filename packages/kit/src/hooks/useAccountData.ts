import type { IDBWallet } from '@onekeyhq/kit-bg/src/dbs/local/types';
import type { IVaultSettings } from '@onekeyhq/kit-bg/src/vaults/types';
import type { IServerNetwork } from '@onekeyhq/shared/types';
import type { INetworkAccount } from '@onekeyhq/shared/types/account';

import backgroundApiProxy from '../background/instance/backgroundApiProxy';

import { usePromiseResult } from './usePromiseResult';

import type { IPromiseResultOptions } from './usePromiseResult';

type IUseAccountDataResult = {
  account: INetworkAccount | undefined;
  network: IServerNetwork | undefined;
  wallet: IDBWallet | undefined;
  vaultSettings: IVaultSettings | undefined;
};

export function useAccountData<T extends IUseAccountDataResult>({
  accountId,
  networkId,
  walletId,
  options,
}: {
  accountId?: string;
  networkId?: string;
  walletId?: string;
  options?: IPromiseResultOptions<T>;
}) {
  const { serviceAccount, serviceNetwork } = backgroundApiProxy;
  const { result, isLoading, run } = usePromiseResult<IUseAccountDataResult>(
    async () => {
      const [account, network, wallet, vaultSettings] = await Promise.all([
        accountId && networkId
          ? serviceAccount.getAccount({
              accountId,
              networkId,
            })
          : undefined,
        networkId
          ? serviceNetwork.getNetwork({
              networkId,
            })
          : undefined,
        walletId
          ? serviceAccount.getWallet({
              walletId,
            })
          : undefined,
        networkId ? serviceNetwork.getVaultSettings({ networkId }) : undefined,
      ]);
      const obj: IUseAccountDataResult = {
        account,
        network,
        wallet,
        vaultSettings,
      };
      return obj;
    },
    [accountId, networkId, serviceAccount, serviceNetwork, walletId],
    {
      initResult: {
        account: undefined,
        network: undefined,
        wallet: undefined,
        vaultSettings: undefined,
      },
      ...options,
    },
  );

  const { account, wallet, network, vaultSettings } = result;
  return {
    account,
    wallet,
    network,
    vaultSettings,
    run,
    isLoading,
  };
}
