import { Juncture, PrivateCursorOf } from '../../juncture';
import { createAccessorFactory, createPrivateAccessorFactory } from '../accessor';
import { PrepareBin, PrivatePrepareBin, PrivatePrepareBinHost } from '../bins/prepare-bin';
import { Ctx } from '../ctx';
import { Cursor, JunctureOfCursor } from '../cursor';

// #region PrepareAccessor
export interface PrepareAccessor<J extends Juncture> {
  (): PrepareBin<J>;
  <C extends Cursor>(_: C): PrepareBin<JunctureOfCursor<C>>;
}

export const createPrepareAccessor
: <J extends Juncture>(defaultCtx: Ctx) => PrepareAccessor<J> = createAccessorFactory('prepare');
// #endregion

// #region PrivatePrepareAccessor
export interface PrivatePrepareAccessor<J extends Juncture> {
  (): PrivatePrepareBin<J>;
  (_: PrivateCursorOf<J>): PrivatePrepareBin<J>;
  <C extends Cursor>(_: C): PrepareBin<JunctureOfCursor<C>>;
}

export const createPrivatePrepareAccessor : <J extends Juncture>(
  defaultCtx: Ctx,
  privatePrepareBinHost: PrivatePrepareBinHost<J>
) => PrivatePrepareAccessor<J> = createPrivateAccessorFactory('prepare');
// #endregion
