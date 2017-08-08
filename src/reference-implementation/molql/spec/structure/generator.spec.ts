/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import 'jasmine'

import AtomSelection from '../../data/atom-selection'
import B from '../../../../molql/builder'
import * as Data from '../data'
import * as mmCif from '../../../molecule/mmcif'

function testPropEq(symbol: any, value: any, category: mmCif.AtomSite) {
    it(`${category}`, function() {
        const q = B.struct.generator.atomGroups({ 'atom-test': B.core.rel.eq([symbol(), value]) })
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => (cols as any)[category].getString(i) == value);
        expect(check).toBe(true);
    });
}

function testPropLt(symbol: any, value: any, category: mmCif.AtomSite) {
    it(`${category}`, function() {
        const q = B.struct.generator.atomGroups({ 'atom-test': B.core.rel.lt([symbol(), value]) })
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => (cols as any)[category].getFloat(i) < value);
        expect(check).toBe(true);
    });
}

describe('generator', () => {
    it(`type_symbol`, function() {
        const q = B.struct.generator.atomGroups({ 'atom-test': B.core.rel.eq([B.struct.atomProperty.core.elementSymbol(), B.es('C')]) })
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.type_symbol.getString(i) === 'C');
        expect(check).toBe(true);
    });

    testPropLt(B.struct.atomProperty.core.x, -25, 'Cartn_x');
    testPropLt(B.struct.atomProperty.core.y, -17, 'Cartn_y');
    testPropLt(B.struct.atomProperty.core.z, -30, 'Cartn_z');

    it(`is-het`, function() {
        const q = B.struct.generator.atomGroups({ 'atom-test': B.core.logic.not([B.ammp('isHet')]) })
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.group_PDB.stringEquals(i, 'ATOM'));
        expect(check).toBe(true);
    });

    testPropEq(B.struct.atomProperty.macromolecular.auth_asym_id, 'A', 'auth_asym_id');
    testPropEq(B.struct.atomProperty.macromolecular.auth_atom_id, 'CA', 'auth_atom_id');
    testPropEq(B.struct.atomProperty.macromolecular.auth_comp_id, 'CYS', 'auth_comp_id');
    testPropEq(B.struct.atomProperty.macromolecular.auth_seq_id, 125, 'auth_seq_id');

    testPropEq(B.struct.atomProperty.macromolecular.label_asym_id, 'A', 'label_asym_id');
    testPropEq(B.struct.atomProperty.macromolecular.label_atom_id, 'CA', 'label_atom_id');
    testPropEq(B.struct.atomProperty.macromolecular.label_comp_id, 'CYS', 'label_comp_id');
    testPropEq(B.struct.atomProperty.macromolecular.label_seq_id, 125, 'label_seq_id');
    testPropEq(B.struct.atomProperty.macromolecular.label_entity_id, '2', 'label_entity_id');
    it(`label_alt_id`, function() {
        const q = B.struct.generator.atomGroups({ 'atom-test': B.core.rel.eq([B.ammp('label_alt_id'), '']) })
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.label_alt_id.getString(i) === null);
        expect(check).toBe(true);
    });

    testPropLt(B.struct.atomProperty.macromolecular.B_iso_or_equiv, 35, 'B_iso_or_equiv');
    testPropEq(B.struct.atomProperty.macromolecular.occupancy, 1.0, 'occupancy');

    it(`entityType`, function() {
        const q = B.struct.generator.atomGroups({ 'atom-test': B.core.rel.eq([B.ammp('entityType'), 'water']) })
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.type_symbol.getString(i) === 'O');
        expect(check).toBe(true);
    });

    it(`authResidueId`, function() {
        const aResId = (c: string, r: number, i?: string) => B.struct.type.authResidueId([c, r, i]);
        const resSet = B.core.type.set([aResId('A', 28), aResId('A', 30)]);

        const q = B.struct.generator.atomGroups({
            'residue-test': B.core.set.has([resSet, B.ammp('authResidueId')]),
            'group-by': B.ammp('residueKey')
        })
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBe(2);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.label_comp_id.getString(i) === 'HIS');
        expect(check).toBe(true);
    });

    it(`labelResidueId`, function() {
        const lResId = (e: string, c: string, r: number, i?: string) => B.struct.type.labelResidueId([e, c, r, i]);
        const resSet = B.core.type.set([lResId('1', 'A', 7), lResId('1', 'A', 9)]);

        const q = B.struct.generator.atomGroups({
            'residue-test': B.core.set.has([resSet, B.ammp('labelResidueId')]),
            'group-by': B.ammp('residueKey')
        })
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBe(2);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.label_comp_id.getString(i) === 'HIS');
        expect(check).toBe(true);
    });

    it(`residue-key`, function() {
        const q = B.struct.generator.atomGroups({
            'group-by': B.ammp('residueKey')
        })
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBe(Data.model.residues.count);
    });

    it(`chain-key`, function() {
        const q = B.struct.generator.atomGroups({
            'group-by': B.ammp('chainKey')
        })
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBe(Data.model.chains.count);
    });

    it(`entity-key`, function() {
        const q = B.struct.generator.atomGroups({
            'group-by': B.ammp('entityKey')
        })
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBe(Data.model.entities.count);
    });

    it(`querySelection`, function() {
        const q = B.struct.generator.queryInSelection({
            selection: B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'ALA']) }),
            query: B.struct.generator.atomGroups({ 'atom-test': B.core.rel.eq([B.acp('elementSymbol'), B.es('C')]) })
        });
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.auth_comp_id.stringEquals(i, 'ALA') && cols.type_symbol.stringEquals(i, 'C'));
        expect(check).toBe(true);
    });

    it(`querySelection complement`, function() {
        const q = B.struct.generator.queryInSelection({
            selection: B.struct.generator.atomGroups({ 'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'ALA']) }),
            query: B.struct.generator.atomGroups({ 'atom-test': B.core.rel.eq([B.acp('elementSymbol'), B.es('C')]) }),
            'in-complement': true
        });
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => !cols.auth_comp_id.stringEquals(i, 'ALA') && cols.type_symbol.stringEquals(i, 'C'));
        expect(check).toBe(true);
    });
});