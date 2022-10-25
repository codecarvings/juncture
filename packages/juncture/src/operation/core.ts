/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable max-len */

import { junctureSymbols } from '../juncture-symbols';
import { defineLazyProperty } from '../utilities/object';
import { Dispatcher } from './action';
import { BehaviorSupervisor } from './behavior-supervisor';
import { Cursor } from './frame-equipment/cursor';
import {
  BinKit, prepareBinKit, prepareXpBinKit, XpBinKit
} from './kits/bin-kit';
import { FrameKit, prepareFrameKit } from './kits/frame-kit';
import { InstrumentKit, prepareInstrumentKit } from './kits/instrument-kit';
import {
  PickerKit, preparePickerKit, prepareXpPickerKit, XpPickerKit
} from './kits/picker-kit';
import { Realm } from './realm';

export class Core {
  readonly cursor!: Cursor;

  readonly frames: FrameKit = {} as any;

  readonly bins: BinKit = {} as any;

  readonly instruments: InstrumentKit = {} as any;

  readonly pickers: PickerKit = {} as any;

  readonly xpCursor!: Cursor;

  readonly xpBins: XpBinKit = {} as any;

  readonly xpPickers: XpPickerKit = {} as any;

  constructor(protected readonly realm: Realm, dispatcher: Dispatcher) {
    defineLazyProperty(this, 'cursor', () => realm.driver[junctureSymbols.createCursor](realm));
    prepareFrameKit(this.frames, this, this.instruments, this.pickers);
    prepareBinKit(this.bins, realm, this.frames, dispatcher);
    prepareInstrumentKit(this.instruments, realm);
    preparePickerKit(this.pickers, realm, this.bins);

    defineLazyProperty(this, 'xpCursor', () => realm.driver[junctureSymbols.createXpCursor](realm));
    prepareXpBinKit(this.xpBins, realm, this.frames, dispatcher);
    prepareXpPickerKit(this.xpPickers, realm);

    this.behaviors = this.createBehaviorSupervisor();
  }

  readonly behaviors: BehaviorSupervisor;

  protected createBehaviorSupervisor(): BehaviorSupervisor {
    return new BehaviorSupervisor(this.realm, this.frames);
  }

  // #endregion
}
