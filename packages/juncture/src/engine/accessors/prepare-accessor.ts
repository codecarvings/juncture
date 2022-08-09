import { InternalCursorOf, Juncture } from '../../juncture';
import { createAccessorFactory, createInternalAccessorFactory } from '../accessor';
import { InternalPrepareBin, InternalPrepareBinHost, PrepareBin } from '../bins/prepare-bin';
import { Cursor, JunctureOfCursor } from '../cursor';
import { Gear } from '../gear';

// #region PrepareAccessor
export interface PrepareAccessor<J extends Juncture> {
  (): PrepareBin<J>;
  <C extends Cursor>(_: C): PrepareBin<JunctureOfCursor<C>>;
}

export const createPrepareAccessor
: <J extends Juncture>(defaultGear: Gear) => PrepareAccessor<J> = createAccessorFactory('prepare');
// #endregion

// #region InternalPrepareAccessor
export interface InternalPrepareAccessor<J extends Juncture> {
  (): InternalPrepareBin<J>;
  (_: InternalCursorOf<J>): InternalPrepareBin<J>;
  <C extends Cursor>(_: C): PrepareBin<JunctureOfCursor<C>>;
}

export const createInternalPrepareAccessor : <J extends Juncture>(
  defaultGear: Gear,
  internalPrepareBinHost: InternalPrepareBinHost<J>
) => InternalPrepareAccessor<J> = createInternalAccessorFactory('prepare');
// #endregion
