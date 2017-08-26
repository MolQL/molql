/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Language from './language'
import Transpilers from '../../transpilers/all'
import examples from '../../transpilers/json/examples'
import getDocs from '../../reference-implementation/molql/markdown-docs'

const lang: Language = {
    name: 'JSON',
    editorMode: 'javascript',
    docs: getDocs(false),
    transpiler: Transpilers.json,
    mergeSelection: false,
    examples
}

export default lang