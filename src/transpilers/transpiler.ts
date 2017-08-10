/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../mini-lisp/expression'

type Transpiler = (source: string) => Expression

export default Transpiler