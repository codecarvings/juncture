/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Juncture, UnbindedFrame
} from '@codecarvings/juncture';
import { ValueOfJuncture } from '@codecarvings/juncture/dist/juncture';
import {
  useContext, useEffect, useRef, useState
} from 'react';
import JunctureContext from './juncture-context';

export interface JunctureRequest<J extends Juncture = Juncture> {
  readonly key?: string;
  readonly juncture: J;
}

export interface TransientBranch<J extends Juncture = Juncture> {
  readonly key?: string;
  readonly transient: J;
  readonly initialValue?: ValueOfJuncture<J>
}

export type UseJunctureQueryItem = Juncture | JunctureRequest | TransientBranch;

export interface UseJunctureQuery {
  readonly [key: string]: UseJunctureQueryItem;
}

type UnbindedFrameQueryOfUseJunctureQueryItem<T> =
  T extends Juncture ? T :
    T extends JunctureRequest<infer J> ? J :
      T extends TransientBranch<infer J> ? J :
        never;

type UnbindedFrameQueryOfUseJunctureQuery<T> = {
  readonly [K in keyof T]: UnbindedFrameQueryOfUseJunctureQueryItem<T[K]>;
};

export interface UseJunctureFrame<Q extends UseJunctureQuery>
  extends UnbindedFrame<UnbindedFrameQueryOfUseJunctureQuery<Q>> {}

// TODO: IMPLEMENT THIS
export function useJuncture<Q extends UseJunctureQuery>(query: Q): UseJunctureFrame<Q> {
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

  return engine.getFrame(query as any) as any;
}
