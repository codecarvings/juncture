import { Driver, ValueOf } from '../../driver';
import { ActiveQuerySelectionInspector } from '../frames/active-query-frame';
import { Instruction } from '../instruction';
import { Realm } from '../realm';
import { getRealm } from '../realm-host';
import { Cursor, ValueOfCursor } from './cursor';

// #region ValueAccessor
export interface ValueAccessor<D extends Driver = Driver> {
  get(): ValueOf<D>;
  get<C extends Cursor>(_: C): ValueOfCursor<C>;

  set(value: ValueOf<D>): Instruction;
  set<C extends Cursor>(_: C, value: ValueOfCursor<C>): Instruction;
}

export interface ValueAccessorHost<D extends Driver = Driver> {
  readonly value: ValueAccessor<D>;
}

export function createValueAccessor<D extends Driver>(realm: Realm): ValueAccessor<D> {
  const valueAccessor: any = { };

  valueAccessor.get = (_?: Cursor) => {
    if (typeof _ !== 'undefined') {
      return getRealm(_).value;
    }
    return realm.value;
  };

  valueAccessor.set = (...args: any) => {
    if (args.length > 1) {
      return { target: getRealm(args[0]), payload: args[1] };
    }
    return { target: realm, payload: args[0] };
  };

  return valueAccessor;
}
// #endregion

// #region unboundValueGetter
export function unboundValueGetter<C extends Cursor>(_: C): ValueOfCursor<C> {
  return getRealm(_).value;
}

const valueSelectorKey = 'value';
export function createActiveQueryValueGetter(inspector: ActiveQuerySelectionInspector) {
  return <C extends Cursor>(_: C): ValueOfCursor<C> => {
    const realm = getRealm(_);
    inspector(realm, valueSelectorKey, true);
    const result = realm.value;
    inspector(realm, valueSelectorKey, false);
    return result;
  };
}
// #endregion
