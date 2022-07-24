import { Cursor, getCtx, JunctureOfCursor } from '../../context/cursor';
import { CtxOf, Juncture, ValueOf } from '../../juncture';

export interface ValueAccessor<J extends Juncture> {
  value(): ValueOf<J>;
  value<C extends Cursor>(_: C): ValueOf<JunctureOfCursor<C>>;
}

export function createValueAccessor<J extends Juncture>(defaultCtx: CtxOf<J>) {
  return (_?: Cursor) => {
    const ctx = typeof _ !== 'undefined' ? getCtx(_) : defaultCtx;
    return ctx.getValue();
  };
}
