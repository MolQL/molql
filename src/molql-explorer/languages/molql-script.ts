/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Language from './language'
import Transpilers from '../../transpilers/all'
import examples from '../../transpilers/molql-script/examples'

const lang: Language = {
    name: 'MolQL Script',
    editorMode: 'molql-script',
    transpiler: Transpilers.molQLscript,
    examples
}

export default lang