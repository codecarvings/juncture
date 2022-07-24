/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { jSymbols } from '../symbols';

// --- Symbols
const propertyAssemblerCacheSymbol = Symbol('propertyAssemblerCache');
interface PropertyAssemblerSymbols {
  readonly propertyAssemblerCache: typeof propertyAssemblerCacheSymbol;
}
const propertyAssemblerSymbols: PropertyAssemblerSymbols = {
  propertyAssemblerCache: propertyAssemblerCacheSymbol
};

export interface AssemblablePropertyFactory {
  (key: string, parentValue: any, container: any): any;
}

interface StaticAssemblableProperty {
  readonly placeholder: symbol;
  readonly type: 'static';
  readonly value: any;
}

interface DynamicAssemblableProperty {
  readonly placeholder: symbol;
  readonly type: 'dynamic';
  readonly factory: AssemblablePropertyFactory;
}

type AssemblableProperty = StaticAssemblableProperty | DynamicAssemblableProperty;

let placeholderCounter = 0;
function createPlaceholder() {
  placeholderCounter += 1;
  return Symbol(`Placeholder #${placeholderCounter}`);
}

export class PropertyAssembler {
  protected pendingProperty: AssemblableProperty | undefined;

  protected readonly valueCache = new Map<string, object>();

  constructor(protected readonly container: any) { }

  registerStaticProperty<V>(value: V): V {
    this.wire();

    const placeholder = createPlaceholder();
    this.pendingProperty = {
      placeholder, type: 'static', value
    };

    return placeholder as any;
  }

  registerDynamicProperty(factory: AssemblablePropertyFactory): any {
    this.wire();

    const placeholder = createPlaceholder();
    this.pendingProperty = {
      placeholder, type: 'dynamic', factory
    };

    return placeholder as any;
  }

  wire() {
    if (this.pendingProperty === undefined) {
      return;
    }

    const property = this.pendingProperty;
    this.pendingProperty = undefined;

    const keys = Object.keys(this.container);
    const propertyKeys = keys.filter(key => (this.container as any)[key] === property.placeholder);
    const totPropertyKeys = propertyKeys.length;

    if (totPropertyKeys === 1) {
      const key = propertyKeys[0];
      let newValue: any;
      if (property.type === 'static') {
        newValue = property.value;
      } else {
        const parentValue = this.valueCache.get(key);
        newValue = property.factory(key, parentValue, this.container);
      }
      this.container[key] = newValue;
      this.valueCache.set(key, newValue);
    } else if (totPropertyKeys === 0) {
      // eslint-disable-next-line max-len
      throw Error(`Unable to wire assemblable property: value not found in the container - placeholder: "${property.placeholder.toString()}".`);
    } else {
      // eslint-disable-next-line max-len
      throw Error(`Unable to wire assemblable property: The same value has been used multiple times (${totPropertyKeys}) in the container: [${propertyKeys.join(', ')}] - placeholder: "${property.placeholder.toString()}".`);
    }
  }

  static get(host: PropertyAssemblerHost): PropertyAssembler {
    if ((host as any)[propertyAssemblerSymbols.propertyAssemblerCache]) {
      return (host as any)[propertyAssemblerSymbols.propertyAssemblerCache];
    }

    const result = host[jSymbols.createPropertyAssembler]();
    // eslint-disable-next-line no-param-reassign
    (host as any)[propertyAssemblerSymbols.propertyAssemblerCache] = result;
    return result;
  }
}

export interface PropertyAssemblerHost {
  [jSymbols.createPropertyAssembler](): PropertyAssembler;
}
