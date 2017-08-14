/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Language from './language'
import Transpilers from '../../transpilers/all'
import B from '../../molql/builder'

const l = B.core.type.list;
const lys = B.struct.generator.atomGroups({
    'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'LYS']),
    'group-by': B.ammp('residueKey')
});

const lang: Language = {
    name: 'JSON',
    editorMode: 'javascript',
    transpiler: Transpilers.json,
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
            'selection': lys,
            'max-distance': 5
        }), null, 2)
    }, {
        name: 'Cluster 3 LYS residues within 5 ang',
        value: JSON.stringify(B.struct.combinator.distanceCluster({
            matrix: l([l([0, 5, 5]), l([0, 0, 5]), l([0, 0, 0])]),
            selections: l([lys, lys, lys])
        }), null, 2)
    }, {
        name: 'Residues with max b-factor < 45',
        value: JSON.stringify(B.struct.filter.pick({
            selection: B.struct.generator.atomGroups({ 'group-by': B.ammp('residueKey') }),
            test: B.core.rel.lt([
                B.struct.atomSet.reduce({
                    initial: B.ammp('B_iso_or_equiv'),
                    value: B.core.math.max([
                        B.struct.slot.atomSetReduce(),
                        B.ammp('B_iso_or_equiv')
                    ])
                }),
                35
            ])
        }), null, 2)
    }]
}

export default lang