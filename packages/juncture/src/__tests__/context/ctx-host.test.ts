/**
 * @license
 * Copyright (c) Sergio Turolla All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Ctx, CtxConfig } from '../../context/ctx';
import { addCtxLink, getCtx, isCtxHost } from '../../context/ctx-host';
import { createSchemaDef, Schema } from '../../definition/schema';
import { Juncture } from '../../juncture';
import { jSymbols } from '../../symbols';

class MyJuncture extends Juncture {
  schema = createSchemaDef(() => new Schema(''));
}
const juncture = Juncture.getInstance(MyJuncture);
const config: CtxConfig = {
  layout: {
    parent: null,
    path: [],
    isDivergent: false,
    isUnivocal: true
  },
  ctxMediator: {
    getValue: () => undefined,
    setValue: () => {}
  },
  rootMediator: {
    dispatch: () => {}
  }
};

const ctx1 = new Ctx(juncture, config);
const ctx2 = new Ctx(juncture, config);

describe('addCtxLink', () => {
  test('should add a property [jSymbols.ctx] containing a refernce to the provided ctx', () => {
    const host: any = {};
    addCtxLink(host, ctx1);
    expect(host[jSymbols.ctx]).toBe(ctx1);
  });

  test('should return the provided container', () => {
    const host = {};
    const host2 = addCtxLink(host, ctx1);
    expect(host2).toBe(host);
  });
});

describe('getCtx', () => {
  test('should return the ctx associated to the CtxHost', () => {
    const host1 = addCtxLink({}, ctx1);
    const host2 = addCtxLink({}, ctx2);

    expect(getCtx(host1)).toBe(ctx1);
    expect(getCtx(host2)).toBe(ctx2);
  });
});

describe('isCtxHost', () => {
  describe('when no "ctx" argument is provided', () => {
    test('should return true if object is a CtxHost', () => {
      const host = addCtxLink({}, ctx1);
      expect(isCtxHost(host)).toBe(true);
    });
    test('should return false if object is not a CtxHost', () => {
      expect(isCtxHost('a-string')).toBe(false);
      expect(isCtxHost(1)).toBe(false);
      expect(isCtxHost(true)).toBe(false);
      expect(isCtxHost(undefined)).toBe(false);
      expect(isCtxHost(null)).toBe(false);
    });
  });

  describe('when "ctx" argument is provided', () => {
    test('should return true if object is a CtxHost associated with the provided ctx', () => {
      const host = addCtxLink({}, ctx1);
      expect(isCtxHost(host, ctx1)).toBe(true);
    });
    test('should return false if object is not a CtxHost associated with the provided ctx', () => {
      const host = addCtxLink({}, ctx1);
      expect(isCtxHost(host, ctx2)).toBe(false);
    });
    test('should return false if object is not a CtxHost', () => {
      expect(isCtxHost('a-string', ctx1)).toBe(false);
      expect(isCtxHost(1, ctx1)).toBe(false);
      expect(isCtxHost(true, ctx1)).toBe(false);
      expect(isCtxHost(undefined, ctx1)).toBe(false);
      expect(isCtxHost(null, ctx1)).toBe(false);
    });
  });
});
