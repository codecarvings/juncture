import { Juncture, PrivateCursorOf } from '../../juncture';
import { createAccessorFactory, createPrivateAccessorFactory } from '../accessor';
import { DispatchBin, PrivateDispatchBin, PrivateDispatchBinHost } from '../bins/dispatch-bin';
import { Ctx } from '../ctx';
import { Cursor, JunctureOfCursor } from '../cursor';

// #region DispatchAccessor
export interface DispatchAccessor<J extends Juncture> {
  (): DispatchBin<J>;
  <C extends Cursor>(_: C): DispatchBin<JunctureOfCursor<C>>;
}

export const createDispatchAccessor
: <J extends Juncture>(defaultCtx: Ctx) => DispatchAccessor<J> = createAccessorFactory('dispatch');
// #endregion

// #region PrivateDispatchAccessor
export interface PrivateDispatchAccessor<J extends Juncture> {
  (): PrivateDispatchBin<J>;
  (_: PrivateCursorOf<J>): PrivateDispatchBin<J>;
  <C extends Cursor>(_: C): DispatchBin<JunctureOfCursor<C>>;
}

export const createPrivateDispatchAccessor : <J extends Juncture>(
  defaultCtx: Ctx,
  privateDispatchBinHost: PrivateDispatchBinHost<J>
) => PrivateDispatchAccessor<J> = createPrivateAccessorFactory('dispatch');
// #endregion
