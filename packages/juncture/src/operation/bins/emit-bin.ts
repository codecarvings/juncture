/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Descriptor, getFilteredDescriptorKeys } from '../../design/descriptor';
import { descriptorTypeFamilies, NotSuitableType } from '../../design/descriptor-type';
import { GenericChannel } from '../../design/descriptors/channel';
import { OpenChannel } from '../../design/descriptors/open-channel';
import { Driver } from '../../driver';
import { jSymbols } from '../../symbols';
import { defineLazyProperty } from '../../tool/object';
import { DefaultFrameHost } from '../frames/frame';
import { Realm } from '../realm';

// #region Common
type EmitBinItem<L> =
  L extends GenericChannel<infer B, any> ? (B extends void ? () => void : (payload: B) => void)
    : L extends OpenChannel<infer B> ? (B extends void ? () => void : (payload: B) => void)
      : NotSuitableType;

function createEmitBinBase<D extends Driver>(realm: Realm, frameHost: DefaultFrameHost<D>, outerFilter: boolean) {
  const { driver } = realm;
  const descriptorTypes = outerFilter ? descriptorTypeFamilies.outerEmittable : descriptorTypeFamilies.emittable;
  const keys = getFilteredDescriptorKeys(driver, descriptorTypes, outerFilter);
  const bin: any = {};
  keys.forEach(key => {
    const desc: Descriptor<any, any, any> = (driver as any)[key];
    defineLazyProperty(
      bin,
      key,
      () => (...args: any) => desc[jSymbols.payload](frameHost.default)(...args)
    );
  });
  return bin;
}
// #endregion

// #region EmitBin
// Conditional type required as a workoaround for problems with key remapping
export type EmitBin<D> = D extends any ? {
  readonly [K in keyof D as K extends string ? K : never]: EmitBinItem<D[K]>;
} : never;

export interface EmitBinHost<D> {
  readonly emit: EmitBin<D>;
}

export function createEmitBin<D extends Driver>(realm: Realm, frameHost: DefaultFrameHost<D>): EmitBin<D> {
  return createEmitBinBase(realm, frameHost, false);
}
// #endregion

// #region OuterEmitBin
export type OuterEmitBin<D> = {
  readonly [K in keyof D as D[K] extends OpenChannel<any> ? K : never]: EmitBinItem<D[K]>;
};

export function createOuterEmitBin<D extends Driver>(ream: Realm, frameHost: DefaultFrameHost<D>): OuterEmitBin<D> {
  return createEmitBinBase(ream, frameHost, true);
}
// #endregion
