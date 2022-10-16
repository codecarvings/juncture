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
import { ControlledActiveQueryFrame } from '@codecarvings/juncture/dist/operation/frames/active-query-frame';
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
  const controlledFrameRef = useRef<ControlledActiveQueryFrame>(undefined!);
  const unmountCountRef = useRef(0);

  let controlledFrame: ControlledActiveQueryFrame<Q>;
  if (controlledFrameRef.current) {
    controlledFrame = controlledFrameRef.current as any;

    console.log('AAA');
    useEffect(() => () => {
      console.log('UNMOUNTING AFTER');
      console.dir(controlledFrame);
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
      controlledFrame = engine.createControlledAciveFrame(query);
      controlledFrameRef.current = controlledFrame;
      if (isStrictModeOn) {
        type[lastHandlerSymbol] = controlledFrame;
      }
    } else {
      console.log('CCC');
      controlledFrame = type[lastHandlerSymbol];
      delete type[lastHandlerSymbol];
      controlledFrameRef.current = controlledFrame;
    }

    if (isStrictModeOn) {
      useEffect(() => () => {
        unmountCountRef.current += 1;
        if (unmountCountRef.current === 2) {
          controlledFrame.release();
          console.log('UNMOUNTING final');
          console.dir(controlledFrame);
        }
      }, []);
    } else {
      useEffect(() => () => {
        controlledFrame.release();
        console.log('UNMOUNTING');
        console.dir(controlledFrame);
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
  return controlledFrame.frame;
}
