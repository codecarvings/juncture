/* eslint-disable react/jsx-props-no-spreading */
import {
  BIT, STRUCT
} from '@codecarvings/juncture';
import { Primary } from './state/primary';
import { useJuncture } from './use-juncture';

class Comp1Driver extends STRUCT.of({
  title: BIT.of('I am the component 1'),
  counter: BIT.settable.number,
  clock: BIT.settable.number
}) {
  'selector.titleLen' = this.FORGE.selector(({ value, _ }) => value(_.title).length);

  'behavior.clockUpdate' = this.FORGE.behavior(({ dispatch, _ }) => {
    const intervalId = setInterval(() => {
      dispatch(_.clock).inc();
    }, 1000);

    return () => clearInterval(intervalId);
  });
}

function Comp1() {
  const {
    select, dispatch, value, _
  } = useJuncture({
    primary: Primary,
    myState: { run: Comp1Driver }
  });

  return (
    <div style={{ backgroundColor: '#eecc00', padding: '10px' }}>
      <div>
        Primary:
        {' '}
        { select(_.primary.name).value }
      </div>
      <div>
        Temp 1 :
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
        Clock 1:
        {' '}
        { value(_.myState.clock) }
      </div>
      <div>
        Timestamp 1:
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

export default Comp1;
