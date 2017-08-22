/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import Language from './language'
import Transpilers from '../../transpilers/all'
import examples from '../../transpilers/vmd/examples'

const lang: Language = {
    name: 'VMD',
    editorMode: 'python',
    transpiler: Transpilers.vmd,
    examples
};

export default lang;