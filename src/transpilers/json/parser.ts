/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Transpiler from '../transpiler'
import Container from '../../reference-implementation/molql/container'

const transpiler: Transpiler = (s: string) => Container.deserialize(s).expression
export default transpiler