/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Environment from '../../mini-lisp/environment'
import SymbolTable from '../symbols'
import Context from './context'

type Env = Environment<Context>
function Env(ctx: Context) {
    return Environment(SymbolTable, ctx);
}

export default Env