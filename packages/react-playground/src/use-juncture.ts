/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ActiveQuery, ActiveQueryFrame } from '@codecarvings/juncture';
import { createUnboundFrame } from '@codecarvings/juncture/dist/operation/frames/unbound-frame';
import { ActiveQueryHandler } from '@codecarvings/juncture/dist/query/active-query-handler';
import { JunctureContext } from '@codecarvings/react-juncture';
import React, { useContext, useEffect, useRef } from 'react';

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

export function useJuncture<Q extends ActiveQuery>(query: Q): ActiveQueryFrame<Q> {
  const engine = useContext(JunctureContext);
  const handlerRef = useRef<ActiveQueryHandler>(undefined!);
  const unmountCountRef = useRef(0);

  let handler: ActiveQueryHandler;
  if (handlerRef.current) {
    handler = handlerRef.current;

    console.log('AAA');
    useEffect(() => () => {
      console.log('UNMOUNTING AFTER');
      console.dir(handler);
    }, []);
  } else {
    const currentOwner = getReactCurrentOwner();
    if (!currentOwner) {
      throw Error(`Unable to access React Current Owner (React version: ${React.version})`);
    }

    const isStrictModeOn = !!(currentOwner.mode & 8);
    const isSecondRender = !!(currentOwner.flags & 1);
    const { type } = currentOwner;

    if (!isSecondRender) {
      console.log('BBB');
      handler = engine.createHandler();
      handlerRef.current = handler;
      if (isStrictModeOn) {
        type[lastHandlerSymbol] = handler;
      }
    } else {
      console.log('CCC');
      handler = type[lastHandlerSymbol];
      delete type[lastHandlerSymbol];
      handlerRef.current = handler;
    }

    if (isStrictModeOn) {
      useEffect(() => () => {
        unmountCountRef.current += 1;
        if (unmountCountRef.current === 2) {
          console.log('UNMOUNTING final');
          console.dir(handler);
        }
      }, []);
    } else {
      useEffect(() => () => {
        console.log('UNMOUNTING');
        console.dir(handler);
      }, []);
    }

    // useEffect(() => {
    //   if (isStrictModeOn && !isSecondRender) {
    //     return undefined;
    //   }
    //   return () => {
    //     console.log('UNMOUNTING');
    //     console.dir(handler);
    //   };
    // }, []);
  }

  // TODO: remove handler.cursor property
  handler.update(query);
  return createUnboundFrame(handler.cursor);
}
