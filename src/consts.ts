import { StacksNetworkName } from '@stacks/network';

export enum NetworkUsed {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
  NakamotoTestnet = 'nakamotoTestnet',
}

export const NETWORK: NetworkUsed = NetworkUsed.Mainnet;

export const STACKS_NETWORK: StacksNetworkName =
  NETWORK === NetworkUsed.Mainnet ? NetworkUsed.Mainnet : NetworkUsed.Testnet;

const API_CONFIG = {
  [NetworkUsed.Mainnet]: {
    API_URL: 'https://api.mainnet.hiro.so/extended/v1/tx/events',
    POX_INFO_URL: 'https://api.mainnet.hiro.so/v2/pox',
    REWARD_INDEXES_API_URL:
      'https://api.mainnet.hiro.so/v2/map_entry/SP000000000000000000002Q6VF78/pox-4/reward-cycle-pox-address-list',
    POX_CONTRACT_ADDRESS: 'SP000000000000000000002Q6VF78.pox-4',
    POOL_OPERATOR: 'SP18HC2MFXMZX4EYX5QAKEPF10AY3CJVHMAPZF9QY',
    // POOL_OPERATOR: 'SP2TXK60BBCSNDE1GNNMHM89KY6ZY4ZHTBTJP8X9V',
  },
  [NetworkUsed.Testnet]: {
    API_URL: 'https://api.testnet.hiro.so/extended/v1/tx/events',
    POX_INFO_URL: 'https://api.testnet.hiro.so/v2/pox',
    REWARD_INDEXES_API_URL:
      'https://api.testnet.hiro.so/v2/map_entry/ST000000000000000000002AMW42H/pox-4/reward-cycle-pox-address-list',
    POX_CONTRACT_ADDRESS: 'ST000000000000000000002AMW42H.pox-4',
    POOL_OPERATOR: 'ST1SCEXE6PMGPAC6B4N5P2MDKX8V4GF9QDEBN8YF5',
  },
  [NetworkUsed.NakamotoTestnet]: {
    API_URL: 'https://api.nakamoto.testnet.hiro.so/extended/v1/tx/events',
    POX_INFO_URL: 'https://api.nakamoto.testnet.hiro.so/v2/pox',
    REWARD_INDEXES_API_URL:
      'https://api.nakamoto.testnet.hiro.so/v2/map_entry/ST000000000000000000002AMW42H/pox-4/reward-cycle-pox-address-list',
    POX_CONTRACT_ADDRESS: 'ST000000000000000000002AMW42H.pox-4',
    POOL_OPERATOR: 'ST1SCEXE6PMGPAC6B4N5P2MDKX8V4GF9QDEBN8YF5',
  },
};

const currentConfig = API_CONFIG[NETWORK];

export const API_URL = currentConfig.API_URL;
export const POX_INFO_URL = currentConfig.POX_INFO_URL;
export const REWARD_INDEXES_API_URL = currentConfig.REWARD_INDEXES_API_URL;
export const POX_CONTRACT_ADDRESS = currentConfig.POX_CONTRACT_ADDRESS;
export const LIMIT = 100;
export const POOL_OPERATOR = currentConfig.POOL_OPERATOR;