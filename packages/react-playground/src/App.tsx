import { BIT, STRUCT } from '@codecarvings/juncture';
import { useTransientJuncture } from '@codecarvings/react-juncture';
import { Primary } from './state/primary';
import { useJuncture2 } from './temp';

class AppState extends STRUCT.of({
  title: BIT.of('My transient title')
}) { }

function App() {
  useTransientJuncture(AppState);
  const { value, select, _ } = useJuncture2({
    Primary,
    AppState: { juncture: AppState }
  });

  return (
    <>
      <div>
        Juncture says:
        { value(_.Primary.name) }
        <br />
        My branch is:
        { select(_.Primary).branchKey }
      </div>
      <div>
        Transient juncture:
        { value(_.AppState).title }
        <br />
        transient branch is:
        { select(_.AppState).branchKey }
      </div>
    </>
  );
}

export default App;
