import { Juncture, PrivateCursorOf } from '../../juncture';
import { PrivateSelectBin, PrivateSelectBinHost, SelectBin } from '../bins/select-bin';
import { Ctx } from '../ctx';
import { Cursor, getCtx, JunctureOfCursor } from '../cursor';

// #region SelectAccessor
export interface SelectAccessor<J extends Juncture> {
  (): SelectBin<J>;
  <C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export function createSelectAccessor<J extends Juncture>(defaultCtx: Ctx): SelectAccessor<J> {
  return ((_?: Cursor) => {
    const ctx = typeof _ !== 'undefined' ? getCtx(_) : defaultCtx;
    return ctx.bins.select;
  }) as SelectAccessor<J>;
}
// #endregion

// #region PrivateSelectAccessor
export interface PrivateSelectAccessor<J extends Juncture> {
  (): PrivateSelectBin<J>;
  (_: PrivateCursorOf<J>): PrivateSelectBin<J>;
  <C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export function createPrivateSelectAccessor<J extends Juncture>(
  defaultCtx: Ctx,
  privateSelectBinHost: PrivateSelectBinHost<J>
): PrivateSelectAccessor<J> {
  return ((_?: Cursor) => {
    const ctx = typeof _ !== 'undefined' ? getCtx(_) : defaultCtx;
    if (ctx === defaultCtx) {
      return privateSelectBinHost.select;
    }
    return ctx.bins.select;
  }) as PrivateSelectAccessor<J>;
}
// #endregion
