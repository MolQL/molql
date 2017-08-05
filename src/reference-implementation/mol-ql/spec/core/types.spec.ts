/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import 'jasmine'

import B from '../../../../mol-ql/builder'
import * as Data from '../data'

describe('types', () => {
    it('list', function () {
        const e = B.core.type.list([1]);
        const c = Data.compile(e)(Data.ctx) as number[];
        expect(c[0]).toBe(1)
    });

    it('set', function () {
        const e = B.core.type.set([1, 2, 4]);
        const c = Data.compile(e)(Data.ctx) as Set<number>;
        expect(c.has(1)).toBe(true);
        expect(c.has(10)).toBe(false);
    });

    it('map', function () {
        const e = B.core.type.map([1, 'x']);
        const c = Data.compile(e)(Data.ctx) as Map<number, string>;
        expect(c.get(1)).toBe('x');
        expect(c.get(10)).toBe(void 0);
    });

    it('regex', function () {
        const e = B.core.type.regex(['te.t', 'i']);
        const c = Data.compile(e)(Data.ctx) as RegExp;
        expect(c.test('xxx')).toBe(false);
        expect(c.test('Test')).toBe(true);
    });

    it('not', function () {
        const e = B.core.logic.not([true]);
        const c = Data.compile(e)(Data.ctx) as boolean;
        expect(c).toBe(false);
    });

    it('if true', function () {
        const e = B.core.ctrl.if({
            cond: true,
            'if-true': 1,
            'if-false': 2
        });
        const c = Data.compile(e)(Data.ctx) as number;
        expect(c).toBe(1);
    });

    it('if false', function () {
        const e = B.core.ctrl.if({
            cond: false,
            'if-true': 1,
            'if-false': 2
        });
        const c = Data.compile(e)(Data.ctx) as number;
        expect(c).toBe(2);
    });

    function testFn(symbol: any, args: any[], expected: any) {
        it(symbol.id + ' ' + expected, function () {
            const e = symbol(args);
            const c = Data.compile(e)(Data.ctx);
            expect(c).toBe(expected);
        });
    }

    testFn(B.core.logic.and, [true, false, true], false);
    testFn(B.core.logic.and, [true, true, true], true);

    testFn(B.core.logic.or, [true, false, true], true);
    testFn(B.core.logic.or, [false, false, false], false);

    testFn(B.core.math.add, [1, 2, 3], 6);
    testFn(B.core.math.sub, [1], -1);
    testFn(B.core.math.sub, [1, 3], -2);
    testFn(B.core.math.sub, [1, 2, 3], -4);
    testFn(B.core.math.mult, [2, 2, 3], 12);
    testFn(B.core.math.div, [4, 2], 2);
    testFn(B.core.math.pow, [4, 2], 16);

    testFn(B.core.math.min, [1, 2, 3], 1);
    testFn(B.core.math.max, [1, 2, 3], 3);

    testFn(B.core.math.floor, [1.4], Math.floor(1.4));
    testFn(B.core.math.ceil, [1.4], Math.ceil(1.4));
    testFn(B.core.math.roundInt, [1.4], Math.round(1.4));
    testFn(B.core.math.abs, [-1.4], Math.abs(-1.4));
    testFn(B.core.math.sqrt, [1.4], Math.sqrt(1.4));
    testFn(B.core.math.sin, [1.4], Math.sin(1.4));
    testFn(B.core.math.cos, [1.4], Math.cos(1.4));
    testFn(B.core.math.tan, [1.4], Math.tan(1.4));
    testFn(B.core.math.asin, [0.4], Math.asin(0.4));
    testFn(B.core.math.acos, [0.4], Math.acos(0.4));
    testFn(B.core.math.atan, [0.4], Math.atan(0.4));
    testFn(B.core.math.sinh, [1.4], Math.sinh(1.4));
    testFn(B.core.math.cosh, [1.4], Math.cosh(1.4));
    testFn(B.core.math.tanh, [1.4], Math.tanh(1.4));
    testFn(B.core.math.exp, [1.4], Math.exp(1.4));
    testFn(B.core.math.log, [1.4], Math.log(1.4));
    testFn(B.core.math.log10, [1.4], Math.log10(1.4));
    testFn(B.core.math.atan2, [1.4, 0.1], Math.atan2(1.4, 0.1));

    testFn(B.core.rel.eq, [1, 1], true);
    testFn(B.core.rel.neq, [1, 1], false);
    testFn(B.core.rel.lt, [1, 1], false);
    testFn(B.core.rel.lte, [1, 1], true);
    testFn(B.core.rel.gr, [1, 1], false);
    testFn(B.core.rel.gre, [1, 1], true);
    testFn(B.core.rel.inRange, [1, 0, 2], true);
    testFn(B.core.rel.inRange, [1, 1.5, 2], false);

    testFn(B.core.str.concat, ['a', 'b', 'c'], 'abc');
    testFn(B.core.str.match, [/abc/, 'abc'], true);

    testFn(B.core.set.has, [new Set([1, 2, 3]), 2], true);
    testFn(B.core.map.has, [new Map([[1, 2], [3, 4]]), 2], false);
    testFn(B.core.map.get, [new Map([[1, 2], [3, 4]]), 3], 4);
});