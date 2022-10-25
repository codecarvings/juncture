import { ActiveQuerySelectionInspector } from '../frames/active-query-frame';
import { getRealm } from '../realm-host';
import { Cursor, ValueOfCursor } from './cursor';

export function createActiveQueryValueGetter(inspector: ActiveQuerySelectionInspector) {
  return <C extends Cursor>(_: C): ValueOfCursor<C> => {
    inspector(true);
    const result = getRealm(_).value;
    inspector(false);
    return result;
  };
}
