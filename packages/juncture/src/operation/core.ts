/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { jSymbols } from '../symbols';
import { defineLazyProperty } from '../tool/object';
import { Dispatcher } from './action';
import { BehaviorHandler } from './behavior-supervisor';
import { Cursor } from './frame-equipment/cursor';
import { createValueHandler, ValueHandler } from './frame-equipment/value-handler';
import { createOuterFrame, OuterFrame } from './frames/outer-frame';
import {
  AccessorKit, OuterAccessorKit, prepareAccessorKit, prepareOuterAccessorKit
} from './kits/accessor-kit';
import {
  BinKit, OuterBinKit, prepareBinKit, prepareOuterBinKit
} from './kits/bin-kit';
import { FrameKit, prepareFrameKit } from './kits/frame-kit';
import { Realm } from './realm';

export class Core {
  readonly value!: ValueHandler;

  readonly cursor!: Cursor;

  readonly frames: FrameKit = {} as any;

  readonly bins: BinKit = {} as any;

  readonly accessors: AccessorKit = {} as any;

  readonly outerCursor!: Cursor;

  readonly outerFrame!: OuterFrame;

  readonly outerBins: OuterBinKit = {} as any;

  readonly outerAccessors: OuterAccessorKit = {} as any;

  constructor(protected readonly realm: Realm, dispatcher: Dispatcher) {
    defineLazyProperty(this, 'value', () => createValueHandler(realm));

    defineLazyProperty(this, 'cursor', () => realm.driver[jSymbols.createCursor](realm));
    prepareFrameKit(this.frames, this, this, this.accessors);
    prepareBinKit(this.bins, realm, this.frames, dispatcher);
    prepareAccessorKit(this.accessors, realm, this.bins);

    defineLazyProperty(this, 'outerCursor', () => realm.driver[jSymbols.createOuterCursor](realm));
    defineLazyProperty(this, 'outerFrame', () => createOuterFrame(this, this, this.outerAccessors));
    prepareOuterBinKit(this.outerBins, realm, this.frames, dispatcher);
    prepareOuterAccessorKit(this.outerAccessors, realm);

    this.behaviors = this.createBehaviorHandler();
  }

  readonly behaviors: BehaviorHandler;

  protected createBehaviorHandler(): BehaviorHandler {
    return new BehaviorHandler(this.realm, this.frames);
  }

  // #endregion
}
