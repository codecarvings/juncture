/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { AccessModifier } from '../../../access-modifier';
import { DescriptorKeyPrefix } from '../../../design/descriptor-type';
import { GenericChannel } from '../../../design/descriptors/channel';
import { Driver } from '../../../driver';
import { Realm } from '../../realm';

// #region Common
type MessageDetectBinItem<L> =
  L extends GenericChannel<infer B, any> ? Observable<B>
    : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createMessageDetectBinBase<D extends Driver>(realm: Realm, isXp: boolean) {
  const bin: any = {};
  return bin;
}
// #endregion

// #region MessageDetectBin
export type MessageDetectBin<D> = D extends any ? {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.channel}.${infer W}` ? W : never]:
  MessageDetectBinItem<D[K]>;
} : never;

export interface MessageDetectBinHost<D> {
  readonly message: MessageDetectBin<D>;
}

export function createMessageDetectBin<D extends Driver>(realm: Realm): MessageDetectBin<D> {
  return createMessageDetectBinBase(realm, false);
}
// #endregion

// #region XpMessageDetectBin
type XpMessageDetectBinKey<L, K> =
  L extends GenericChannel<any, AccessModifier.public> ? K
    : never;

export type XpMessageDetectBin<D> = {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.channel}.${infer W}` ?
    XpMessageDetectBinKey<D[K], W> : never]: MessageDetectBinItem<D[K]>;
};

export function createXpMessageDetectBin<D extends Driver>(realm: Realm): XpMessageDetectBin<D> {
  return createMessageDetectBinBase(realm, true);
}
// #endregion
