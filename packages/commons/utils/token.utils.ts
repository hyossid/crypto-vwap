import { BridgeAssets } from '@root/commons/types/db.types';
import { ENHANCED_ENV } from '@root/env';
import BigNumber from 'bignumber.js';

export function adjustTokenAmountDecimal(
  amount: BigNumber,
  fromAsset: BridgeAssets,
  toAsset: BridgeAssets,
) {
  const decimalDifference =
    ENHANCED_ENV.DECIMALS_FROM_ASSET(toAsset) -
    ENHANCED_ENV.DECIMALS_FROM_ASSET(fromAsset);
  return amount.shiftedBy(decimalDifference);
}

export function getTokensoftFeeFromFixed(
  amount: BigNumber,
  asset: BridgeAssets,
) {
  return getTokensoftFee(
    amount.shiftedBy(-ENHANCED_ENV.DECIMALS_FROM_ASSET(asset)),
  ).shiftedBy(ENHANCED_ENV.DECIMALS_FROM_ASSET(asset));
}

// https://wrapped.notion.site/Wrapping-and-unwrapping-fees-e47faaac7f244065af9725ec06073c11
export function getTokensoftFee(amount: BigNumber): BigNumber {
  if (amount.lte(240_000)) {
    return amount.multipliedBy(0.002);
  }
  if (amount.lte(480_000)) {
    return amount.multipliedBy(0.0015);
  }
  if (amount.lte(960_000)) {
    return amount.multipliedBy(0.001);
  }
  if (amount.lte(3_750_000)) {
    return amount.multipliedBy(0.0007);
  }
  if (amount.lte(7_500_000)) {
    return amount.multipliedBy(0.0005);
  }

  return amount.multipliedBy(0.0004);
}

export function getAmountAfterFee(
  amount: BigNumber,
  asset: BridgeAssets,
): BigNumber {
  return amount.minus(getTokensoftFeeFromFixed(amount, asset));
}
