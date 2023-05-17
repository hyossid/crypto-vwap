import { BridgeAssets, BridgeChains } from '@root/commons/types/db.types';
import { ENV } from '@root/env';
import assert from 'assert';
import { assertNever } from 'clarity-codegen';

export const stacksTransactionToBridgeAsset = (tx: {
  contract_id: string | null;
  function_arg_token_trait?: string | null;
}): BridgeAssets => {
  if (tx.contract_id === ENV.ALEX_STACKS_BRIDGE_HELPER_CONTRACT_ID) {
    assert(
      tx?.function_arg_token_trait,
      `function_arg_token_trait is null when parsing contrcat_id: ${tx.contract_id}`,
    );
    return tokenTraitToAsset(tx.function_arg_token_trait);
  } else if (
    tx.contract_id === ENV.TOKENSOFT_CONTRACT_ID_XUSD ||
    tx.contract_id === ENV.TOKENSOFT_CONTRACT_ID_WBTC
  ) {
    return contractIdToAsset(tx.contract_id);
  } else {
    throw new Error(
      `unknown contract_id while parsing bridge asset: ${tx.contract_id}`,
    );
  }
};
export const tokenTraitToAsset = (tokenTrait: string): BridgeAssets => {
  if (tokenTrait === ENV.ALEX_TOKEN_TRAIT_XUSD) {
    return BridgeAssets.xusd;
  } else {
    throw new Error(`Unknown token trait: ${tokenTrait}`);
  }
};
export const contractIdToAsset = (contractId: string): BridgeAssets => {
  if (contractId === ENV.TOKENSOFT_CONTRACT_ID_XUSD) {
    return BridgeAssets.xusd;
  } else if (contractId === ENV.TOKENSOFT_CONTRACT_ID_WBTC) {
    return BridgeAssets.xbtc;
  } else {
    throw new Error(`Unknown contract id: ${contractId}`);
  }
};
export const assetToContractId = (asset: BridgeAssets): string => {
  if (asset === BridgeAssets.xusd) {
    return ENV.TOKENSOFT_CONTRACT_ID_XUSD;
  } else if (asset === BridgeAssets.xbtc) {
    return ENV.TOKENSOFT_CONTRACT_ID_WBTC;
  } else {
    throw new Error(`assetToContractId Unknown asset: ${asset}`);
  }
};

export const stacksAssetToEthAsset = (asset: BridgeAssets): BridgeAssets => {
  if (asset === BridgeAssets.xusd) {
    return BridgeAssets.usdc;
  } else if (asset === BridgeAssets.xbtc) {
    return BridgeAssets.btc;
  } else {
    throw new Error(`stacksAssetToEthAsset - Unknown asset: ${asset}`);
  }
};

export const ethAssetToStacksAsset = (asset: BridgeAssets): BridgeAssets => {
  if (asset === BridgeAssets.usdc) {
    return BridgeAssets.xusd;
  } else if (asset === BridgeAssets.btc) {
    return BridgeAssets.xbtc;
  } else {
    throw new Error(`ethAssetToStacksAsset - Unknown asset: ${asset}`);
  }
};

export const getDestinationAsset = (
  sourceChain: BridgeChains,
  sourceAsset: BridgeAssets,
): BridgeAssets => {
  if (sourceChain === BridgeChains.stacks) {
    return stacksAssetToEthAsset(sourceAsset);
  } else if (sourceChain === BridgeChains.ethereum) {
    return ethAssetToStacksAsset(sourceAsset);
  } else {
    assertNever(sourceChain);
  }
};

export const parseBridgeAssets = (asset: string | null): BridgeAssets => {
  if (asset === 'xusd') {
    return BridgeAssets.xusd;
  } else if (asset === 'xbtc') {
    return BridgeAssets.xbtc;
  } else if (asset === 'usdc' || asset === 'USDC') {
    return BridgeAssets.usdc;
  } else if (asset === 'btc') {
    return BridgeAssets.btc;
  } else {
    throw new Error(`parseBridgeAssets Unknown asset: ${asset}`);
  }
};

export const parseBridgeChain = (chain: string | null): BridgeChains => {
  if (chain === 'stacks') {
    return BridgeChains.stacks;
  } else if (chain === 'ethereum') {
    return BridgeChains.ethereum;
  } else {
    throw new Error(`parseBridgeChain Unknown chain: ${chain}`);
  }
};

export const getBindingBridgeChain = (chain: BridgeChains) => {
  switch (chain) {
    case BridgeChains.ethereum:
      return BridgeChains.stacks;
    case BridgeChains.stacks:
      return BridgeChains.ethereum;
    default:
      assertNever(chain);
      throw new Error(`Unknown chain: ${chain}`);
  }
};
