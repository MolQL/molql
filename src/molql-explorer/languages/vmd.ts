/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import Language from './language'
import Transpilers from '../../transpilers/all'
import examples from '../../transpilers/vmd/examples'
import docs from '../../transpilers/vmd/markdown-docs'

const lang: Language = {
    name: 'VMD',
    editorMode: 'vmd',
    docs,
    transpiler: Transpilers.vmd,
    mergeSelection: true,
    examples
};

export default lang;