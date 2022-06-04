/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../juncture';
import { Cursor } from './cursor/cursor';
import { PrivateCursor } from './cursor/private-cursor';
import { Path } from './path';

// --- Symbols
const frameSymbol = Symbol('frame');
interface FrameSymbols {
  readonly frame: typeof frameSymbol;
}
const frameSymbols: FrameSymbols = {
  frame: frameSymbol
};

export interface FrameLayout {
  readonly parent: Frame<any> | null;
  readonly path: Path;
  readonly isUnivocal: boolean;
  readonly isDivergent: boolean;
}

export interface FrameConfig {
  readonly layout: FrameLayout;
}

export abstract class Frame<J extends Juncture> {
  readonly layout: FrameLayout;

  constructor(readonly juncture: J, config: FrameConfig) {
    this.layout = config.layout;
  }

  readonly cursor!: Cursor<J>;

  readonly privateCursor!: PrivateCursor<J>;

  // #region Static
  static get<F extends FrameHost<any>>(host: F) {
    return host[frameSymbols.frame];
  }
  // #endregion
}

export interface FrameHost<J extends Juncture> {
  readonly [frameSymbols.frame]: Frame<J>;
}
