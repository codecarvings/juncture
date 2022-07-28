import { Juncture, ValueOf } from '../../juncture';
import { Ctx } from '../ctx';
import { Cursor, getCtx, JunctureOfCursor } from '../cursor';

export interface ValueAccessor<J extends Juncture> {
  value(): ValueOf<J>;
  value<C extends Cursor>(_: C): ValueOf<JunctureOfCursor<C>>;
}

export function createValueAccessor<J extends Juncture>(defaultCtx: Ctx): ValueAccessor<J> {
  return ((_?: Cursor) => {
    const ctx = typeof _ !== 'undefined' ? getCtx(_) : defaultCtx;
    return ctx.getValue();
  }) as any;
}
