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
        value: JSON.stringify(B.Struct.gen(g => g.atomGroups, {
            'residue-test': B.operator(o => o.relational.eq, [B.Struct.atomProp(p => p.auth_comp_id), 'ALA']),
            'atom-test': B.operator(o => o.set.has, [
                B.type(t => t.set, B.argArray([B.Struct.type(t => t.elementSymbol, ['C']), B.Struct.type(t => t.elementSymbol, ['N'])])),
                B.Struct.atomProp(p => p.type_symbol)
            ]),
        }), null, 2)
    }, {
        name: 'All residues within 5 ang from Fe atom',
        value: JSON.stringify(B.Struct.mod(m => m.includeSurroundings, {
            'selection': B.Struct.gen(g => g.atomGroups, {
                'atom-test': B.operator(o => o.relational.eq, [B.Struct.atomProp(p => p.type_symbol), B.Struct.type(t => t.elementSymbol, ['Fe'])]),
            }),
            'radius': 5,
            'as-whole-residues': true
        }), null, 2)
    }]
}

export default lang