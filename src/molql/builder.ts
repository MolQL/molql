/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Expression from '../mini-lisp/expression'
import Symbol from './symbol'
import MolQL from './symbol-table'

namespace Builder {
    export const core = MolQL.core;
    export const struct = MolQL.structure;

    export function atomName(s: string) { return struct.type.atomName([s]); }
    export function es(s: string) { return struct.type.elementSymbol([s]); }
    export function list(...xs: Expression[]) { return core.type.list(xs); }
    export function set(...xs: Expression[]) { return core.type.set(xs); }
    export function fn(x: Expression) { return core.ctrl.fn([x]); }
    export function evaluate(x: Expression) { return core.ctrl.eval([x]); }

    const _acp = MolQL.structure.atomProperty.core, _ammp = MolQL.structure.atomProperty.macromolecular, _atp = MolQL.structure.atomProperty.topology;

    // atom core property
    export function acp(p: keyof typeof _acp) { return (_acp[p] as Symbol)() };

    // atom topology property
    export function atp(p: keyof typeof _atp) { return (_atp[p] as Symbol)() };

    // atom macromolecular property
    export function ammp(p: keyof typeof _ammp) { return (_ammp[p] as Symbol)() };

    // atom property sets
    const _aps = MolQL.structure.atomSet.propertySet
    export function acpSet(p: keyof typeof _acp) { return _aps([ acp(p) ]) };
    export function atpSet(p: keyof typeof _atp) { return _aps([ atp(p) ]) };
    export function ammpSet(p: keyof typeof _ammp) { return _aps([ ammp(p) ]) };
}

export default Builder