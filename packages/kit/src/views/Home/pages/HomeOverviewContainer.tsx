import { useEffect, useRef, useState } from 'react';

import { useIntl } from 'react-intl';

import {
  IconButton,
  NumberSizeableText,
  Skeleton,
  Stack,
  XStack,
  useMedia,
} from '@onekeyhq/components';
import type { IDialogInstance } from '@onekeyhq/components';
import { useSettingsPersistAtom } from '@onekeyhq/kit-bg/src/states/jotai/atoms';
import {
  POLLING_DEBOUNCE_INTERVAL,
  POLLING_INTERVAL_FOR_TOTAL_VALUE,
} from '@onekeyhq/shared/src/consts/walletConsts';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import { numberFormat } from '@onekeyhq/shared/src/utils/numberUtils';
import type { INumberFormatProps } from '@onekeyhq/shared/src/utils/numberUtils';

import backgroundApiProxy from '../../../background/instance/backgroundApiProxy';
import { usePromiseResult } from '../../../hooks/usePromiseResult';
import { useActiveAccount } from '../../../states/jotai/contexts/accountSelector';
import { showBalanceDetailsDialog } from '../components/BalanceDetailsDialog';

import type { FontSizeTokens } from 'tamagui';
import { useAllTokenListMapAtom } from '../../../states/jotai/contexts/tokenList';

function HomeOverviewContainer() {
  const intl = useIntl();
  const num = 0;
  const {
    activeAccount: { account, network, wallet },
  } = useActiveAccount({ num });

  const [overviewState, setOverviewState] = useState({
    initialized: false,
    isRefreshing: false,
  });
  const [allToken] = useAllTokenListMapAtom();
  const [myBalance, setMyBalance] = useState(0);

  const [settings] = useSettingsPersistAtom();
  const overview = {};
  // const { result: overview } = usePromiseResult(
  //   async () => {
  //     if (!account || !network) return;
  //     const r =
  //       await backgroundApiProxy.serviceAccountProfile.fetchAccountDetails({
  //         networkId: network.id,
  //         accountId: account.id,
  //         withNetWorth: true,
  //         withNonce: false,
  //       });
  //     setOverviewState({
  //       initialized: true,
  //       isRefreshing: false,
  //     });
  //     return r;
  //   },
  //   [account, network],
  //   {
  //     debounced: POLLING_DEBOUNCE_INTERVAL,
  //     pollingInterval: POLLING_INTERVAL_FOR_TOTAL_VALUE,
  //   },
  // );

  const vaultSettings = {};
  // const { result: vaultSettings } = usePromiseResult(async () => {
  //   if (!network) return;
  //   const s = backgroundApiProxy.serviceNetwork.getVaultSettings({
  //     networkId: network.id,
  //   });
  //   return s;
  // }, [network]);

  useEffect(() => {
    if (allToken) {
      setMyBalance(
        Object.values(allToken).reduce((sum, item) => sum + item.fiatValue, 0),
      );
    }
  }, [allToken]);

  // useEffect(() => {
  //   if (account?.id && network?.id && wallet?.id) {
  //     setOverviewState({
  //       initialized: false,
  //       isRefreshing: true,
  //     });
  //   }
  // }, [account?.id, network?.id, wallet?.id]);
  const { md } = useMedia();
  const balanceDialogInstance = useRef<IDialogInstance | null>(null);

  if (overviewState.isRefreshing && !overviewState.initialized)
    return (
      <Stack py="$2.5">
        <Skeleton w="$40" h="$7" my="$2.5" />
      </Stack>
    );

  const balanceString = overview?.netWorth ?? '0';
  const balanceSizeList: { length: number; size: FontSizeTokens }[] = [
    { length: 25, size: '$headingXl' },
    { length: 13, size: '$heading4xl' },
  ];
  const defaultBalanceSize = '$heading5xl';
  const numberFormatter: INumberFormatProps = {
    formatter: 'value',
    formatterOptions: { currency: settings.currencyInfo.symbol },
  };

  return (
    <XStack alignItems="center" space="$2">
      <NumberSizeableText
        flexShrink={1}
        minWidth={0}
        {...numberFormatter}
        size={
          md
            ? balanceSizeList.find(
                (item) =>
                  numberFormat(String(balanceString), numberFormatter, true)
                    .length >= item.length,
              )?.size ?? defaultBalanceSize
            : defaultBalanceSize
        }
      >
        {myBalance}
      </NumberSizeableText>
      {vaultSettings?.hasFrozenBalance ? (
        <IconButton
          title={intl.formatMessage({
            id: ETranslations.balance_detail_button_balance,
          })}
          icon="InfoCircleOutline"
          variant="tertiary"
          onPress={() => {
            if (balanceDialogInstance?.current) {
              return;
            }
            balanceDialogInstance.current = showBalanceDetailsDialog({
              accountId: account?.id ?? '',
              networkId: network?.id ?? '',
              onClose: () => {
                balanceDialogInstance.current = null;
              },
            });
          }}
        />
      ) : null}
    </XStack>
  );
}

export { HomeOverviewContainer };
