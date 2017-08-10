/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import json from './json'
import molQLlisp from './molql-lisp/parser'
import jmol from './jmol/parser'
import pymol from './pymol/parser'

export default {
    molQLlisp,
    json,
    jmol,
    pymol
}