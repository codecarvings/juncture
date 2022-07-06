/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ReactNode } from 'react';
import JunctureContext from './JunctureContext';

interface JunctureProviderProps {
  children: ReactNode
}

function JunctureProvider({ children }: JunctureProviderProps) {
  return (<JunctureContext.Provider value={undefined}>{children}</JunctureContext.Provider>);
}

export default JunctureProvider;
