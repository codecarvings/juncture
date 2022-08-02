import { Juncture, PrivateCursorOf } from '../../juncture';
import { createAccessorFactory, createPrivateAccessorFactory } from '../accessor';
import { PrivateSelectBin, PrivateSelectBinHost, SelectBin } from '../bins/select-bin';
import { Ctx } from '../ctx';
import { Cursor, JunctureOfCursor } from '../cursor';

// #region SelectAccessor
export interface SelectAccessor<J extends Juncture> {
  (): SelectBin<J>;
  <C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export const createSelectAccessor
: <J extends Juncture>(defaultCtx: Ctx) => SelectAccessor<J> = createAccessorFactory('select');
// #endregion

// #region PrivateSelectAccessor
export interface PrivateSelectAccessor<J extends Juncture> {
  (): PrivateSelectBin<J>;
  (_: PrivateCursorOf<J>): PrivateSelectBin<J>;
  <C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export const createPrivateSelectAccessor : <J extends Juncture>(
  defaultCtx: Ctx,
  privateSelectBinHost: PrivateSelectBinHost<J>
) => PrivateSelectAccessor<J> = createPrivateAccessorFactory('select');
// #endregion
