/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access-modifier';
import { DescriptorKeyPrefix } from '../../design/descriptor-type';
import { GenericReactor } from '../../design/descriptors/reactor';
import { GenericSynthReactor } from '../../design/descriptors/synth-reactor';
import { Driver } from '../../driver';
import { OverloadParameters } from '../../utilities/overload-types';
import { Dispatcher } from '../action';
import { Realm } from '../realm';

// #region Common
type DispatchBinItem<L> =
  L extends GenericReactor<infer B, any> ? (...args : OverloadParameters<B>) => void
    : L extends GenericSynthReactor<infer B, any> ? (...args : OverloadParameters<B>) => void
      : never;

function createDispatchBinBase(realm: Realm, dispatcher: Dispatcher, isXp: boolean) {
  const keys = isXp ? realm.setup.reactors.xpKeys : realm.setup.reactors.keys;
  const bin: any = {};
  keys.forEach(key => {
    bin[key] = (...args: any) => {
      dispatcher.dispatch({
        target: realm.ref, key, payload: args
      });
    };
  });
  return bin;
}
// #endregion

// #region DispatchBin
export type DispatchBin<D> = D extends any ? {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.reactor}.${infer W}` ? W : never] : DispatchBinItem<D[K]>;
} : never;

export interface DispatchBinHost<D> {
  readonly dispatch: DispatchBin<D>;
}

export function createDispatchBin<D extends Driver>(realm: Realm, dispatcher: Dispatcher): DispatchBin<D> {
  return createDispatchBinBase(realm, dispatcher, false);
}
// #endregion

// #region XpDispatchBin
type XpDispatchBinKey<L, K> =
  L extends GenericReactor<any, AccessModifier.public> ? K
    : L extends GenericSynthReactor<any, AccessModifier.public> ? K
      : never;

export type XpDispatchBin<D> = {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.reactor}.${infer W}` ?
    XpDispatchBinKey<D[K], W> : never]: DispatchBinItem<D[K]>;
};

export function createXpDispatchBin<D extends Driver>(realm: Realm, dispatcher: Dispatcher): XpDispatchBin<D> {
  return createDispatchBinBase(realm, dispatcher, true);
}
// #endregion
