/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import Language from './language'
import Transpilers from '../../transpilers/all'

const lang: Language = {
    name: 'VMD',
    editorMode: 'text',
    transpiler: Transpilers.vmd,
    examples: [{
        name: 'protein residues',
        value: 'protein'
    }]
};

export default lang;