/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Language from './language'
import transpiler from '../../reference-implementation/transpilers/json'
import B from '../../mol-ql/builder'

const lang: Language = {
    name: 'JSON',
    editorMode: 'json',
    transpiler,
    examples: [{
        name: 'All C or N atoms in ALA residues',
        value: JSON.stringify(
            B.struct.generator.atomGroups.apply({
                'residue-test': B.core.rel.eq.apply([B.ammp('auth_comp_id'), 'ALA']),
                'atom-test': B.core.set.has.apply([
                    B.core.type.set.apply(B.argArray([B.es('C'), B.es('N')])),
                    B.acp('elementSymbol')
                ])
            }), null, 2)
    }, {
        name: 'All residues within 5 ang from Fe atom',
        value: JSON.stringify(B.struct.modifier.includeSurroundings.apply({
            'selection': B.struct.generator.atomGroups.apply({
                'atom-test': B.core.rel.eq.apply([B.acp('elementSymbol'), B.es('Fe')]),
            }),
            'radius': 5,
            'as-whole-residues': true
        }), null, 2)
    }]
}

export default lang