/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import 'jasmine'

import AtomSelection from '../../data/atom-selection'
import B from '../../../../mol-ql/builder'
import * as Data from '../data'

describe('atom-set', () => {
    const residues = B.struct.generator.atomGroups({ 'group-by': B.ammp('residueKey') });

    it('all residues with min b-factor greater than 40', function () {
        const q = B.struct.filter.pick({
            selection: residues,
            test: B.core.rel.gr([
                B.struct.atomSet.reduce.accumulator({
                    initial: B.ammp('B_iso_or_equiv'),
                    value: B.core.math.min([
                        B.struct.atomSet.reduce.value(),
                        B.ammp('B_iso_or_equiv')
                    ])
                }),
                40
            ])
        });
        const sel = Data.compile(q)(Data.ctx);
        const check = Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.B_iso_or_equiv.getFloat(i) > 40);
        expect(check).toBe(true);
    });

    it('All residues with at 3 C atoms and 1 S atoms.', function () {
        const q = B.struct.filter.pick({
            selection: residues,
            test: B.core.logic.and([
                B.core.rel.gre([
                    B.struct.atomSet.countQuery({ query: B.struct.generator.atomGroups({ 'atom-test': B.core.rel.eq([B.acp('elementSymbol'), B.es('C')]) }) }),
                    3
                ]),
                B.core.rel.gre([
                    B.struct.atomSet.countQuery({ query: B.struct.generator.atomGroups({ 'atom-test': B.core.rel.eq([B.acp('elementSymbol'), B.es('S')]) }) }),
                    1
                ])
            ])
        });
        const sel = Data.compile(q)(Data.ctx);
        expect(AtomSelection.atomSets(sel).length).toBeGreaterThan(0);
        const check = AtomSelection.atomSets(sel).every(s =>
            Data.countAtomSet(Data.model, s, (i, cols) => cols.type_symbol.getString(i) === 'C') >= 3
            && Data.countAtomSet(Data.model, s, (i, cols) => cols.type_symbol.getString(i) === 'S') >= 1
        );

        Data.checkAtomSelection(Data.model, sel, (i, cols) => cols.B_iso_or_equiv.getFloat(i) > 40);
        expect(check).toBe(true);
    });
});
