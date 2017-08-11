/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Language from './language'
import Transpilers from '../../transpilers/all'

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