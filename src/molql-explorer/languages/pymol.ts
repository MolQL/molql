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
    }, {
        name: 'atoms named "C","O","N", or "CA"',
        value: 'name c+o+n+ca'
    }, {
        name: 'residues with helix or sheet secondary structure',
        value: 'ss h+s'
    }]
};

export default lang;