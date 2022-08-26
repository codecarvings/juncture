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
import { ReactorRunner } from './ reactor-runner';
import { Dispatcher } from './action';
import { Cursor } from './frame-equipment/cursor';
import { createValueHandler, ValueHandler } from './frame-equipment/value-handler';
import { createOuterFrame, OuterFrame } from './frames/outer-frame';
import { Gear } from './gear';
import {
  AccessorKit, OuterAccessorKit, prepareAccessorKit, prepareOuterAccessorKit
} from './kits/accessor-kit';
import {
  BinKit, OuterBinKit, prepareBinKit, prepareOuterBinKit
} from './kits/bin-kit';
import { FrameKit, prepareFrameKit } from './kits/frame-kit';

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

  constructor(protected readonly gear: Gear, dispatcher: Dispatcher) {
    defineLazyProperty(this, 'value', () => createValueHandler(gear));

    defineLazyProperty(this, 'cursor', () => gear.driver[jSymbols.createCursor](gear));
    prepareFrameKit(this.frames, this, this, this.accessors);
    prepareBinKit(this.bins, gear, this.frames, dispatcher);
    prepareAccessorKit(this.accessors, gear, this.bins);

    defineLazyProperty(this, 'outerCursor', () => gear.driver[jSymbols.createOuterCursor](gear));
    defineLazyProperty(this, 'outerFrame', () => createOuterFrame(this, this, this.outerAccessors));
    prepareOuterBinKit(this.outerBins, gear, this.frames, dispatcher);
    prepareOuterAccessorKit(this.outerAccessors, gear);

    this.reactors = this.createReactorRunner();
  }

  readonly reactors: ReactorRunner;

  protected createReactorRunner(): ReactorRunner {
    return new ReactorRunner(this.gear, this.frames);
  }

  // #endregion
}
