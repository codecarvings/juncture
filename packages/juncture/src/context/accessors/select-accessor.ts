import { InternalCursorOf, Juncture } from '../../juncture';
import { createAccessorFactory, createInternalAccessorFactory } from '../accessor';
import { InternalSelectBin, InternalSelectBinHost, SelectBin } from '../bins/select-bin';
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

// #region InternalSelectAccessor
export interface InternalSelectAccessor<J extends Juncture> {
  (): InternalSelectBin<J>;
  (_: InternalCursorOf<J>): InternalSelectBin<J>;
  <C extends Cursor>(_: C): SelectBin<JunctureOfCursor<C>>;
}

export const createInternalSelectAccessor : <J extends Juncture>(
  defaultCtx: Ctx,
  internalSelectBinHost: InternalSelectBinHost<J>
) => InternalSelectAccessor<J> = createInternalAccessorFactory('select');
// #endregion
