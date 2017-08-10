/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Environment from '../../mini-lisp/environment'
import Runtime from '../runtime'
import Context from './context'

type Env = Environment<Context>
function Env(ctx: Context) {
    return Environment(Runtime, ctx);
}

export default Env