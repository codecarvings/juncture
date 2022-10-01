/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AccessModifier } from '../../access-modifier';
import { DescriptorKeyPrefix } from '../../design/descriptor-type';
import { GenericProcedure } from '../../design/descriptors/procedure';
import { Driver } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
import { OverloadParameters } from '../../utilities/overload-types';
import { Realm } from '../realm';

// #region Common
type ExecBinItem<L> =
  L extends GenericProcedure<infer B, any> ? (...args : OverloadParameters<B>) => void
    : never;

function createExecBinBase(realm: Realm, isXp: boolean) {
  const keys = isXp ? realm.setup.procedures.xpKeys : realm.setup.procedures.keys;
  const bin: any = {};
  keys.forEach(key => {
    defineLazyProperty(
      bin,
      key,
      () => (...args: any) => {
        // dispatcher.dispatch({
        //   target: realm.ref, key, payload: args
        // });
      }
    );
  });
  return bin;
}
// #endregion

// #region ExecBin
export type ExecBin<D> = D extends any ? {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.procedure}.${infer W}` ? W : never] : ExecBinItem<D[K]>;
} : never;

export interface ExecBinHost<D> {
  readonly exec: ExecBin<D>;
}

export function createExecBin<D extends Driver>(realm: Realm): ExecBin<D> {
  return createExecBinBase(realm, false);
}
// #endregion

// #region XpExecBin
type XpExecBinKey<L, K> =
  L extends GenericProcedure<any, AccessModifier.public> ? K
    : never;

export type XpExecBin<D> = {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.procedure}.${infer W}` ?
    XpExecBinKey<D[K], W> : never]: ExecBinItem<D[K]>;
};

export function createXpExecBin<D extends Driver>(realm: Realm): XpExecBin<D> {
  return createExecBinBase(realm, true);
}
// #endregion
