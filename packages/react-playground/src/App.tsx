/* eslint-disable react/jsx-props-no-spreading */

import { JunctureContext } from '@codecarvings/react-juncture';
import { useContext, useState } from 'react';
import Comp1 from './Comp1';
import Comp2 from './Comp2';

function App() {
  const [state, setState] = useState(0);
  const [useComp1, setUseComp1] = useState(false);

  const engine = useContext(JunctureContext);
  console.dir(engine.state);

  return (
    <div style={{ backgroundColor: '#cc00ee', padding: '10px' }}>
      {useComp1 && <Comp1 /> }
      <Comp2 />
      <div>
        Timestamp App:
        {' '}
        { new Date().toISOString() }
      </div>
      <div>
        State:
        {' '}
        { state }
      </div>
      <div>
        <button
          type="button"
          onClick={() => setState(value => value + 1)}
        >
          Add
        </button>
      </div>
      <div>
        <button
          type="button"
          onClick={() => setUseComp1(value => !value)}
        >
          Switch Comp 1
        </button>
      </div>
    </div>
  );
}

export default App;
