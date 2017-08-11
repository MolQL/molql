/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Expression from '../mini-lisp/expression'

type Transpiler = (source: string) => Expression

export default Transpiler