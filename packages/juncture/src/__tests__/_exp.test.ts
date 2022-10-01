import { InjectionToken } from '../di/injection-token';
import { ValueOf } from '../driver';
import { Engine } from '../engine';
import { Juncture } from '../juncture';
import { BIT } from '../lib/bit';
import { STRUCT } from '../lib/struct';
import { Instruction } from '../operation/instruction';
import { Private } from '../private-juncture';

test('experiment', () => {
  class Config extends STRUCT.of({
    name: BIT.string
  }) { }

  class Service {
    age = 21;
  }

  const stringToken = new InjectionToken<string>();

  class Counter extends STRUCT.of({
    num1: class extends BIT.number {
      'channel.myChannel' = this.FORGE.channel();
    }
  }) {
    'dependency.config' = this.FORGE.dependency(Config);

    'dependency.optConfig' = this.FORGE.optDependency(Config);

    'dependency.service' = this.FORGE.dependency(Service);

    'dependency.string' = this.FORGE.dependency(stringToken);

    'selector.prova' = this.FORGE.selector(
      ({ value }) => value().num1
    );

    'selector.paramSel' = this.FORGE.paramSelector(
      () => (abc: string) => abc
    );

    'reactor.name' = this.FORGE.reactor(
      () => (value: number) => ({
        num1: value
      })
    );

    'reactor.ddd' = this.FORGE.synthReactor(
      ({ apply }) => (value: number): Instruction[] => [
        apply().name(value)
      ]
    );

    'procedure.doSomething' = this.FORGE.procedure(({ dispatch, _ }) => () => {
      dispatch(_).myReactor();
    });

    'behavior.1' = this.FORGE.behavior(
      ({ emit, _ }) => {
        const id = setTimeout(() => {
          emit().onTick();
          emit().onTickWithValue('sss');
        }, 1000);

        return () => {
          clearTimeout(id);
        };
      }
    );

    'selector.mySelector' = this.FORGE.selector(
      ({ select }): string => select().defaultValue.num1.toString()
    );

    'reactor.myReactor' = this.FORGE.reactor(
      ({ $ }) => (): ValueOf<this> => ({
        num1: parseInt($.string, 10)
      })
    );

    'channel.onTick' = this.FORGE.channel();

    'channel.onTickWithValue' = this.FORGE.channel<string>();
  }

  class Counter2 extends Counter {

  }

  class App extends STRUCT.of({
    config: Config,
    counter: Counter
  }) {
    'resolver.config' = this.FORGE.resolver(Config, ({ _ }) => _.config);

    'resolver.service' = this.FORGE.resolver(Service, () => new Service());

    'resolver.string' = this.FORGE.resolver(stringToken, () => '');
  }

  const engine = new Engine();
  engine.mountBranch({ juncture: App });
  // const { select, _ } = engine.frame;

  engine.stop();
});

test('experiment 2', () => {
  class Record extends STRUCT.of({
    id: BIT.number,
    description: Private(BIT.string)
  }) {
    'selector.description' = this.FORGE.selector(
      ({ value, _ }) => value(_.description)
    );
  }

  class App extends STRUCT.of({
    item: Record
  }) {}

  const engine = new Engine();
  engine.mountBranch({ juncture: App });
  const { select, _ } = engine.createFrame({
    app: App
  });
  expect(select(_.app.item).description);
  engine.stop();
});

test('should throw error if selector does not contain "selector." prefix', () => {
  class App extends BIT.string {
    len = this.FORGE.selector(({ select }) => select().path);
  }
  expect(() => {
    Juncture.getDriver(App);
  }).toThrow();
});

test('should throw error if something different than a Selector has the "selector." prefix', () => {
  class App extends BIT.string {
    'selector.num' = 21;
  }
  expect(() => {
    Juncture.getDriver(App);
  }).toThrow();
});
