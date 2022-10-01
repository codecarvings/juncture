/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Engine } from '@codecarvings/juncture';
import { ReactNode } from 'react';
import JunctureContext from './juncture-context';

interface JunctureProviderProps {
  engine: Engine;
  children: ReactNode
}

export default function JunctureProvider({ engine, children }: JunctureProviderProps) {
  return (<JunctureContext.Provider value={engine}>{children}</JunctureContext.Provider>);
}
