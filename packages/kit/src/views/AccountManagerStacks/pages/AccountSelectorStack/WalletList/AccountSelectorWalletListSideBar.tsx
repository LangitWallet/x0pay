import { useCallback, useEffect } from 'react';

import { StyleSheet } from 'react-native';

import {
  ListView,
  Page,
  Stack,
  View,
  XStack,
  useSafeAreaInsets,
} from '@onekeyhq/components';
import { HeaderIconButton } from '@onekeyhq/components/src/layouts/Navigation/Header';
import backgroundApiProxy from '@onekeyhq/kit/src/background/instance/backgroundApiProxy';
import { usePromiseResult } from '@onekeyhq/kit/src/hooks/usePromiseResult';
import {
  useAccountSelectorActions,
  useSelectedAccount,
} from '@onekeyhq/kit/src/states/jotai/contexts/accountSelector';
import type { IDBWallet } from '@onekeyhq/kit-bg/src/dbs/local/types';
import type { IAccountSelectorFocusedWallet } from '@onekeyhq/kit-bg/src/dbs/simple/entity/SimpleDbEntityAccountSelector';
import { emptyArray } from '@onekeyhq/shared/src/consts';
import {
  EAppEventBusNames,
  appEventBus,
} from '@onekeyhq/shared/src/eventBus/appEventBus';
import platformEnv from '@onekeyhq/shared/src/platformEnv';
import accountUtils from '@onekeyhq/shared/src/utils/accountUtils';

import { useAccountSelectorRoute } from '../../../router/useAccountSelectorRoute';

import { AccountSelectorCreateWalletButton } from './AccountSelectorCreateWalletButton';
import { WalletListItem } from './WalletListItem';

function ListItemSeparator() {
  return <Stack h="$3" />;
}

interface IWalletListProps {
  num: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function OthersWalletItem({
  onWalletPress,
  num,
}: {
  num: number;
  onWalletPress: (focusedWallet: IAccountSelectorFocusedWallet) => void;
}) {
  const {
    selectedAccount: { focusedWallet },
  } = useSelectedAccount({ num });
  return (
    <WalletListItem
      isOthers
      wallet={undefined}
      focusedWallet={focusedWallet}
      onWalletPress={onWalletPress}
    />
  );
}

export function AccountSelectorWalletListSideBar({ num }: IWalletListProps) {
  const { serviceAccount } = backgroundApiProxy;
  const { bottom } = useSafeAreaInsets();
  const actions = useAccountSelectorActions();
  const route = useAccountSelectorRoute();
  // const linkNetwork = route.params?.linkNetwork;
  const isEditableRouteParams = route.params?.editable;
  const { selectedAccount } = useSelectedAccount({ num });

  const { result: walletsResult, run: reloadWallets } = usePromiseResult(
    () =>
      // serviceAccount.getHDAndHWWallets({
      serviceAccount.getWallets({
        nestedHiddenWallets: true,
        ignoreEmptySingletonWalletAccounts: true,
      }),
    [serviceAccount],
    {
      checkIsFocused: false,
    },
  );
  const wallets = walletsResult?.wallets ?? emptyArray;

  useEffect(() => {
    const fn = async () => {
      await reloadWallets();
    };
    appEventBus.on(EAppEventBusNames.WalletUpdate, fn);
    appEventBus.on(EAppEventBusNames.AccountUpdate, fn);
    return () => {
      appEventBus.off(EAppEventBusNames.WalletUpdate, fn);
      appEventBus.off(EAppEventBusNames.AccountUpdate, fn);
    };
  }, [reloadWallets]);

  const onWalletPress = useCallback(
    (focusedWallet: IAccountSelectorFocusedWallet) => {
      void actions.current.updateSelectedAccountFocusedWallet({
        num,
        focusedWallet,
      });
    },
    [actions, num],
  );

  return (
    <Stack
      testID="account-selector-wallet-list"
      w="$16"
      $gtMd={{
        w: '$32',
      }}
      bg="$bgSubdued"
      borderRightWidth={StyleSheet.hairlineWidth}
      borderRightColor="$neutral3"
    >
      {/* Close action */}
      {platformEnv.isExtension || platformEnv.isNativeAndroid ? (
        <XStack py="$4" justifyContent="center">
          <Page.Close>
            <HeaderIconButton icon="CrossedLargeOutline" />
          </Page.Close>
        </XStack>
      ) : null}
      {/* Primary wallets */}
      <View style={{flex: 1}}/>
      {/* <ListView
        showsVerticalScrollIndicator={false}
        p="$2"
        estimatedItemSize="$10"
        data={wallets}
        extraData={selectedAccount.focusedWallet}
        renderItem={({ item }: { item: IDBWallet }) => {
          let badge: number | string | undefined;
          if (accountUtils.isQrWallet({ walletId: item.id })) {
            badge = 'QR';
          }

          return (
            <WalletListItem
              key={item.id}
              wallet={item}
              focusedWallet={selectedAccount.focusedWallet}
              onWalletPress={onWalletPress}
              testID={`wallet-${item.id}`}
              badge={badge}
            />
          );
        }}
        ItemSeparatorComponent={ListItemSeparator}
      /> */}
      {/* Others */}
      {!isEditableRouteParams ? (
        <Stack
          p="$2"
          borderTopWidth={StyleSheet.hairlineWidth}
          borderTopColor="$borderSubdued"
          mb={bottom}
        >
          <AccountSelectorCreateWalletButton />
          {/* <OthersWalletItem onWalletPress={onWalletPress} num={num} /> */}
        </Stack>
      ) : null}
    </Stack>
  );
}
