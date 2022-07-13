/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../juncture';
import { defineLazyProperty } from '../util/object';
import { createCursor, Cursor } from './cursor';
import { Path } from './path';

export interface FrameLayout {
  readonly parent: Frame<any> | null;
  readonly path: Path;
  readonly isUnivocal: boolean;
  readonly isDivergent: boolean;
}

export interface FrameConfig {
  readonly layout: FrameLayout;
}

export class Frame<J extends Juncture> {
  readonly layout: FrameLayout;

  constructor(readonly juncture: J, config: FrameConfig) {
    this.layout = config.layout;

    defineLazyProperty(this, 'privateCursor', () => this.createPrivateCursor());
    defineLazyProperty(this, 'cursor', () => this.createCursor());
  }

  protected createPrivateCursor(): Cursor<this> {
    return createCursor(this);
  }

  protected createCursor(): Cursor<this> {
    return createCursor(this);
  }

  readonly privateCursor!: Cursor<this>;

  readonly cursor!: Cursor<this>;
}
