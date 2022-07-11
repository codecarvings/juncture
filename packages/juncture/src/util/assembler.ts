/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

interface AssemblableCallback {
  (key: string, parentValue: object | undefined): void;
}

interface AssemblableProp {
  readonly value: object;
  readonly callback: AssemblableCallback | undefined;
}

interface AssemblableInstance {
  container: object;
  pendingProp: AssemblableProp | undefined;
  readonly valueCache: Map<string, object>;
}

const finalizeAssemblingCheckInterval = 10;
const instances = new Map<object, AssemblableInstance>();

function wireAssemblableInstance(instance: AssemblableInstance) {
  if (instance.pendingProp !== undefined) {
    const prop = instance.pendingProp;
    // eslint-disable-next-line no-param-reassign
    instance.pendingProp = undefined;

    const keys = Object.keys(instance.container);
    const propKeys = keys.filter(key => (instance.container as any)[key] === prop.value);
    const totPropKeys = propKeys.length;
    if (totPropKeys === 1) {
      const key = propKeys[0];
      if (prop.callback) {
        const parentValue = instance.valueCache.get(key);
        prop.callback(key, parentValue);
      }
      instance.valueCache.set(key, prop.value);
    } else if (totPropKeys === 0) {
      // eslint-disable-next-line max-len
      throw Error(`Unable to wire assemblable property: value not found in the container: ${JSON.stringify(prop.value)}.`);
    } else {
      throw Error(`Unable to wire assemblable property: The same value has been used multiple times (${totPropKeys}) `
      + `in the container: [${propKeys.join(', ')}].`);
    }
  }
}

export function finalizeAssembling(container: object) {
  if (instances.has(container)) {
    const instance = instances.get(container)!;
    instances.delete(container);
    wireAssemblableInstance(instance);
  }
}

export function registerAssemblableProp<V extends object>(
  container: object,
  value: V,
  callback?: AssemblableCallback
): V {
  let instance: AssemblableInstance;
  if (instances.has(container)) {
    instance = instances.get(container)!;
  } else {
    instance = {
      container,
      pendingProp: undefined,
      valueCache: new Map<string, object>()
    };
    instances.set(container, instance);
    setTimeout(() => {
      if (instances.has(container)) {
        throw Error('finalizeAssembling has not been invoked.');
      }
    }, finalizeAssemblingCheckInterval);
  }

  wireAssemblableInstance(instance);
  instance.pendingProp = {
    value, callback
  };

  return value;
}
