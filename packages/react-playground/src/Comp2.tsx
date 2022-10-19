/* eslint-disable react/jsx-props-no-spreading */
import {
  BIT, STRUCT
} from '@codecarvings/juncture';
import { useJuncture } from './use-juncture';

class Comp2Driver extends STRUCT.of({
  title: BIT.of('I am the component 2'),
  counter: BIT.settable.number,
  clock: BIT.settable.number
}) {
  'selector.titleLen' = this.FORGE.selector(({ value, _ }) => value(_.title).length);

  'behavior.clockUpdate' = this.FORGE.behavior(({ dispatch, _ }) => {
    const intervalId = setInterval(() => {
      dispatch(_.clock).inc();
    }, 3333);

    return () => clearInterval(intervalId);
  });
}

function Comp2() {
  const {
    select, dispatch, value, _
  } = useJuncture({
    myState: { run: Comp2Driver }
  });

  return (
    <div style={{ backgroundColor: '#ccee00', padding: '10px' }}>
      <div>
        Temp 2:
        {' '}
        { value(_.myState.title) }
        {' '}
        (
        { select(_.myState).titleLen }
        )
        {' '}
        /
        {' '}
        { select(_.myState.counter).value }
      </div>
      <div>
        Clock 2:
        {' '}
        { value(_.myState.clock) }
      </div>
      <div>
        Timestamp 2:
        {' '}
        { new Date().toISOString() }
      </div>
      <div>
        <button
          type="button"
          onClick={() => dispatch(_.myState.counter).inc()}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default Comp2;
