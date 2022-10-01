/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Juncture } from '@codecarvings/juncture';
import { BranchConfig } from '@codecarvings/juncture/dist/operation/branch-manager';
import {
  useContext, useEffect, useRef, useState
} from 'react';
import JunctureContext from './juncture-context';

// TODO: IMPLEMENT THIS
export function useTransientJuncture<J extends Juncture>(juncture: J): string;
export function useTransientJuncture<J extends Juncture>(config: BranchConfig<J>): string;
export function useTransientJuncture(juncture_or_config: Juncture | BranchConfig) {
  const engine = useContext(JunctureContext);
  const [keyCache, setKeyCache] = useState('');
  const keyCacheRef = useRef('');

  let key: string;
  if (keyCache === '') {
    if (keyCacheRef.current === '') {
      key = engine.mountBranch(juncture_or_config as any);
      setKeyCache(key);
      keyCacheRef.current = key;
      console.log(`Mounting ${key} - ${new Date().toISOString()}`);
    } else {
      key = keyCache;
      console.log(`Skipping mount of ${key} - ${new Date().toISOString()}`);
    }
  } else {
    key = keyCache;
  }

  useEffect(() => {
    // if (keyCacheRef.current === state) {
    return () => {
      // console.log(`Unmounting ${key} - ${new Date().toISOString()}`);
      // engine.unmountBranch(key);
    };
    // }
    return undefined;
  }, []);

  return key;
}
