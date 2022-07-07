/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '../juncture';
import { Cursor } from './cursor';
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

export abstract class Frame<J extends Juncture> {
  readonly layout: FrameLayout;

  constructor(readonly juncture: J, config: FrameConfig) {
    this.layout = config.layout;
  }

  readonly privateCursor!: Cursor<this>;

  readonly cursor!: Cursor<this>;
}
