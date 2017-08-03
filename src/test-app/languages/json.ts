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
            B.Struct.gen.atomGroups.apply({
                'residue-test': B.operator.relational.eq.apply([B.Struct.atomProp('auth_comp_id'), 'ALA']),
                'atom-test': B.operator.set.has.apply([
                    B.type.set.apply(B.argArray([B.Struct.el('C'), B.Struct.el('N')])),
                    B.Struct.atomProp('type_symbol')
                ])
            }), null, 2)
    }, {
        name: 'All residues within 5 ang from Fe atom',
        value: JSON.stringify(B.Struct.mod.includeSurroundings.apply({
            'selection': B.Struct.gen.atomGroups.apply({
                'atom-test': B.operator.relational.eq.apply([B.Struct.atomProp('type_symbol'), B.Struct.el('Fe')]),
            }),
            'radius': 5,
            'as-whole-residues': true
        }), null, 2)
    }]
}

export default lang