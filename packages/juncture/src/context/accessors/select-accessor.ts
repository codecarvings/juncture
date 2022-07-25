import { CtxOf, Juncture, PrivateCursorOf } from '../../juncture';
import { PrivateSelectBin, PrivateSelectBinProvider, SelectBin } from '../bins/select-bin';
import { Cursor, getCtx, JunctureOfCursor } from '../cursor';

// #region SelectAccessor
export interface SelectAccessor<J extends Juncture> {
  (): SelectBin<J>;
  <C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export function createSelectAccessor<J extends Juncture>(defaultCtx: CtxOf<J>) {
  return (_?: Cursor) => {
    const ctx = typeof _ !== 'undefined' ? getCtx(_) : defaultCtx;
    return ctx.bins.select;
  };
}
// #endregion

// #region PrivateSelectAccessor
export interface PrivateSelectAccessor<J extends Juncture> {
  (): PrivateSelectBin<J>;
  (_: PrivateCursorOf<J>): PrivateSelectBin<J>;
  <C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export function createPrivateSelectAccessor<J extends Juncture>(
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
// #endregion
