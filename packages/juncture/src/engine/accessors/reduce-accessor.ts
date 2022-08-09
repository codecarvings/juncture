import { InternalCursorOf, Juncture } from '../../juncture';
import { createAccessorFactory, createInternalAccessorFactory } from '../accessor';
import { InternalReduceBin, InternalReduceBinHost, ReduceBin } from '../bins/reduce-bin';
import { Cursor, JunctureOfCursor } from '../cursor';
import { Gear } from '../gear';

// #region ReduceAccessor
export interface ReduceAccessor<J extends Juncture> {
  (): ReduceBin<J>;
  <C extends Cursor>(_: C): ReduceBin<JunctureOfCursor<C>>;
}

export const createReduceAccessor
: <J extends Juncture>(defaultGear: Gear) => ReduceAccessor<J> = createAccessorFactory('reduce');
// #endregion

// #region InternalReduceAccessor
export interface InternalReduceAccessor<J extends Juncture> {
  (): InternalReduceBin<J>;
  (_: InternalCursorOf<J>): InternalReduceBin<J>;
  <C extends Cursor>(_: C): ReduceBin<JunctureOfCursor<C>>;
}

export const createInternalReduceAccessor : <J extends Juncture>(
  defaultGear: Gear,
  internalReduceBinHost: InternalReduceBinHost<J>
) => InternalReduceAccessor<J> = createInternalAccessorFactory('reduce');
// #endregion
