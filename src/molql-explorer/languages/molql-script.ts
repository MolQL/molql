/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Language from './language'
import Transpilers from '../../transpilers/all'
import examples from '../../transpilers/molql-script/examples'
import docs from '../../transpilers/molql-script/markdown-docs'

const lang: Language = {
    name: 'MolQL Script',
    editorMode: 'molql-script',
    docs,
    transpiler: Transpilers.molQLscript,
    mergeSelection: false,
    examples
}

export default lang