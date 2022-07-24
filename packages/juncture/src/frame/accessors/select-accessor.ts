import { Cursor, getCtx, JunctureOfCursor } from '../../context/cursor';
import { CtxOf, Juncture, PrivateCursorOf } from '../../juncture';
import { PrivateSelectBin, SelectBin } from '../bins/select-bin';

export interface SelectAccessor<J extends Juncture> {
  (): PrivateSelectBin<J>;
  (_: PrivateCursorOf<J>): PrivateSelectBin<J>;
  <C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

interface PrivateSelectBinProvider<J> {
  readonly select: PrivateSelectBin<J>;
}

export function createSelectAccessor<J extends Juncture>(
  defaultCtx: CtxOf<J>,
  privateSelectBinProvider: PrivateSelectBinProvider<J>
) {
  return (_?: Cursor) => {
    const ctx = typeof _ !== 'undefined' ? getCtx(_) : defaultCtx;
    if (ctx === defaultCtx) {
      return privateSelectBinProvider.select;
    }
    return ctx.bins.select;
  };
}
