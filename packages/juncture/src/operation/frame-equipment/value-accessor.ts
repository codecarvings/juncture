import { Driver, ValueOf } from '../../driver';
import { defineLazyProperty } from '../../utilities/object';
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
  defineLazyProperty(valueAccessor, 'get', () => (_?: Cursor) => {
    if (typeof _ !== 'undefined') {
      return getRealm(_).value;
    }
    return realm.value;
  });
  defineLazyProperty(valueAccessor, 'set', () => (...args: any) => {
    if (args.length > 1) {
      return { target: getRealm(args[0]), payload: args[1] };
    }
    return { target: realm, payload: args[0] };
  });
  return valueAccessor;
}
// #endregion

// #region unbindedValueGetter
export function unbindedValueGetter<C extends Cursor>(_: C): ValueOfCursor<C> {
  return getRealm(_).value;
}
// #endregion
