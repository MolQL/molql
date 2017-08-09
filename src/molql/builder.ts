/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../mini-lisp/expression'
import Symbol from '../mini-lisp/symbol'
import MolQL from './symbols'

namespace Builder {
    export const core = MolQL.core;
    export const struct = MolQL.structure;

    export function es(s: string) { return struct.type.elementSymbol([s]); }
    export function list(...xs: Expression[]) { return core.type.list(xs); }
    export function set(...xs: Expression[]) { return core.type.set(xs); }
    export function hold(x: Expression) { return core.ctrl.hold([x]); }

    const _acp = MolQL.structure.atomProperty.core, _ammp = MolQL.structure.atomProperty.macromolecular;

    // atom core property
    export function acp(p: keyof typeof _acp) { return (_acp[p] as Symbol)() };

    // atom macromolecular property
    export function ammp(p: keyof typeof _ammp) { return (_ammp[p] as Symbol)() };
}

export default Builder