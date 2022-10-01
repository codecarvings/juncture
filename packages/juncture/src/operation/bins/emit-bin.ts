/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DescriptorKeyPrefix } from '../../design/descriptor-type';
import { GenericChannel } from '../../design/descriptors/channel';
import { Driver } from '../../driver';
import { junctureSymbols } from '../../juncture-symbols';
import { defineLazyProperty } from '../../utilities/object';
import { DefaultFrameHost } from '../frames/frame';
import { Realm } from '../realm';

type EmitBinItem<L> =
  L extends GenericChannel<infer B, any> ? (B extends void ? () => void : (payload: B) => void)
    : never;

export type EmitBin<D> = D extends any ? {
  readonly [K in keyof D as K extends `${DescriptorKeyPrefix.channel}.${infer W}` ? W : never] : EmitBinItem<D[K]>;
} : never;

export interface EmitBinHost<D> {
  readonly emit: EmitBin<D>;
}

export function createEmitBin<D extends Driver>(realm: Realm, frameHost: DefaultFrameHost<D>): EmitBin<D> {
  const { map, keys } = realm.setup.channels;
  const bin: any = {};
  keys.forEach(key => {
    const desc = map[key];
    defineLazyProperty(
      bin,
      key,
      () => (...args: any) => desc[junctureSymbols.payload](frameHost.default)(...args)
    );
  });
  return bin;
}
