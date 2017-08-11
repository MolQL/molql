/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Transpiler from './transpiler'
import B from '../molql/builder'

const transpiler: Transpiler = (s: string) => B.evaluate(JSON.parse(s))
export default transpiler