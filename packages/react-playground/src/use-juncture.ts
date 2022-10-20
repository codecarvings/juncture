/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */

import { ActiveQuery, ActiveQueryFrame, ActiveQueryFrameHandler } from '@codecarvings/juncture';
import { JunctureContext } from '@codecarvings/react-juncture';
import React, {
  useContext, useEffect, useRef, useState
} from 'react';

const lastHandlerSymbol = Symbol('lastHandler');

interface ReactCurrentOwner {
  readonly mode: number;
  readonly flags: number;
  readonly type: any;
}

let ReactCurrentOwnerCache: any;
function getReactCurrentOwner(): ReactCurrentOwner {
  if (ReactCurrentOwnerCache) {
    return ReactCurrentOwnerCache.current;
  }

  const reactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  if (reactInternals) {
    if (reactInternals.ReactCurrentOwner) {
      ReactCurrentOwnerCache = reactInternals.ReactCurrentOwner;
      return ReactCurrentOwnerCache.current;
    }
  }

  throw Error(`Unsupported React Version (${React.version})`);
}

const useEffectEmptyfn = () => {};
const useEffectEmptyDeps: any[] = [];

export function useJuncture<Q extends ActiveQuery>(query: Q): ActiveQueryFrame<Q> {
  const engine = useContext(JunctureContext);
  const handlerRef = useRef<ActiveQueryFrameHandler>(undefined!);
  let handler: ActiveQueryFrameHandler<Q>;
  const countRef = useRef(0);
  const [_state, setState] = useState(false);

  if (handlerRef.current) {
    // State update
    handler = handlerRef.current as any;
    handler.clearValueUsageCassette();
    useEffect(useEffectEmptyfn, useEffectEmptyDeps);
  } else {
    // Initialization
    let isStrictModeOn: boolean;
    let isSecondRender: boolean;
    let type: any;

    const currentOwner = getReactCurrentOwner();
    if (currentOwner) {
      isStrictModeOn = !!(currentOwner.mode & 8);
      isSecondRender = !!(currentOwner.flags & 1);
      type = currentOwner.type;
    } else {
      // Assume no strict mode
      isStrictModeOn = false;
      isSecondRender = false;
    }

    if (!isSecondRender) {
      // Create the handler
      handler = engine.createAciveFrameHandler(query);
      handlerRef.current = handler;

      if (isStrictModeOn) {
        // STRICT MODE: cache the handler to reuse it in the second render
        type[lastHandlerSymbol] = handler;
      }
    } else {
      // STRICT MODE: reuse the handler already created in the first render
      handler = type[lastHandlerSymbol];
      delete type[lastHandlerSymbol];
      handlerRef.current = handler;
      handler.clearValueUsageCassette();
    }

    useEffect(() => {
      countRef.current += 1;
      if (isStrictModeOn && countRef.current !== 2) {
        // STRICT MODE: Ignore the first useEffect
        return undefined;
      }

      handler.valueMutationAck$.subscribe(() => {
        // Prevent further events before re-rendering
        handler.clearValueUsageCassette();

        // console.count('State update');
        setState(state => !state);
      });

      return () => {
        // valueMutationAck observable unsubscribed in the release function
        handler.release();
      };
    }, []);
  }

  return handler.frame;
}
