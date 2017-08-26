/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Language from './language'
import Transpilers from '../../transpilers/all'
import examples from '../../transpilers/jmol/examples'
import docs from '../../transpilers/jmol/markdown-docs'

const lang: Language = {
    name: 'Jmol',
    editorMode: 'jmol',
    docs,
    transpiler: Transpilers.jmol,
    mergeSelection: true,
    examples
};

export default lang;