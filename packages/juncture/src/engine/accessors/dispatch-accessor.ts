import { InternalCursorOf, Juncture } from '../../juncture';
import { createAccessorFactory, createInternalAccessorFactory } from '../accessor';
import { DispatchBin, InternalDispatchBin, InternalDispatchBinHost } from '../bins/dispatch-bin';
import { Cursor, JunctureOfCursor } from '../cursor';
import { Gear } from '../gear';

// #region DispatchAccessor
export interface DispatchAccessor<J extends Juncture> {
  (): DispatchBin<J>;
  <C extends Cursor>(_: C): DispatchBin<JunctureOfCursor<C>>;
}

export const createDispatchAccessor
: <J extends Juncture>(defaultGear: Gear) => DispatchAccessor<J> = createAccessorFactory('dispatch');
// #endregion

// #region InternalDispatchAccessor
export interface InternalDispatchAccessor<J extends Juncture> {
  (): InternalDispatchBin<J>;
  (_: InternalCursorOf<J>): InternalDispatchBin<J>;
  <C extends Cursor>(_: C): DispatchBin<JunctureOfCursor<C>>;
}

export const createInternalDispatchAccessor : <J extends Juncture>(
  defaultGear: Gear,
  internalDispatchBinHost: InternalDispatchBinHost<J>
) => InternalDispatchAccessor<J> = createInternalAccessorFactory('dispatch');
// #endregion
