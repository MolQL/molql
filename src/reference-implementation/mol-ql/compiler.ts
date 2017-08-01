/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Compiler from '../mini-lisp/compiler'
import Context from './context'
import Runtime from './runtime'

export default Compiler<Context>(Runtime)