/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import 'jasmine'

import B from '../../../../molql/builder'
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

    it('regex', function () {
        const e = B.core.type.regex(['te.t', 'i']);
        const c = Data.compile(e)(Data.ctx) as RegExp;
        expect(c.test('xxx')).toBe(false);
        expect(c.test('Test')).toBe(true);
    });

    function testFn(symbol: any, args: any[], expected: any) {
        it(symbol.id + ' ' + expected, function () {
            const e = symbol(args);
            const c = Data.compile(e)(Data.ctx);
            expect(c).toBe(expected);
        });
    }

    it('eval/fn', function () {
        const e = B.evaluate(B.fn(1));
        const c = Data.compile(e)(Data.ctx) as any;
        expect(c).toBe(1);
    });

    testFn(B.core.ctrl.if, [true, 1, 2], 1);
    testFn(B.core.ctrl.if, [false, 1, 2], 2);

    testFn(B.core.logic.not, [true], false);

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
    testFn(B.core.math.mod, [4, 2], 0);
    testFn(B.core.math.mod, [4.5, 2], 0.5);

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
    testFn(B.core.str.match, [B.core.type.regex(['abc']), 'abc'], true);
    testFn(B.core.str.match, [B.core.type.regex(['abc', 'i']), 'aBc'], true);

    testFn(B.core.list.getAt, [B.list(1, 2, 3), 1], 2);
    testFn(B.core.set.has, [B.set(1, 2, 3), 2], true);
    testFn(B.core.set.isSubset, [B.set(1, 2, 3), B.set(1, 2, 3, 4)], true);
    testFn(B.core.set.isSubset, [B.set(1, 2, 3, 6), B.set(1, 2, 3, 4)], false);
});