/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BareJuncture } from '../bare-juncture';
import { defineLazyProperty } from '../util/object';
import { createCursor, Cursor } from './cursor';
import { Path } from './path';

export interface FrameLayout {
  readonly parent: Frame | null;
  readonly path: Path;
  readonly isUnivocal: boolean;
  readonly isDivergent: boolean;
}

export interface FrameConfig {
  readonly layout: FrameLayout;
}

export class Frame<J extends BareJuncture = BareJuncture> {
  readonly layout: FrameLayout;

  constructor(readonly juncture: J, config: FrameConfig) {
    this.layout = config.layout;

    defineLazyProperty(this, 'privateCursor', () => this.createPrivateCursor());
    defineLazyProperty(this, 'cursor', () => this.createCursor());
  }

  protected createPrivateCursor(): Cursor<this['juncture']> {
    return createCursor(this);
  }

  protected createCursor(): Cursor<this['juncture']> {
    return createCursor(this);
  }

  readonly privateCursor!: Cursor<this['juncture']>;

  readonly cursor!: Cursor<this['juncture']>;
}

// ---  Derivations
export type JunctureOfFrame<F extends Frame> = F['juncture'];
// #endregion
