/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Language from './language'
import Transpilers from '../../transpilers/all'
import examples from '../../transpilers/json/examples'

const lang: Language = {
    name: 'JSON',
    editorMode: 'javascript',
    transpiler: Transpilers.json,
    examples
}

export default lang