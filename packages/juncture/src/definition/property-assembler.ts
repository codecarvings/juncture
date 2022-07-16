/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface AssemblablePropertyCallback {
  (key: string, parentValue: object | undefined): void;
}

interface AssemblableProperty {
  readonly value: object;
  readonly callback: AssemblablePropertyCallback | undefined;
}

export interface PropertyAssembler {
  registerProperty<V extends object>(value: V, callback?: AssemblablePropertyCallback): V;
  isClosed: boolean;
  close(): void;
}

let spaInstancesToCheck: StandardPropertyAssembler[] = [];
let spaCheckTaskQueued = false;
function spaCheckTask() {
  try {
    spaInstancesToCheck.forEach(instance => {
      if (!instance.isClosed) {
        throw Error('PropertyAssembler close method has not been invoked.');
      }
    });
  } finally {
    spaInstancesToCheck = [];
    spaCheckTaskQueued = false;
  }
}
function spaQueueCheckTask() {
  if (!spaCheckTaskQueued) {
    spaCheckTaskQueued = true;
    queueMicrotask(spaCheckTask);
  }
}
function spaRegisterCheckTask(instance: StandardPropertyAssembler) {
  spaInstancesToCheck.push(instance);
  spaQueueCheckTask();
}

export class StandardPropertyAssembler implements PropertyAssembler {
  protected pendingProperty: AssemblableProperty | undefined;

  protected readonly valueCache = new Map<string, object>();

  #isClosed = false;

  get isClosed() {
    return this.#isClosed;
  }

  constructor(protected readonly container: object, checkClose: boolean = true) {
    if (checkClose) {
      spaRegisterCheckTask(this);
    }
  }

  registerProperty<V extends object>(value: V, callback?: AssemblablePropertyCallback): V {
    this.ensureNotClosed();

    this.wire();

    this.pendingProperty = {
      value, callback
    };

    return value;
  }

  close(): void {
    this.ensureNotClosed();

    this.#isClosed = true;
    this.wire();
  }

  protected ensureNotClosed() {
    if (this.isClosed) {
      throw Error('Property assembler already closed.');
    }
  }

  protected wire() {
    if (this.pendingProperty === undefined) {
      return;
    }

    const property = this.pendingProperty;
    this.pendingProperty = undefined;

    const keys = Object.keys(this.container);
    const propertyKeys = keys.filter(key => (this.container as any)[key] === property.value);
    const totPropertyKeys = propertyKeys.length;

    if (totPropertyKeys === 1) {
      const key = propertyKeys[0];
      if (property.callback) {
        const parentValue = this.valueCache.get(key);
        property.callback(key, parentValue);
      }
      this.valueCache.set(key, property.value);
    } else if (totPropertyKeys === 0) {
      // eslint-disable-next-line max-len
      throw Error(`Unable to wire assemblable property: value not found in the container: ${JSON.stringify(property.value)}.`);
    } else {
      // eslint-disable-next-line max-len
      throw Error(`Unable to wire assemblable property: The same value has been used multiple times (${totPropertyKeys}) in the container: [${propertyKeys.join(', ')}].`);
    }
  }
}
