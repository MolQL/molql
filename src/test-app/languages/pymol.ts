/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Language from './language'
import Transpilers from '../../reference-implementation/transpilers/all'

const lang: Language = {
    name: 'PyMOL',
    editorMode: 'text',
    transpiler: Transpilers.pymol,
    examples: [{
        name: 'ALA residues',
        value: 'resn ALA'
    }]
};

export default lang;