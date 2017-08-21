/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import json from './languages/json'
import molQLscript from './languages/molql-script'
import pymol from './languages/pymol'
import vmd from './languages/vmd'
import jmol from './languages/jmol'

export default [
    molQLscript,
    pymol,
    jmol,
    vmd,
    json
];