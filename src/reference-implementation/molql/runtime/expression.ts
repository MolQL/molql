/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import RuntimeExpreression from '../../mini-lisp/expression'
import Context from './context'

type Expression<T = any> = RuntimeExpreression<Context, T>

export default Expression