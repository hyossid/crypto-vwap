export enum BridgeAssets {
  xusd = 'xusd',
  xbtc = 'xbtc',
  usdc = 'usdc',
  btc = 'btc',
}

export enum BridgeChains {
  stacks = 'stacks',
  ethereum = 'ethereum',
}

export enum BridgeChainsIds {
  ethereum = 1,
}

export enum BridgeRoutes {
  user_to_alex_via_tokensoft = 'user_to_alex_via_tokensoft',
  tokensoft_to_alex = 'tokensoft_to_alex',
  alex_to_user_via_tokensoft = 'alex_to_user_via_tokensoft',

  user_to_alex_via_flashpay = 'user_to_alex_via_flashpay',
  alex_to_user_via_flashpay = 'alex_to_user_via_flashpay',
  alex_to_tokensoft = 'alex_to_tokensoft',
}

// user_to_alex_via_tokensoft -> tokensoft_to_alex -> alex_to_user_via_tokensoft
// user_to_alex_via_flashpay -> alex_to_user_via_flashpay
//                           -> tokensoft_to_alex
// alex_pool_to_tokensoft -> ??(tokensoft_to_alex_pool)

export enum OnchainStatus {
  pending = 'pending',
  confirmed = 'confirmed',
  failed = 'failed',
}

export enum BridgeOnchainTransactionTypes {
  user_sent = 'user_sent',
  tokensoft_sent = 'tokensoft_sent',
  alex_sent = 'alex_sent',
}

export enum EthereumTransactionStatuses {
  init = 'init',
  pending = 'pending',
  confirmed = 'confirmed',
  failed = 'failed',
}

// user -> alex (for unwrap)
export const kStacksHelperContractFunctionNameWrap = 'transfer-to-wrap';
// alex -> user (from wrap)
export const kStacksHelperContractFunctionNameUnwrap = 'transfer-to-unwrap';
export const kStacksTransferFunctionName = 'transfer';
export const kTokensoftContractNameMintTokens = 'mint-tokens';

export const kTokensoftContractIDBridgePrincipal = 'xusd-bridge';
export const kTokensoftContractFunctionNameBuy = 'buy'; // aka mint
export const kTokensoftContractFunctionNameSell = 'sell'; // aka burn

export enum SignedMessageStatuses {
  unverified = 'unverified',
  verified = 'verified',
  failed = 'failed',
}

export enum ProducedStacksTransactionStatuses {
  generated = 'generated',
  // submitted = 'submitted',
  pending = 'pending',
  settled = 'settled',
  fatal = 'fatal',
}

export enum ProcessingStatus {
  pending = 'pending',
  processed = 'processed',
  failed = 'failed',
}

export enum BridgeConfigKey {
  ETHEREUM_BLOCKS_START_AT = 'ETHEREUM_BLOCKS_START_AT',
}
