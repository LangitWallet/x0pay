import { useIntl } from 'react-intl';

import {
  Icon,
  Image,
  SizableText,
  useClipboard,
  View,
  XStack,
} from '@onekeyhq/components';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import type { IAccountSelectorRouteParamsExtraConfig } from '@onekeyhq/shared/src/routes';

import { AccountAvatar } from '../../AccountAvatar';
import { useAccountSelectorTrigger } from '../hooks/useAccountSelectorTrigger';
import { useAtom } from 'jotai';
import { myAccountAtom } from '../../../states/jotai/myAccountAtom';
import { TouchableOpacity } from 'react-native';

export function AccountSelectorTriggerBase({
  num,
  ...others
}: {
  num: number;
} & IAccountSelectorRouteParamsExtraConfig) {
  // const {
  //   activeAccount: { account, dbAccount, indexedAccount, accountName, wallet },
  //   showAccountSelector,
  // } = useAccountSelectorTrigger({ num, ...others });
  const [myAccount] = useAtom(myAccountAtom);
  const intl = useIntl();
  const { copyText } = useClipboard();

  return (
    <XStack
      testID="AccountSelectorTriggerBase"
      role="button"
      alignItems="center"
      maxWidth="$48"
      py="$0.5"
      px="$1.5"
      mx="$-1.5"
      borderRadius="$2"
      hoverStyle={{
        bg: '$bgHover',
      }}
      pressStyle={{
        bg: '$bgActive',
      }}
      // onPress={showAccountSelector}
      userSelect="none"
    >
      {/* <AccountAvatar
        size="small"
        borderRadius="$1"
        indexedAccount={indexedAccount}
        account={account}
        dbAccount={dbAccount}
      /> */}
      <Image src={myAccount?.imageUrl} width={40} height={40} />
      <View pl="$2" pr="$1" minWidth={0}>
        <SizableText size="$bodySm" color="$textSubdued" numberOfLines={1}>
          {myAccount?.address?.slice(0, 8) +
            '....' +
            myAccount?.address?.slice(
              myAccount?.address?.length - 6,
              myAccount?.address?.length,
            ) || intl.formatMessage({ id: ETranslations.global_no_wallet })}
        </SizableText>
        <SizableText size="$bodyMdMedium" numberOfLines={1}>
          {myAccount?.accountName ||
            intl.formatMessage({ id: ETranslations.no_account })}
        </SizableText>
      </View>
      <TouchableOpacity
        onPress={() => {
          copyText(myAccount?.address, 'Address copied');
        }}
      >
        <Icon
          flexShrink={0} // Prevents the icon from shrinking when the text is too long
          name="Copy1Outline"
          size="$5"
          color="$iconSubdued"
        />
      </TouchableOpacity>
    </XStack>
  );
}
