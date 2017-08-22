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
        const q = B.struct.filter.pick({ 0: residues, test: B.core.rel.gr([B.struct.atomSet.atomCount(), 6 ]) });
        const sel = Data.compileQuery(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = AtomSelection.atomSets(sel).every(s => AtomSet.count(s) > 6);
        expect(check).toBe(true);
    });

    it('withSameAtomProperties residue name as 1st atom', function() {
        const q = B.struct.filter.withSameAtomProperties({
            0: residues,
            source: B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('id'), 1]) }),
            property: B.ammp('auth_comp_id')
        });
        const sel = Data.compileQuery(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const name = Data.model.data.atom_site.auth_comp_id.getString(Data.model.atoms.dataIndex[0]);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.auth_comp_id.getString(i) === name);
        expect(check).toBe(true);
    });

    it('areIntersctedBy C atoms by ALA residues', function() {
        const q = B.struct.filter.intersectedBy({
            0: B.struct.generator.atomGroups({ 'atom-test': B.core.rel.eq([B.acp('elementSymbol'), B.es('C')]) }),
            by: B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'ALA']), 'group-by': B.ammp('residueKey') })
        });
        const sel = Data.compileQuery(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.auth_comp_id.getString(i) === 'ALA' && cols.type_symbol.getString(i) === 'C');
        expect(check).toBe(true);
    });

    it('within residues 5 ang from HEM', function() {
        const HEM = B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'HEM']), 'group-by': B.ammp('residueKey') });

        const q = B.struct.filter.within({ 0: residues, target: HEM, 'max-radius': 5 });

        const pivotAtomSet = AtomSelection.atomSets(Data.compileQuery(HEM)(Data.ctx) as AtomSelection)[0];
        const sel = Data.compileQuery(q)(Data.ctx) as AtomSelection;
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const distanceCheck = AtomSelection.atomSets(sel).every(s => AtomSet.distance(Data.model, pivotAtomSet, s) <= 5);
        expect(distanceCheck).toBe(true);
    });

    it('within(inverted) residues 5 ang from HEM', function() {
        const HEM = B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'HEM']), 'group-by': B.ammp('residueKey') });

        const q = B.struct.filter.within({ 0: residues, target: HEM, 'max-radius': 5, invert: true });

        const pivotAtomSet = AtomSelection.atomSets(Data.compileQuery(HEM)(Data.ctx) as AtomSelection)[0];
        const sel = Data.compileQuery(q)(Data.ctx) as AtomSelection;
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const distanceCheck = AtomSelection.atomSets(sel).every(s => AtomSet.distance(Data.model, pivotAtomSet, s) > 5);
        expect(distanceCheck).toBe(true);
    });

    it('within atoms 10 to 15 arg ang from Fe', function() {
        const Fe = B.struct.generator.atomGroups({ 'atom-test': B.core.rel.eq([B.acp('elementSymbol'), B.es('Fe')]) });

        const q = B.struct.filter.within({ 0: B.struct.generator.atomGroups(), target: Fe, 'min-radius': 10, 'max-radius': 15 });

        const pivotAtomSet = AtomSelection.atomSets(Data.compileQuery(Fe)(Data.ctx) as AtomSelection)[0];
        const sel = Data.compileQuery(q)(Data.ctx) as AtomSelection;
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const distanceCheck = AtomSelection.atomSets(sel).every(s => AtomSet.distance(Data.model, pivotAtomSet, s) >= 10 && AtomSet.distance(Data.model, pivotAtomSet, s) <= 15);
        expect(distanceCheck).toBe(true);
    });
});
