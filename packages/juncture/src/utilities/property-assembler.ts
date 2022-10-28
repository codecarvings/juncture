/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { junctureSymbols } from '../juncture-symbols';

// #region Private Symbols
const propertyAssemblerCacheSymbol = Symbol('propertyAssemblerCache');
interface PrvSymbols {
  readonly propertyAssemblerCache: typeof propertyAssemblerCacheSymbol;
}
const prvSymbols: PrvSymbols = {
  propertyAssemblerCache: propertyAssemblerCacheSymbol
};
// #endregion

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
      throw Error(`Unable to wire assemblable property: Value not found in the container - placeholder: "${property.placeholder.toString()}".`);
    } else {
      // eslint-disable-next-line max-len
      throw Error(`Unable to wire assemblable property: The same value has been used multiple times (${totPropertyKeys}) in the container: [${propertyKeys.join(', ')}] - placeholder: "${property.placeholder.toString()}".`);
    }
  }

  static get(host: PropertyAssemblerHost): PropertyAssembler {
    if ((host as any)[prvSymbols.propertyAssemblerCache]) {
      return (host as any)[prvSymbols.propertyAssemblerCache];
    }

    const result = host[junctureSymbols.createPropertyAssembler]();
    // eslint-disable-next-line no-param-reassign
    (host as any)[prvSymbols.propertyAssemblerCache] = result;
    return result;
  }
}

export interface PropertyAssemblerHost {
  [junctureSymbols.createPropertyAssembler](): PropertyAssembler;
}
