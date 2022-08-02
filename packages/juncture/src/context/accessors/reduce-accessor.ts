import { Juncture, PrivateCursorOf } from '../../juncture';
import { createAccessorFactory, createPrivateAccessorFactory } from '../accessor';
import { PrivateReduceBin, PrivateReduceBinHost, ReduceBin } from '../bins/reduce-bin';
import { Ctx } from '../ctx';
import { Cursor, JunctureOfCursor } from '../cursor';

// #region ReduceAccessor
export interface ReduceAccessor<J extends Juncture> {
  (): ReduceBin<J>;
  <C extends Cursor>(_: C): ReduceBin<JunctureOfCursor<C>>;
}

export const createReduceAccessor
: <J extends Juncture>(defaultCtx: Ctx) => ReduceAccessor<J> = createAccessorFactory('reduce');
// #endregion

// #region PrivateReduceAccessor
export interface PrivateReduceAccessor<J extends Juncture> {
  (): PrivateReduceBin<J>;
  (_: PrivateCursorOf<J>): PrivateReduceBin<J>;
  <C extends Cursor>(_: C): ReduceBin<JunctureOfCursor<C>>;
}

export const createPrivateReduceAccessor : <J extends Juncture>(
  defaultCtx: Ctx,
  privateReduceBinHost: PrivateReduceBinHost<J>
) => PrivateReduceAccessor<J> = createPrivateAccessorFactory('reduce');
// #endregion
