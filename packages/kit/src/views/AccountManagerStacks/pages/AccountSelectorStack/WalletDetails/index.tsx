import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useIntl } from 'react-intl';

import type { ISectionListRef } from '@onekeyhq/components';
import {
  ActionList,
  Empty,
  Icon,
  IconButton,
  SectionList,
  Stack,
  useSafeAreaInsets,
  useSafelyScrollToLocation,
  View,
} from '@onekeyhq/components';
import backgroundApiProxy from '@onekeyhq/kit/src/background/instance/backgroundApiProxy';
import { AccountAvatar } from '@onekeyhq/kit/src/components/AccountAvatar';
import { AccountSelectorCreateAddressButton } from '@onekeyhq/kit/src/components/AccountSelector/AccountSelectorCreateAddressButton';
import { ListItem } from '@onekeyhq/kit/src/components/ListItem';
import useAppNavigation from '@onekeyhq/kit/src/hooks/useAppNavigation';
import { usePromiseResult } from '@onekeyhq/kit/src/hooks/usePromiseResult';
import {
  useAccountSelectorActions,
  useAccountSelectorEditModeAtom,
  useActiveAccount,
  useSelectedAccount,
} from '@onekeyhq/kit/src/states/jotai/contexts/accountSelector';
import { AccountEditButton } from '@onekeyhq/kit/src/views/AccountManagerStacks/components/AccountEdit';
import type {
  IDBAccount,
  IDBDevice,
  IDBIndexedAccount,
  IDBWallet,
} from '@onekeyhq/kit-bg/src/dbs/local/types';
import type { IAccountSelectorAccountsListSectionData } from '@onekeyhq/kit-bg/src/dbs/simple/entity/SimpleDbEntityAccountSelector';
import { emptyArray } from '@onekeyhq/shared/src/consts';
import {
  WALLET_TYPE_EXTERNAL,
  WALLET_TYPE_IMPORTED,
  WALLET_TYPE_WATCHING,
} from '@onekeyhq/shared/src/consts/dbConsts';
import {
  EAppEventBusNames,
  appEventBus,
} from '@onekeyhq/shared/src/eventBus/appEventBus';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import {
  EModalRoutes,
  EModalSendRoutes,
  EOnboardingPages,
} from '@onekeyhq/shared/src/routes';
import accountUtils from '@onekeyhq/shared/src/utils/accountUtils';

import { useAccountSelectorRoute } from '../../../router/useAccountSelectorRoute';

import { WalletDetailsHeader } from './WalletDetailsHeader';
import { WalletOptions } from './WalletOptions';
import { myAccountAtom } from '../../../../../states/jotai/myAccountAtom';
import { useAtom } from 'jotai';
import { useAllTokenListAtom } from '../../../../../states/jotai/contexts/tokenList';
import useConfigurableChainSelector from '../../../../ChainSelector/hooks/useChainSelector';
import axios from 'axios';
import { ethers } from 'ethers';
import SimpleToken from '../../../../../../assets/SimpleToken.json';
import { ActivityIndicator, Modal } from 'react-native';

export interface IWalletDetailsProps {
  num: number;
  wallet?: IDBWallet;
  device?: IDBDevice | undefined;
}

export function WalletDetails({ num }: IWalletDetailsProps) {
  const intl = useIntl();
  const [editMode, setEditMode] = useAccountSelectorEditModeAtom();
  const { serviceAccount, serviceAccountSelector } = backgroundApiProxy;
  const { selectedAccount } = useSelectedAccount({ num });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeAccount } = useActiveAccount({ num });
  const actions = useAccountSelectorActions();
  const listRef = useRef<ISectionListRef<any> | null>(null);
  const route = useAccountSelectorRoute();
  const linkNetwork = route.params?.linkNetwork;
  const isEditableRouteParams = route.params?.editable;
  const linkedNetworkId = linkNetwork ? selectedAccount?.networkId : undefined;
  const [myAccount] = useAtom(myAccountAtom);
  const [isLoading, setLoading] = useState(false);

  // const [allTokens] = useAllTokenListAtom();

  const navigation = useAppNavigation();
  console.log('My Account', myAccount);
  // TODO move to hooks
  const isOthers = selectedAccount?.focusedWallet === '$$others';
  const isOthersWallet = Boolean(
    selectedAccount?.focusedWallet &&
      accountUtils.isOthersWallet({
        walletId: selectedAccount?.focusedWallet,
      }),
  );
  const isOthersUniversal = isOthers || isOthersWallet;

  const handleImportWatchingAccount = useCallback(() => {
    navigation.pushModal(EModalRoutes.OnboardingModal, {
      screen: EOnboardingPages.ImportAddress,
    });
  }, [navigation]);

  const handleImportPrivatekeyAccount = useCallback(() => {
    navigation.pushModal(EModalRoutes.OnboardingModal, {
      screen: EOnboardingPages.ImportPrivateKey,
    });
  }, [navigation]);

  const handleAddExternalAccount = useCallback(() => {
    console.log('handleAddExternalAccount');
    navigation.pushModal(EModalRoutes.OnboardingModal, {
      screen: EOnboardingPages.ConnectWalletSelectNetworks,
    });
  }, [navigation]);

  const { result: focusedWalletInfo, run: reloadFocusedWalletInfo } =
    usePromiseResult(
      async () => {
        if (!selectedAccount?.focusedWallet) {
          return undefined;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isHd = accountUtils.isHdWallet({
          walletId: selectedAccount?.focusedWallet,
        });
        const isHw = accountUtils.isHwWallet({
          walletId: selectedAccount?.focusedWallet,
        });
        try {
          const wallet = await serviceAccount.getWallet({
            walletId: selectedAccount?.focusedWallet,
          });

          let device: IDBDevice | undefined;
          if (isHw) {
            device = await serviceAccount.getWalletDevice({
              walletId: selectedAccount?.focusedWallet,
            });
          }

          return {
            wallet,
            device,
          };
        } catch (error) {
          // wallet may be removed
          console.error(error);
          return undefined;
        }
      },
      [selectedAccount?.focusedWallet, serviceAccount],
      {
        checkIsFocused: false,
        // debounced: 100,
      },
    );

  useEffect(() => {
    const fn = async () => {
      // await wait(300);
      await reloadFocusedWalletInfo();
    };
    // TODO sync device features to DB and reload data
    appEventBus.on(EAppEventBusNames.WalletUpdate, fn);
    return () => {
      appEventBus.off(EAppEventBusNames.WalletUpdate, fn);
    };
  }, [reloadFocusedWalletInfo]);

  const { result: sectionData, run: reloadAccounts } = usePromiseResult(
    async () => {
      if (!selectedAccount?.focusedWallet) {
        return Promise.resolve(undefined);
      }

      return serviceAccountSelector.getAccountSelectorAccountsListSectionData({
        focusedWallet: selectedAccount?.focusedWallet,
        linkedNetworkId,
        deriveType: selectedAccount.deriveType,
        othersNetworkId: selectedAccount?.networkId,
      });
    },
    [
      linkedNetworkId,
      selectedAccount.deriveType,
      selectedAccount?.focusedWallet,
      selectedAccount?.networkId,
      serviceAccountSelector,
    ],
    {
      checkIsFocused: false,
    },
  );

  useEffect(() => {
    const fn = async () => {
      await reloadAccounts();
    };
    appEventBus.on(EAppEventBusNames.AccountUpdate, fn);
    appEventBus.on(EAppEventBusNames.WalletUpdate, fn);
    return () => {
      appEventBus.off(EAppEventBusNames.AccountUpdate, fn);
      appEventBus.off(EAppEventBusNames.WalletUpdate, fn);
    };
  }, [reloadAccounts]);

  const { scrollToLocation, onLayout } = useSafelyScrollToLocation(listRef);
  // scroll into selected account
  useEffect(() => {
    if (sectionData?.[0]?.data) {
      const itemIndex = sectionData[0].data?.findIndex(({ id }) =>
        isOthers
          ? selectedAccount.othersWalletAccountId === id
          : selectedAccount.indexedAccountId === id,
      );
      console.log('itemIndex----', itemIndex);
      scrollToLocation({
        animated: true,
        sectionIndex: 0,
        itemIndex: Math.max(itemIndex, 0),
      });
    }
  }, [
    isOthers,
    scrollToLocation,
    sectionData,
    selectedAccount.indexedAccountId,
    selectedAccount.othersWalletAccountId,
  ]);

  const [remember, setIsRemember] = useState(false);
  const { bottom } = useSafeAreaInsets();

  const buildSubTitleInfo = useCallback(
    (item: IDBAccount | IDBIndexedAccount) => {
      let address: string | undefined;
      let allowEmptyAddress = false;
      if (isOthersUniversal) {
        const account = item as IDBAccount | undefined;
        address = account?.address;
      } else {
        const indexedAccount = item as IDBIndexedAccount | undefined;
        const associateAccount = indexedAccount?.associateAccount;
        address = associateAccount?.address;

        if (
          associateAccount?.addressDetail?.isValid &&
          associateAccount?.addressDetail?.normalizedAddress
        ) {
          allowEmptyAddress = true;
        }
      }
      if (!address && !isOthersUniversal && linkNetwork && !allowEmptyAddress) {
        // TODO custom style
        return {
          address: intl.formatMessage(
            { id: ETranslations.global_no_network_address },
            {
              network: activeAccount?.network?.shortname || '',
            },
          ),
          isEmptyAddress: true,
        };
      }
      console.log('JHAJA', address);
      return {
        address: address
          ? accountUtils.shortenAddress({
              address,
            })
          : '',
        isEmptyAddress: false,
      };
    },
    [activeAccount?.network?.shortname, intl, isOthersUniversal, linkNetwork],
  );

  const openChainSelector = useConfigurableChainSelector();

  const getSTKBalance = async (tokenAddress: string, accAddress: string) => {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://xai-chain.net/rpc/',
    );

    const sentTokenContract = new ethers.Contract(
      tokenAddress,
      SimpleToken.abi,
      provider,
    );

    const balance = await sentTokenContract?.balanceOf(accAddress);

    const stringBalance = ethers.utils.formatUnits(balance, 6);

    return stringBalance;
  };

  const { result: selectorNetworks } = usePromiseResult(
    async () => {
      const { networks } =
        await backgroundApiProxy.serviceNetwork.getAllNetworks();
      // if (excludedNetworkIds && excludedNetworkIds.length > 0) {
      //   return networks.filter((o) => !excludedNetworkIds.includes(o.id));
      // }
      return networks;
    },
    [],
    { initResult: [] },
  );

  const current = useMemo(() => {
    const item = selectorNetworks.find(
      (o) => o.id === activeAccount?.network?.id,
    );
    return item;
  }, [selectorNetworks, activeAccount]);

  // const isEmptyData = useMemo(() => {
  //   let count = 0;
  //   sectionData?.forEach((section) => {
  //     count += section.data.length;
  //   });
  //   return count <= 0;
  // }, [sectionData]);

  const editable = useMemo(() => {
    if (!isEditableRouteParams) {
      return false;
    }
    // if (isOthersUniversal) {
    //   if (
    //     sectionData?.some((section) => {
    //       if (section.data.length) {
    //         return true;
    //       }
    //       return false;
    //     })
    //   ) {
    //     return true;
    //   }
    //   return false;
    // }
    if (!sectionData || sectionData.length === 0) {
      return false;
    }
    return true;
  }, [sectionData, isEditableRouteParams]);

  const title = useMemo(() => {
    if (isOthers) {
      return 'Others';
    }

    return focusedWalletInfo?.wallet?.name
      ? intl.formatMessage({
          id: focusedWalletInfo?.wallet?.name as ETranslations,
        })
      : '';
  }, [focusedWalletInfo, intl, isOthers]);
  return (
    <Stack flex={1} pb={bottom} testID="account-selector-accountList">
      <Modal transparent visible={isLoading}>
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator />
        </View>
      </Modal>
      <WalletDetailsHeader
        wallet={focusedWalletInfo?.wallet}
        device={focusedWalletInfo?.device}
        titleProps={{
          opacity: editMode && editable ? 0 : 1,
        }}
        editMode={editMode}
        editable={editable}
        onEditButtonPress={() => {
          setEditMode((v) => !v);
        }}
        {...(!editMode && {
          // title,
          title: 'Source Account',
        })}
      />

      <SectionList
        ref={listRef}
        onLayout={onLayout}
        ListEmptyComponent={
          <Empty
            mt="$24"
            icon="WalletOutline"
            title={intl.formatMessage({ id: ETranslations.global_no_wallet })}
            description={intl.formatMessage({
              id: ETranslations.global_no_wallet_desc,
            })}
            // buttonProps={{
            //   children: intl.formatMessage({
            //     id: ETranslations.global_create_wallet,
            //   }),
            //   onPress: () => {
            //     navigation.pushModal(EModalRoutes.OnboardingModal, {
            //       screen: EOnboardingPages.GetStarted,
            //       params: {
            //         showCloseButton: true,
            //       },
            //     });
            //   },
            // }}
          />
        }
        contentContainerStyle={{ pb: '$3' }}
        estimatedItemSize="$14"
        extraData={[selectedAccount.indexedAccountId, editMode, remember]}
        // {...(wallet?.type !== 'others' && {
        //   ListHeaderComponent: (
        //     <WalletOptions editMode={editMode} wallet={wallet} />
        //   ),
        // })}
        ListHeaderComponent={
          isOthersUniversal ? null : (
            <WalletOptions
              wallet={focusedWalletInfo?.wallet}
              device={focusedWalletInfo?.device}
            />
          )
        }
        sections={sectionData ?? (emptyArray as any)}
        renderSectionHeader={({
          section,
        }: {
          section: IAccountSelectorAccountsListSectionData;
        }) => (
          <>
            {/* If better performance is needed,  */
            /*  a header component should be extracted and data updates should be subscribed to through context" */}
            {section.title ? (
              <SectionList.SectionHeader title={section.title}>
                {section.isHiddenWalletData && editMode ? (
                  <ActionList
                    title={section.title}
                    renderTrigger={
                      <IconButton
                        icon="DotHorOutline"
                        variant="tertiary"
                        ml="$2"
                      />
                    }
                    sections={[
                      {
                        items: [
                          {
                            icon: remember
                              ? 'CheckboxSolid'
                              : 'SuqarePlaceholderOutline',
                            ...(remember && {
                              iconProps: {
                                color: '$iconActive',
                              },
                            }),
                            label: 'Remember',
                            onPress: () => setIsRemember(!remember),
                          },
                        ],
                      },
                      {
                        items: [
                          {
                            icon: 'PencilOutline',
                            label: intl.formatMessage({
                              id: ETranslations.global_rename,
                            }),
                            onPress: () => alert('edit 1112'),
                          },
                          {
                            destructive: true,
                            icon: 'DeleteOutline',
                            label: intl.formatMessage({
                              id: ETranslations.global_remove,
                            }),
                            onPress: () => alert('edit 3332'),
                          },
                        ],
                      },
                    ]}
                  />
                ) : null}
              </SectionList.SectionHeader>
            ) : null}
            {section.data.length === 0 && section.emptyText ? (
              <ListItem
                title={section.emptyText}
                titleProps={{
                  size: '$bodyLg',
                }}
              />
            ) : null}
          </>
        )}
        renderItem={({
          item,
        }: {
          item: IDBIndexedAccount | IDBAccount;
          section: IAccountSelectorAccountsListSectionData;
        }) => {
          const account = isOthersUniversal ? (item as IDBAccount) : undefined;
          const indexedAccount = isOthersUniversal
            ? undefined
            : (item as IDBIndexedAccount);

          const subTitleInfo = buildSubTitleInfo(item);
          const shouldShowCreateAddressButton =
            linkNetwork && subTitleInfo.isEmptyAddress;

          const actionButton = (() => {
            if (editMode) {
              return (
                <>
                  {/* TODO rename to AccountEditTrigger */}
                  <AccountEditButton
                    account={account}
                    indexedAccount={indexedAccount}
                  />
                </>
              );
            }
            if (shouldShowCreateAddressButton) {
              return (
                <AccountSelectorCreateAddressButton
                  num={num}
                  selectAfterCreate
                  account={{
                    walletId: focusedWalletInfo?.wallet?.id,
                    networkId: linkedNetworkId,
                    indexedAccountId: indexedAccount?.id,
                    deriveType: selectedAccount.deriveType,
                  }}
                >
                  <Icon name="PlusSmallOutline" />
                </AccountSelectorCreateAddressButton>
              );
            }
            return null;
          })();

          let avatarNetworkId: string | undefined;
          if (isOthersUniversal && account) {
            avatarNetworkId = accountUtils.getAccountCompatibleNetwork({
              account,
              networkId: linkNetwork
                ? selectedAccount?.networkId
                : account.createAtNetwork,
            });
          }
          if (!avatarNetworkId && indexedAccount && linkNetwork) {
            avatarNetworkId = selectedAccount?.networkId;
          }

          return (
            <ListItem
              key={item.id}
              renderAvatar={
                <AccountAvatar
                  loading={<AccountAvatar.Loading w="$10" h="$10" />}
                  indexedAccount={indexedAccount}
                  account={account as any}
                  networkId={avatarNetworkId}
                />
              }
              title={item.name}
              titleProps={{
                numberOfLines: 1,
              }}
              subtitle={subTitleInfo.address}
              subtitleProps={{
                color: subTitleInfo.isEmptyAddress
                  ? '$textCaution'
                  : '$textSubdued',
              }}
              {...(!editMode && {
                onPress: async () => {
                  // show CreateAddress Button here, disabled confirmAccountSelect()

                  // if (shouldShowCreateAddressButton) {
                  //   return;
                  // }
                  // if (isOthersUniversal) {
                  //   await actions.current.confirmAccountSelect({
                  //     num,
                  //     indexedAccount: undefined,
                  //     othersWalletAccount: account,
                  //     autoChangeToAccountMatchedNetworkId: avatarNetworkId,
                  //   });
                  // } else if (focusedWalletInfo) {
                  //   await actions.current.confirmAccountSelect({
                  //     num,
                  //     indexedAccount,
                  //     othersWalletAccount: undefined,
                  //     autoChangeToAccountMatchedNetworkId: undefined,
                  //   });
                  // }
                  // navigation.popStack();
                  // item?.address
                  openChainSelector({
                    title: 'Source Network',
                    networkIds: selectorNetworks.map((o) => o.id),
                    defaultNetworkId: current?.id,
                    address: item?.address,
                    notBack: true,
                    onSelect: async (tokenParam, networkParam) => {
                      // console.log(tokenItem, network);
                      // let r = {};
                      console.log('tokenParam', tokenParam);
                      console.log('networkParam', networkParam);

                      navigation.pushModal(EModalRoutes.SendModal, {
                        screen: EModalSendRoutes.SendDataInput,
                        params: {
                          accountId: activeAccount?.account?.id,
                          networkId: networkParam?.id,
                          isNFT: false,
                          isSourceAccount: true,
                          sourceToken: tokenParam,
                        },
                      });
                    },
                  });
                },
                checkMark: (() => {
                  // show CreateAddress Button here, hide checkMark
                  if (shouldShowCreateAddressButton) {
                    return undefined;
                  }
                  return isOthersUniversal
                    ? selectedAccount.othersWalletAccountId === item.id
                    : selectedAccount.indexedAccountId === item.id;
                })(),
              })}
            >
              {actionButton}
            </ListItem>
          );
        }}
        renderSectionFooter={({
          section,
        }: {
          section: IAccountSelectorAccountsListSectionData;
        }) =>
          isEditableRouteParams ? (
            <ListItem
              onPress={async () => {
                if (isOthersUniversal) {
                  if (section.walletId === WALLET_TYPE_WATCHING) {
                    handleImportWatchingAccount();
                  }
                  if (section.walletId === WALLET_TYPE_IMPORTED) {
                    handleImportPrivatekeyAccount();
                  }
                  if (section.walletId === WALLET_TYPE_EXTERNAL) {
                    handleAddExternalAccount();
                  }
                  return;
                }
                if (!focusedWalletInfo) {
                  return;
                }
                const c = await serviceAccount.addHDNextIndexedAccount({
                  walletId: section.walletId,
                });
                console.log('addHDNextIndexedAccount>>>', c);
                void actions.current.updateSelectedAccountForHdOrHwAccount({
                  num,
                  walletId: focusedWalletInfo?.wallet?.id,
                  indexedAccountId: c.indexedAccountId,
                });
              }}
            >
              <Stack
                bg="$bgStrong"
                borderRadius="$2"
                p="$2"
                borderCurve="continuous"
              >
                <Icon name="PlusSmallOutline" />
              </Stack>
              {/* Add account */}
              <ListItem.Text
                userSelect="none"
                primary={intl.formatMessage({
                  id: ETranslations.global_add_account,
                })}
                primaryTextProps={{
                  color: '$textSubdued',
                }}
              />
            </ListItem>
          ) : null
        }
      />
    </Stack>
  );
}
