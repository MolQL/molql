/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import 'jasmine'

import AtomSet from '../../data/atom-set'
import AtomSelection from '../../data/atom-selection'
import B from '../../../../molql/builder'
import * as Data from '../data'

describe('filter', () => {
    const residues = B.struct.generator.atomGroups({ 'group-by': B.ammp('residueKey') });

    it('pick with at least 6 atoms', function() {
        const q = B.struct.filter.pick({ selection: residues, test: B.core.rel.gr([B.struct.atomSet.atomCount(), 6 ]) });
        const sel = Data.compileQuery(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = AtomSelection.atomSets(sel).every(s => AtomSet.count(s) > 6);
        expect(check).toBe(true);
    });

    it('withSameAtomProperties residue name as 1st atom', function() {
        const q = B.struct.filter.withSameAtomProperties({
            selection: residues,
            source: B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('id'), 1]) }),
            property: B.ammp('auth_comp_id')
        });
        const sel = Data.compileQuery(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const name = Data.model.data.atom_site.auth_comp_id.getString(Data.model.atoms.dataIndex[0]);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.auth_comp_id.getString(i) === name);
        expect(check).toBe(true);
    });

    it('within residues 5 ang from HEM', function() {
        const HEM = B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'HEM']), 'group-by': B.ammp('residueKey') });

        const q = B.struct.filter.within({ selection: residues, target: HEM, radius: 5 });

        const pivotAtomSet = AtomSelection.atomSets(Data.compileQuery(HEM)(Data.ctx) as AtomSelection)[0];
        const sel = Data.compileQuery(q)(Data.ctx) as AtomSelection;
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const distanceCheck = AtomSelection.atomSets(sel).every(s => AtomSet.distance(Data.model, pivotAtomSet, s) <= 5);
        expect(distanceCheck).toBe(true);
    });

    it('within(inverted) residues 5 ang from HEM', function() {
        const HEM = B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'HEM']), 'group-by': B.ammp('residueKey') });

        const q = B.struct.filter.within({ selection: residues, target: HEM, radius: 5, invert: true });

        const pivotAtomSet = AtomSelection.atomSets(Data.compileQuery(HEM)(Data.ctx) as AtomSelection)[0];
        const sel = Data.compileQuery(q)(Data.ctx) as AtomSelection;
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const distanceCheck = AtomSelection.atomSets(sel).every(s => AtomSet.distance(Data.model, pivotAtomSet, s) > 5);
        expect(distanceCheck).toBe(true);
    });
});
