/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DynamicQuery, DynamicQueryFrame } from '@codecarvings/juncture';
import { JunctureContext } from '@codecarvings/react-juncture';
import {
  useContext, useEffect, useRef, useState
} from 'react';

// TODO: IMPLEMENT THIS
export function useJuncture2<Q extends DynamicQuery>(query: Q): DynamicQueryFrame<Q> {
  const engine = useContext(JunctureContext);
  const [state, updateState] = useState(0);
  const stateRef = useRef(0);
  stateRef.current = state;

  useEffect(() => {
    Promise.all([]).then(() => {
      if (stateRef.current === state) {
        updateState(state < 1000000 ? state + 1 : 0);
      }
    });
  });

  return engine.createFrame(query as any) as any;
}
