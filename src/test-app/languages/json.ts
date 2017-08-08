/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Language from './language'
import transpiler from '../../reference-implementation/transpilers/json'
import B from '../../molql/builder'

const lang: Language = {
    name: 'JSON',
    editorMode: 'javascript',
    transpiler,
    examples: [{
        name: 'All C or N atoms in ALA residues',
        value: JSON.stringify(
            B.struct.generator.atomGroups({
                'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'ALA']),
                'atom-test': B.core.set.has([
                    B.core.type.set([B.es('C'), B.es('N')]),
                    B.acp('elementSymbol')
                ])
            }), null, 2)
    }, {
        name: 'All residues within 5 ang from Fe atom',
        value: JSON.stringify(B.struct.modifier.includeSurroundings({
            'selection': B.struct.generator.atomGroups({
                'atom-test': B.core.rel.eq([B.acp('elementSymbol'), B.es('Fe')]),
            }),
            'radius': 5,
            'as-whole-residues': true
        }), null, 2)
    }, {
        name: 'Cluster LYS residues within 5 ang',
        value: JSON.stringify(B.struct.modifier.cluster({
            'selection': B.struct.generator.atomGroups({
                'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'LYS']),
                'group-by': B.ammp('residueKey')
            }),
            'max-distance': 5
        }), null, 2)
    }, {
        name: 'Residues with max b-factor < 45',
        value: JSON.stringify(B.struct.filter.pick({
            selection: B.struct.generator.atomGroups({ 'group-by': B.ammp('residueKey') }),
            test: B.core.rel.lt([
                B.struct.atomSet.reduce.accumulator({
                    initial: B.ammp('B_iso_or_equiv'),
                    value: B.core.math.max([
                        B.struct.atomSet.reduce.value(),
                        B.ammp('B_iso_or_equiv')
                    ])
                }),
                35
            ])
        }), null, 2)
    }]
}

export default lang