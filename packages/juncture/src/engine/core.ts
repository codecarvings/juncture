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
import { Cursor } from './cursor';
import { createFrame, Frame } from './frames/frame';
import { Gear } from './gear';
import {
  AccessorKit, equipAccessorKit, equipInternalAccessorKit, InternalAccessorKit
} from './kits/accessor-kit';
import {
  BinKit, equipBinKit, equipInternalBinKit, InternalBinKit
} from './kits/bin-kit';
import { equipInternalFrameKit, InternalFrameKit } from './kits/frame-kit';

export class Core {
  readonly cursor!: Cursor;

  readonly frame!: Frame;

  readonly bins: BinKit = {} as any;

  readonly accessors: AccessorKit = {} as any;

  readonly internalCursor!: Cursor;

  readonly internalFrames: InternalFrameKit = {} as any;

  readonly internalBins: InternalBinKit = {} as any;

  readonly internalAccessors: InternalAccessorKit = {} as any;

  constructor(protected readonly gear: Gear, dispatcher: Dispatcher) {
    defineLazyProperty(this, 'cursor', () => gear.juncture[jSymbols.createCursor](gear));
    defineLazyProperty(this, 'frame', () => createFrame(this, this.accessors));
    equipBinKit(this.bins, gear, this.internalFrames, dispatcher);
    equipAccessorKit(this.accessors, gear);

    defineLazyProperty(this, 'internalCursor', () => gear.juncture[jSymbols.createInternalCursor](gear));
    equipInternalFrameKit(this.internalFrames, this as any, this.internalAccessors);
    equipInternalBinKit(this.internalBins, gear, this.internalFrames, dispatcher);
    equipInternalAccessorKit(this.internalAccessors, gear, this.internalBins);

    this.reactors = this.createReactorRunner();
  }

  readonly reactors: ReactorRunner;

  protected createReactorRunner(): ReactorRunner {
    return new ReactorRunner(this.gear, this.internalFrames);
  }

  // #endregion
}
