/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Language from './language'
import Transpilers from '../../transpilers/all'

const lang: Language = {
    name: 'Jmol',
    editorMode: 'text',
    transpiler: Transpilers.jmol,
    examples: [{
        name: 'Residue 50 or 135',
        value: '50 or 135'
    }]
};

export default lang;