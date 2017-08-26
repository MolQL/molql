/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Language from './language'
import Transpilers from '../../transpilers/all'
import examples from '../../transpilers/pymol/examples'
import docs from '../../transpilers/pymol/markdown-docs'

const lang: Language = {
    name: 'PyMOL',
    editorMode: 'pymol',
    docs,
    transpiler: Transpilers.pymol,
    mergeSelection: true,
    examples
};

export default lang;