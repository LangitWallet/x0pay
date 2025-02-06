/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable spellcheck/spell-checker */
import { memoFn } from '@onekeyhq/shared/src/utils/cacheUtils';
import type { IServerNetwork } from '@onekeyhq/shared/types';
import { ENetworkStatus } from '@onekeyhq/shared/types';

import platformEnv from '../platformEnv';

// dangerNetwork represents a virtual network
export const dangerAllNetworkRepresent: IServerNetwork = {
  'balance2FeeDecimals': 0,
  'chainId': '0',
  'code': '',
  'decimals': 0,
  'id': 'all--0',
  'impl': 'all',
  'isTestnet': false,
  'logoURI': 'https://uni.onekey-asset.com/static/chain/all.png',
  'name': 'All Networks',
  'shortcode': '',
  'shortname': '',
  'symbol': '',
  'feeMeta': {
    'code': '',
    'decimals': 0,
    'symbol': '0',
  },
  'defaultEnabled': true,
  'priceConfigs': [],
  'explorers': [],
  'status': ENetworkStatus.LISTED,
  'createdAt': '2023-05-31T00:29:24.951Z',
  'updatedAt': '2023-05-31T00:29:24.951Z',
};

export const getPresetNetworks = memoFn((): IServerNetwork[] => {
const xai = {
  'chainId': '660279',
  'code': 'XAI',
  'id': 'evm--660279',
  'logoURI': 'https://x0pay.com/images/xai.png',
  'name': 'XAI Network',
  'shortcode': 'XAI',
  'shortname': 'XAI',
  'feeMeta': {
    'code': 'XAI',
    'decimals': 9,
    'symbol': 'ETH',
  },
  'rpcURLs': [
    {
      'url': 'https://xai-chain.net/rpc',
    },
  ],
  'rpcUrl': 'https://xai-chain.net/rpc',
  'explorers': [
    {
      'address': 'https://xaiscan.io/address/{address}',
      'block': 'https://xaiscan.io/block/{block}',
      'name': 'https://xaiscan.io/',
      'transaction': 'https://xaiscan.io/tx/{transaction}',
    },
  ],
  'priceConfigs': [
    {
      'channel': 'coingecko',
      'native': 'ethereum',
      'platform': 'ethereum',
    },
  ],
  'symbol': 'ETH',
  'decimals': 18,
  'balance2FeeDecimals': 9,
  'impl': 'evm',
  'isTestnet': true,
  'defaultEnabled': true,
  'status': ENetworkStatus.LISTED,
  'createdAt': '2023-08-10T00:29:24.951Z',
  'updatedAt': '2023-08-10T00:29:24.951Z',
  enabled: true,
  feeSymbol: 'Gwei',
};
const arbitrum: IServerNetwork = {
  'balance2FeeDecimals': 9,
  'chainId': '42161',
  'code': 'arbitrum',
  'decimals': 18,
  'extensions': {
    'defaultStableTokens': [
      '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    ],
    'position': 7,
  },
  'id': 'evm--42161',
  'impl': 'evm',
  'isTestnet': false,
  'logoURI': 'https://uni.onekey-asset.com/static/chain/arbitrum.png',
  'name': 'Arbitrum',
  'shortcode': 'arbitrum',
  'shortname': 'Arbitrum',
  'symbol': 'ETH',
  'feeMeta': {
    'code': 'arbitrum',
    'decimals': 9,
    'symbol': 'Gwei',
  },
  'defaultEnabled': true,
  'priceConfigs': [
    {
      'channel': 'coingecko',
      'native': 'ethereum',
      'platform': 'arbitrum-one',
    },
    {
      'channel': 'yahoo',
      'native': 'ETH',
    },
  ],
  'explorers': [
    {
      'address': 'https://arbiscan.io/address/{address}',
      'block': 'https://arbiscan.io/block/{block}',
      'name': 'https://arbiscan.io/',
      'transaction': 'https://arbiscan.io/tx/{transaction}',
    },
  ],
  'status': ENetworkStatus.LISTED,
  'createdAt': '2023-05-31T00:29:24.951Z',
  'updatedAt': '2023-05-31T00:29:24.951Z',
};
// const ethereum: IServerNetwork = {
//   'impl': 'evm',
//   'chainId': '1',
//   'id': 'evm--1',
//   'name': 'Ethereum',
//   'symbol': 'ETH',
//   'code': 'eth',
//   'shortcode': 'eth',
//   'shortname': 'ETH',
//   'decimals': 18,
//   'feeMeta': {
//     'code': 'eth',
//     'decimals': 9,
//     'symbol': 'Gwei',
//   },
//   'status': ENetworkStatus.LISTED,
//   'isTestnet': false,
//   'extensions': {
//     'position': 3,
//     'isTokenSupported': true,
//     'isNFTEnabled': true,
//   },
//   'logoURI': 'https://uni.onekey-asset.com/static/chain/eth.png',
//   'defaultEnabled': true,
//   balance2FeeDecimals: 0,
//   priceConfigs: [],
//   explorers: [],
//   createdAt: '',
//   updatedAt: ''
// };
const bsc: IServerNetwork = {
  'impl': 'evm',
  'chainId': '56',
  'id': 'evm--56',
  'name': 'BNB Chain',
  'symbol': 'BNB',
  'code': 'bsc',
  'shortcode': 'bsc',
  'shortname': 'BSC',
  'decimals': 18,
  'feeMeta': {
    'code': 'bsc',
    'decimals': 9,
    'symbol': 'Gwei',
  },
  'status': ENetworkStatus.LISTED,
  'isTestnet': false,
  'extensions': {
    'position': 4,
    'isTokenSupported': true,
    'isNFTEnabled': true,
  },
  'logoURI': 'https://uni.onekey-asset.com/static/chain/bsc.png',
  'defaultEnabled': true,
  balance2FeeDecimals: 0,
  priceConfigs: [],
  explorers: [],
  createdAt: '',
  updatedAt: ''
};
const polygon: IServerNetwork = {
  'impl': 'evm',
  'chainId': '137',
  'id': 'evm--137',
  'name': 'Polygon',
  'symbol': 'POL',
  'code': 'polygon',
  'shortcode': 'polygon',
  'shortname': 'Polygon',
  'decimals': 18,
  'feeMeta': {
    'code': 'polygon',
    'decimals': 9,
    'symbol': 'Gwei',
  },
  'status': ENetworkStatus.LISTED,
  'isTestnet': false,
  'extensions': {
    'position': 5,
    'isTokenSupported': true,
    'isNFTEnabled': true,
  },
  'logoURI': 'https://uni.onekey-asset.com/static/chain/polygon.png',
  'defaultEnabled': true,
  balance2FeeDecimals: 0,
  priceConfigs: [],
  explorers: [],
  createdAt: '',
  updatedAt: ''
};
const avalanche: IServerNetwork = {
  'impl': 'evm',
  'chainId': '43114',
  'id': 'evm--43114',
  'name': 'Avalanche',
  'symbol': 'AVAX',
  'code': 'avalanche',
  'shortcode': 'avalanche',
  'shortname': 'Avalanche',
  'decimals': 18,
  'feeMeta': {
    'code': 'avalanche',
    'decimals': 9,
    'symbol': 'Gwei',
  },
  'status': ENetworkStatus.LISTED,
  'isTestnet': false,
  'extensions': {
    'position': 8,
    'isTokenSupported': true,
    'isNFTEnabled': false,
  },
  'logoURI': 'https://uni.onekey-asset.com/static/chain/avalanche.png',
  'defaultEnabled': true,
  balance2FeeDecimals: 0,
  priceConfigs: [],
  explorers: [],
  createdAt: '',
  updatedAt: ''
};
const optimism: IServerNetwork = {
  'impl': 'evm',
  'chainId': '10',
  'id': 'evm--10',
  'name': 'Optimism',
  'symbol': 'ETH',
  'code': 'optimism',
  'shortcode': 'optimism',
  'shortname': 'Optimism',
  'decimals': 18,
  'feeMeta': {
    'code': 'optimism',
    'decimals': 9,
    'symbol': 'Gwei',
  },
  'status': ENetworkStatus.LISTED,
  'isTestnet': false,
  'extensions': {
    'position': 11,
    'isTokenSupported': true,
    'isNFTEnabled': true,
  },
  'logoURI': 'https://uni.onekey-asset.com/static/chain/optimism.png',
  'defaultEnabled': true,
  balance2FeeDecimals: 0,
  priceConfigs: [],
  explorers: [],
  createdAt: '',
  updatedAt: ''
};
const sol: IServerNetwork = {
  'chainId': '101',
  'code': 'sol',
  'decimals': 9,
  'extensions': {
    'position': 4,
  },
  'id': 'sol--101',
  'impl': 'sol',
  'isTestnet': false,
  'logoURI': 'https://uni.onekey-asset.com/static/chain/sol.png',
  'name': 'Solana',
  'shortcode': 'sol',
  'shortname': 'SOL',
  'symbol': 'SOL',
  'feeMeta': {
    'code': 'sol',
    'decimals': 9,
    'symbol': 'SOL',
  },
  'defaultEnabled': true,
  'status': ENetworkStatus.LISTED,
  balance2FeeDecimals: 0,
  priceConfigs: [],
  explorers: [],
  createdAt: '',
  updatedAt: ''
};


  const chainsOnlyEnabledInDev = [];

  return [
    // btc & btc fork
    xai,
    arbitrum,
    bsc,
    polygon,
    avalanche,
    optimism,
    sol
    // ...(platformEnv.isDev ? chainsOnlyEnabledInDev : []),
  ];
});
