import { Juncture, ValueOf } from '../../juncture';
import { Cursor, JunctureOfCursor } from '../cursor';
import { Gear } from '../gear';
import { getGear } from '../gear-host';

export interface ValueAccessor<J extends Juncture> {
  value(): ValueOf<J>;
  value<C extends Cursor>(_: C): ValueOf<JunctureOfCursor<C>>;
}

export function createValueAccessor<J extends Juncture>(defaultGear: Gear): ValueAccessor<J> {
  return ((_?: Cursor) => {
    const gear = typeof _ !== 'undefined' ? getGear(_) : defaultGear;
    return gear.value;
  }) as any;
}
