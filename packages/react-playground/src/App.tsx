/* eslint-disable react/jsx-props-no-spreading */
import {
  BIT, STRUCT
} from '@codecarvings/juncture';
import { useState } from 'react';
import { Primary } from './state/primary';
import { useJuncture } from './use-juncture';

class AppDriver extends STRUCT.of({
  title: BIT.of('My transient title'),
  counter: BIT.settable.number
}) { }

function App() {
  const { select, dispatch, _ } = useJuncture({
    primary: Primary,
    myState: { run: AppDriver }
  });
  const [counter, setCounter] = useState(-1);

  return (
    <div>
      <div>
        Primary:
        {' '}
        { select(_.primary.name).value }
      </div>
      <div>
        Transient:
        {' '}
        { select(_.myState.title).value }
        {' '}
        /
        {' '}
        { select(_.myState.counter).value }
      </div>
      <div>
        Counter:
        {' '}
        { counter }
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            setCounter(counter + 1);
            dispatch(_.myState.counter).inc();
          }}
        >
          Add

        </button>
      </div>
    </div>
  );
}

export default App;
