import { Driver, ValueOf } from '../../driver';
import { defineLazyProperty } from '../../tool/object';
import { Instruction } from '../instruction';
import { Realm } from '../realm';
import { getRealm } from '../realm-host';
import { Cursor, ValueOfCursor } from './cursor';

export interface ValueHandler<D extends Driver = Driver> {
  get(): ValueOf<D>;
  get<C extends Cursor>(_: C): ValueOfCursor<C>;

  set(value: ValueOf<D>): Instruction;
  set<C extends Cursor>(_: C, value: ValueOfCursor<C>): Instruction;
}

export interface ValueHandlerHost<D extends Driver = Driver> {
  readonly value: ValueHandler<D>;
}

export function createValueHandler<D extends Driver>(realm: Realm): ValueHandler<D> {
  const valueHandler: any = { };
  defineLazyProperty(valueHandler, 'get', () => (_?: Cursor) => {
    if (typeof _ !== 'undefined') {
      return getRealm(_).value;
    }
    return realm.value;
  });
  defineLazyProperty(valueHandler, 'set', () => (...args: any) => {
    if (args.length > 1) {
      return { target: getRealm(args[0]), payload: args[1] };
    }
    return { target: realm, payload: args[0] };
  });
  return valueHandler;
}
