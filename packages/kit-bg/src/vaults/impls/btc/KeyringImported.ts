import coreChainApi from '@onekeyhq/core/src/instance/coreChainApi';
import {
  type ISignedMessagePro,
  type ISignedTxPro,
} from '@onekeyhq/core/src/types';

import { KeyringImportedBase } from '../../base/KeyringImportedBase';

import type { IDBAccount } from '../../../dbs/local/types';
import type {
  IExportAccountSecretKeysParams,
  IExportAccountSecretKeysResult,
  IGetPrivateKeysParams,
  IGetPrivateKeysResult,
  IPrepareImportedAccountsParams,
  ISignMessageParams,
  ISignTransactionParams,
} from '../../types';

export class KeyringImported extends KeyringImportedBase {
  override coreApi = coreChainApi.btc.imported;

  override async getPrivateKeys(
    params: IGetPrivateKeysParams,
  ): Promise<IGetPrivateKeysResult> {
    return this.baseGetPrivateKeys(params);
  }

  override async exportAccountSecretKeys(
    params: IExportAccountSecretKeysParams,
  ): Promise<IExportAccountSecretKeysResult> {
    return this.baseExportAccountSecretKeys(params);
  }

  override async prepareAccounts(
    params: IPrepareImportedAccountsParams,
  ): Promise<IDBAccount[]> {
    return this.basePrepareAccountsImportedUtxo(params);
  }

  override async signTransaction(
    params: ISignTransactionParams,
  ): Promise<ISignedTxPro> {
    return this.baseSignTransactionBtc(params);
  }

  override async signMessage(
    params: ISignMessageParams,
  ): Promise<ISignedMessagePro> {
    return this.baseSignMessageBtc(params);
  }
}
