/* eslint-disable react/jsx-props-no-spreading */
import {
  BIT, STRUCT
} from '@codecarvings/juncture';
import { useState } from 'react';
import { Primary } from './state/primary';
import { useJuncture } from './use-juncture';

class AppDriver extends STRUCT.of({
  title: BIT.of('My transient title')
}) { }

function App() {
  const { _ } = useJuncture({
    primary: { get: Primary, optional: true },
    myState: { run: AppDriver }
  });
  const [counter, setCounter] = useState(0);
  console.log(_);

  return (
    <div>
      <div>
        AppState:
      </div>
      <div>
        Counter:
        {' '}
        { counter }
      </div>
      <div>
        <button type="button" onClick={() => setCounter(counter + 1)}>Add</button>
      </div>
    </div>
  );
}

export default App;
