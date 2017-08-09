/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import 'jasmine'

import AtomSet from '../../data/atom-set'
import AtomSelection from '../../data/atom-selection'
import B from '../../../../molql/builder'
import * as Data from '../data'

describe('modifier', () => {
    const ALAs = B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'ALA']) })
    const Cs = B.struct.generator.atomGroups({ 'atom-test': B.core.rel.eq([B.acp('elementSymbol'), B.es('C')]) })
    const residues = B.struct.generator.atomGroups({ 'group-by': B.ammp('residueKey') });
    const chains = B.struct.generator.atomGroups({ 'group-by': B.ammp('chainKey') });

    it('queryEach ALAs by Cs', function() {
        const q = B.struct.modifier.queryEach({ selection: ALAs, query: Cs });
        const sel = Data.compileQuery(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.type_symbol.getString(i) === 'C' && cols.auth_comp_id.getString(i) === 'ALA');
        expect(check).toBe(true);
    });

    it('intersect ALAs by Cs', function() {
        const q = B.struct.modifier.intersectBy({ selection: ALAs, by: Cs });
        const sel = Data.compileQuery(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.type_symbol.getString(i) === 'C');
        expect(check).toBe(true);
    });

    it('intersect Cs by ALAs', function() {
        const q = B.struct.modifier.intersectBy({ selection: Cs, by: ALAs });
        const sel = Data.compileQuery(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.auth_comp_id.getString(i) === 'ALA');
        expect(check).toBe(true);
    });

    it('exceptBy ALAs by Cs', function() {
        const q = B.struct.modifier.exceptBy({ selection: ALAs, by: Cs });
        const sel = Data.compileQuery(q)(Data.ctx);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.type_symbol.getString(i) !== 'C');
        expect(check).toBe(true);
    });

    it('exceptBy Cs by ALAs', function() {
        const q = B.struct.modifier.exceptBy({ selection: ALAs, by: Cs });
        const sel = Data.compileQuery(q)(Data.ctx);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.auth_comp_id.getString(i) === 'ALA' && cols.type_symbol.getString(i) !== 'C');
        expect(check).toBe(true);
    });

    it('unionBy residues chains', function() {
        const q = B.struct.modifier.unionBy({ selection: residues, by: chains });
        const sel = Data.compileQuery(q)(Data.ctx) as AtomSelection;
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        expect(AtomSelection.atomSets(sel).length).toBe(3);
        expect(AtomSelection.atomSets(sel).reduce((c, s) => c + AtomSet.count(s), 0)).toBe(Data.model.atoms.count);
    });

    it('union ALAs', function() {
        const q = B.struct.modifier.union({ selection: ALAs });
        const sel = Data.compileQuery(q)(Data.ctx) as AtomSelection;
        expect(AtomSelection.atomSets(sel).length).toBe(1);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.auth_comp_id.getString(i) === 'ALA');
        expect(check).toBe(true);
    });

    it('includeSurroundings HEM 5 ang', function() {
        const HEM = B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'HEM']), 'group-by': B.ammp('residueKey') });
        const includeSurr = B.struct.modifier.includeSurroundings({ selection: HEM, radius: 5 });

        const atomsInSurr = B.struct.generator.queryInSelection({ selection: includeSurr, query: B.struct.generator.atomGroups() });
        const pivotAtomSet = AtomSelection.atomSets(Data.compileQuery(HEM)(Data.ctx) as AtomSelection)[0];
        const atomsInSel = Data.compileQuery(atomsInSurr)(Data.ctx) as AtomSelection;

        const distanceCheck = AtomSelection.atomSets(atomsInSel).every(s => AtomSet.distance(Data.model, pivotAtomSet, s) <= 5);
        expect(distanceCheck).toBe(true);
    });

    it('includeSurroundings HEM 5 ang (whole residues)', function() {
        const HEM = B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'HEM']), 'group-by': B.ammp('residueKey') });
        const includeSurr = B.struct.modifier.includeSurroundings({ selection: HEM, radius: 5, 'as-whole-residues': true });

        const atomsInSurr = B.struct.generator.queryInSelection({ selection: includeSurr, query: residues });
        const pivotAtomSet = AtomSelection.atomSets(Data.compileQuery(HEM)(Data.ctx) as AtomSelection)[0];
        const atomsInSel = Data.compileQuery(atomsInSurr)(Data.ctx) as AtomSelection;

        const distanceCheck = AtomSelection.atomSets(atomsInSel).every(s => AtomSet.distance(Data.model, pivotAtomSet, s) <= 5);
        expect(distanceCheck).toBe(true);
    });
})