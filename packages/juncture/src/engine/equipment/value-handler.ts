import { Juncture, ValueOf } from '../../juncture';
import { defineLazyProperty } from '../../tool/object';
import { Gear } from '../gear';
import { getGear } from '../gear-host';
import { Instruction } from '../instruction';
import { Cursor, ValueOfCursor } from './cursor';

export interface ValueHandler<J extends Juncture = Juncture> {
  get(): ValueOf<J>;
  get<C extends Cursor>(_: C): ValueOfCursor<C>;

  set(value: ValueOf<J>): Instruction;
  set<C extends Cursor>(_: C, value: ValueOfCursor<C>): Instruction;
}

export interface ValueHandlerHost<J extends Juncture = Juncture> {
  readonly value: ValueHandler<J>;
}

export function createValueHandler<J extends Juncture>(gear: Gear): ValueHandler<J> {
  const valueHandler: any = { };
  defineLazyProperty(valueHandler, 'get', () => (_?: Cursor) => {
    if (typeof _ !== 'undefined') {
      return getGear(_).value;
    }
    return gear.value;
  });
  defineLazyProperty(valueHandler, 'set', () => (...args: any[]) => {
    if (args.length > 1) {
      return { target: getGear(args[0]), payload: args[1] };
    }
    return { target: gear, payload: args[0] };
  });
  return valueHandler;
}
