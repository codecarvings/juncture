import { InternalCursorOf, Juncture } from '../../juncture';
import { InternalSourceBin, SourceBin } from '../bins/source-bin';
import { Cursor, JunctureOfCursor } from '../cursor';
import { Gear } from '../gear';

// #region SourceAccessor
export interface SourceAccessor<J extends Juncture> {
  (): SourceBin<J>;
  <C extends Cursor>(_: C): SourceBin<JunctureOfCursor<C>>;
}

// TODO: IMPLEMENT THIS
export const createSourceAccessor
: <J extends Juncture>(defaultGear: Gear) => SourceAccessor<J> = undefined!;
// #endregion

// #region InternalSourceAccessor
export interface InternalSourceAccessor<J extends Juncture> {
  (): InternalSourceBin<J>;
  (_: InternalCursorOf<J>): InternalSourceBin<J>;
  <C extends Cursor>(_: C): SourceBin<JunctureOfCursor<C>>;
}

// TODO: IMPLEMENT THIS
export const createInternalSourceAccessor: <J extends Juncture>(
  defaultGear: Gear,
) => InternalSourceAccessor<J> = undefined!;
// #endregion
