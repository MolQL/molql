/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import 'jasmine'

import AtomSelection from '../../data/atom-selection'
import B from '../../../../molql/builder'
import * as Data from '../data'

describe('combinator', () => {
    it('intersect', function() {
        const q = B.struct.combinator.intersect([
            B.struct.generator.atomGroups({ 'atom-test': B.core.rel.inRange([B.ammp('id'), 10, 20]) }),
            B.struct.generator.atomGroups({ 'atom-test': B.core.rel.inRange([B.ammp('id'), 15, 30]) })
        ]);
        const sel = Data.compileQuery(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBe(6);
    });

    it('merge', function() {
        const q = B.struct.combinator.merge([
            B.struct.generator.atomGroups({ 'residue-test': B.core.rel.inRange([B.ammp('id'), 10, 20]) }),
            B.struct.generator.atomGroups({ 'residue-test': B.core.rel.inRange([B.ammp('id'), 15, 30]) })
        ]);
        const sel = Data.compileQuery(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBe(20);
    });
});