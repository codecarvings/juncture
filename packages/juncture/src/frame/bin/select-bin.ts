/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DirectSelectorDefinition, notASelectorDefinition, ParamSelectorDefinition, SelectorDefinitionTag
} from '../../kernel/selector';
import { JSymbols } from '../../symbols';

type SelectBinItem<S> =
  S extends DirectSelectorDefinition<any> ?
    ReturnType<ReturnType<S[JSymbols['definitionFn']]>> :
    S extends ParamSelectorDefinition<any> ?
      ReturnType<S[JSymbols['definitionFn']]> :
      typeof notASelectorDefinition;

export type SelectBin<J> = {
  readonly [K in keyof J as J[K] extends SelectorDefinitionTag ? K : never]: SelectBinItem<J[K]>;
};

export type PrivateSelectBin<J> = {
  readonly [K in keyof J]: SelectBinItem<J[K]>;
};
