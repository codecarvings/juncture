/* eslint-disable max-len */
/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CtxHub } from '../../context/ctx-hub';
import { Schema } from '../../definition/schema';
import { JunctureTypeMap } from '../../juncture';
import { jBit } from '../../lib/bit';
import {
  GroupCtxHub, GroupHandledValue, GroupSchema, jGroup
} from '../../lib/group';
import { Root } from '../../root';

// Exposes constructor as public
export class TestGroupSchema<JTM extends JunctureTypeMap> extends GroupSchema<JTM> {
  constructor(readonly Children: JTM, defaultValue?: GroupHandledValue<JTM>) {
    super(Children, defaultValue);
  }
}

describe('GroupSchema', () => {
  test('should be a subclass of Schema', () => {
    expect(GroupSchema.prototype).toBeInstanceOf(Schema);
  });

  describe('constructor', () => {
    test('should be able to accept a Child map only', () => {
      const schema = new TestGroupSchema({ firstName: jBit.String });
      expect(schema).toBeInstanceOf(GroupSchema);
    });

    describe('when passing a custom defaultValue as second, optional, parameter', () => {
      const Children = {
        firstName: jBit.Of('fn'),
        lastName: jBit.Of('ln')
      };

      test('should use the provieded defaultValue', () => {
        expect((new TestGroupSchema(Children, {
          firstName: 'customFn',
          lastName: 'customLn'
        })).defaultValue).toEqual({
          firstName: 'customFn',
          lastName: 'customLn'
        });
      });

      test('should be able to use the defaultValue of child junctures when one or more properties is missing', () => {
        expect((new TestGroupSchema(Children, {})).defaultValue).toEqual({
          firstName: 'fn',
          lastName: 'ln'
        });

        expect((new TestGroupSchema(Children, {
          lastName: 'customLn'
        })).defaultValue).toEqual({
          firstName: 'fn',
          lastName: 'customLn'
        });
      });
    });
  });

  describe('instance', () => {
    test('should have a "Children" property containing the same value passed to the constructor', () => {
      const Children = {
        firstName: jBit.String
      };
      const schema = new TestGroupSchema(Children);
      expect(schema.Children).toBe(Children);
    });

    test('should have a "childKeys" property containing the keys of the Children map', () => {
      const Children = {
        firstName: jBit.String,
        lastName: jBit.Number
      };
      const schema = new TestGroupSchema(Children);
      expect(schema.childKeys).toEqual(Object.keys(Children));
    });
  });
});

describe('GroupCtxHub', () => {
  // class MyJuncture extends Group {
  //   schema = createSchemaDef(() => new TestGroupSchema({
  //     firstName: jBit.String,
  //     lastName: jBit.String
  //   }));
  // }
  // const juncture = Juncture.getInstance(MyJuncture);
  // const config: CtxConfig = {
  //   layout: {
  //     parent: null,
  //     path: [],
  //     isDivergent: false,
  //     isUnivocal: true
  //   }
  // };

  test('should be a subclass of CtxHub', () => {
    expect(GroupCtxHub.prototype).toBeInstanceOf(CtxHub);
  });

  /*
  describe('instance', () => {
    let ctx: GroupCtx<MyJuncture>;
    beforeEach(() => {
      ctx = new GroupCtx(juncture, config);
    });

    // eslint-disable-next-line max-len
    describe('"cursor" property', () => {
      test('should return a cursor associated with the ctx', () => {
        expect(isCursor(ctx.privateCursor, ctx)).toBe(true);
      });

      test('should give access to a map of cursors with the same keys of the Children of the Group', () => {
        expect(Object.keys(ctx.privateCursor)).toEqual(['firstName', 'lastName']);
        expect(isCursor(ctx.privateCursor.firstName)).toBe(true);
        expect(isCursor(ctx.privateCursor.lastName)).toBe(true);
      });
    });

    test('should have a "privateCursor" that return the same value of "cursor"', () => {
      expect(ctx.cursor).toBe(ctx.privateCursor);
    });
  });
  */
});

xtest('temp test', () => {
  class Person extends jGroup.of({
    firstName: jBit.String,
    lastName: jBit.String,
    age: jBit.Of(1)
  }) { }

  class Parents extends jGroup.of({
    father: Person,
    mother: Person
  }) {
    totAge = this.DEF.selector(({ value, _ }) => value(_.father.age) + value(_.mother.age));
  }

  const root = new Root(Parents);
  expect(root.frame.select().totAge).toBe(2);
});
