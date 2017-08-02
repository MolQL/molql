/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import RuntimeExpreression from '../../mini-lisp/expression'
import Context from './context'

type Expression<T = any> = RuntimeExpreression<Context, T>

export default Expression