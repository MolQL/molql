/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Transpiler from './transpiler'
import B from '../../molql/builder'

const transpiler: Transpiler = (s: string) => B.evaluate(JSON.parse(s))
export default transpiler