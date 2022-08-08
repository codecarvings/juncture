import { InternalCursorOf, Juncture } from '../../juncture';
import { InternalSourceBin, SourceBin } from '../bins/source-bin';
import { Ctx } from '../ctx';
import { Cursor, JunctureOfCursor } from '../cursor';

// #region SourceAccessor
export interface SourceAccessor<J extends Juncture> {
  (): SourceBin<J>;
  <C extends Cursor>(_: C): SourceBin<JunctureOfCursor<C>>;
}

// TODO: IMPLEMENT THIS
export const createSourceAccessor
: <J extends Juncture>(defaultCtx: Ctx) => SourceAccessor<J> = undefined!;
// #endregion

// #region InternalSourceAccessor
export interface InternalSourceAccessor<J extends Juncture> {
  (): InternalSourceBin<J>;
  (_: InternalCursorOf<J>): InternalSourceBin<J>;
  <C extends Cursor>(_: C): SourceBin<JunctureOfCursor<C>>;
}

// TODO: IMPLEMENT THIS
export const createInternalSourceAccessor: <J extends Juncture>(
  defaultCtx: Ctx,
) => InternalSourceAccessor<J> = undefined!;
// #endregion
