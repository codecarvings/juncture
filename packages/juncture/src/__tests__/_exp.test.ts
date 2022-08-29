import { Engine } from '../engine';
import { $Bit } from '../lib/bit';
import { $Struct } from '../lib/struct';

test('experiment', () => {
  class Counter extends $Struct.Of({
    num1: class extends $Bit.Number {
      myChannel = this.FORGE.channel();

      myOpenChannel = this.FORGE.openChannel();
    }
  }) {
    behavior = this.FORGE.behavior(({ emit, _ }) => {
      const id = setTimeout(() => {
        emit().onTick();
        emit().onTickWithValue('sss');
        emit(_.num1).myOpenChannel();
      }, 1000);

      return () => {
        clearTimeout(id);
      };
    });

    onTick = this.FORGE.channel();

    onTickWithValue = this.FORGE.channel<string>();

    myBaseOpenChannel = this.FORGE.openChannel();
  }

  const engine = new Engine(Counter);
  const { select, _ } = engine.frame;

  engine.stop();
});
