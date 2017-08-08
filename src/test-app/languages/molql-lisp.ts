/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Language from './language'
//import transpiler from '../../reference-implementation/transpilers/json'

const lang: Language = {
    name: 'MolQL Lisp',
    editorMode: 'molql-lisp',
    transpiler: e => { throw 'not implemented' },
    examples: [{
        name: 'Example',
        value: '(implement-me\n  alex\n  (you-are my only hope))'
    }]
}

export default lang