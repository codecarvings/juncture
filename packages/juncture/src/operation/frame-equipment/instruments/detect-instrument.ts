/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Driver } from '../../../driver';
import {
  MessageDetectPicker, UniMessageDetectPicker
} from './pickers/detect/message-detect-picker';
import {
  MutationDetectPicker, UniMutationDetectPicker
} from './pickers/detect/mutation-detect-picker';

// #region UniDetectInstrument
export interface UniDetectInstrument {
  readonly dependencyChange: any;
  readonly anyDependencyChange: any;
  readonly mutation: UniMutationDetectPicker;
  readonly selection: any;
  readonly reaction: any;
  readonly execution: any;
  readonly message: UniMessageDetectPicker;
}
// #endregion

// #region DetectInstrument
export interface DetectInstrument<D extends Driver> {
  readonly dependencyChange: any;
  readonly anyDependencyChange: any;
  readonly mutation: MutationDetectPicker<D>;
  readonly selection: any;
  readonly reaction: any;
  readonly execution: any;
  readonly message: MessageDetectPicker<D>;
}
// #endregion
