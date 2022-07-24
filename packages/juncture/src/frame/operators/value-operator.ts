import { Cursor, getCtx, JunctureOfCursor } from '../../context/cursor';
import { ValueOf } from '../../juncture';

export function valueOperator<C extends Cursor>(_: C): ValueOf<JunctureOfCursor<C>> {
  const ctx = getCtx(_);
  return null!;
}
