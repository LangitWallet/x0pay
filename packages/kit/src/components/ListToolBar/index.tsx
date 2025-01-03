import { useIntl } from 'react-intl';

import type { ISearchBarProps } from '@onekeyhq/components';
import {
  SearchBar,
  SizableText,
  XStack,
  YStack,
  useMedia,
} from '@onekeyhq/components';
import { ETranslations } from '@onekeyhq/shared/src/locale';

type IProps = {
  searchProps?: ISearchBarProps & { searchResultCount?: number };
  headerRight?: React.ReactNode;
};
function ListToolToolBar({ searchProps, headerRight }: IProps) {
  const media = useMedia();
  const intl = useIntl();

  if (!searchProps && !headerRight) return null;

  return (
    <YStack px="$5" py="$2" space="$5">
      <XStack alignItems="center" justifyContent="space-between">
        {searchProps ? (
          <SearchBar
            placeholder={`${intl.formatMessage({
              id: ETranslations.global_search,
            })}...`}
            containerProps={{
              flex: 1,
            }}
            {...(media.gtMd && {
              size: 'small',
              containerProps: {
                maxWidth: '$60',
              },
            })}
            {...searchProps}
          />
        ) : null}

        {headerRight ? (
          <XStack flex={1} justifyContent="flex-end">
            {headerRight}
          </XStack>
        ) : null}
      </XStack>
      {searchProps?.searchResultCount && searchProps?.searchResultCount > 0 ? (
        <SizableText
          color="$textSubdued"
          size="$bodyMdMedium"
        >{`${searchProps?.searchResultCount} 个搜索结果`}</SizableText>
      ) : null}
    </YStack>
  );
}

export { ListToolToolBar };
