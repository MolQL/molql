/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../mini-lisp/expression'
import MolQL from './symbols'

namespace Builder {

    export function argArray(expr: Expression[]): { [key: string]: Expression } {
        return expr as any as { [key: string]: Expression };
    }

    export const type = MolQL.primitive.type;
    export const operator = MolQL.primitive.operator;

    export namespace Struct {
        export const type = MolQL.structure.type;
        export const gen = MolQL.structure.generator;
        export const atomProp = MolQL.structure.atomProperty;
        export const filter = MolQL.structure.filter;
        export const mod = MolQL.structure.modifier;
        export const comb = MolQL.structure.combinator;
        export const atomSet = MolQL.structure.atomSet;
    }
}

export default Builder