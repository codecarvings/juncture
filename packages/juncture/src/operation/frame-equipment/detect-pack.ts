/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../driver';
import {
  MessageDetectPicker, UnbindedMessageDetectPicker
} from './pickers/detect/message-detect-picker';
import {
  MutationDetectPicker, UnbindedMutationDetectPicker
} from './pickers/detect/mutation-detect-picker';

// #region UnbindedDetectPack
export interface UnbindedDetectPack {
  readonly dependencyChange: any;
  readonly anyDependencyChange: any;
  readonly mutation: UnbindedMutationDetectPicker;
  readonly selection: any;
  readonly reaction: any;
  readonly execution: any;
  readonly message: UnbindedMessageDetectPicker;
}
// #endregion

// #region DetectPack
export interface DetectPack<D extends Driver> {
  readonly dependencyChange: any;
  readonly anyDependencyChange: any;
  readonly mutation: MutationDetectPicker<D>;
  readonly selection: any;
  readonly reaction: any;
  readonly execution: any;
  readonly message: MessageDetectPicker<D>;
}
// #endregion
