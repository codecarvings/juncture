/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Engine } from '@codecarvings/juncture';
import { createContext } from 'react';

// The defaultValue argument is only used when a component does not have a matching Provider above it in the tree
// Not suitable for JunctureContext...
const JunctureContext = createContext<Engine>(undefined!);
JunctureContext.displayName = 'ReactJuncture';

export default JunctureContext;
