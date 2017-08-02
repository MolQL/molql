/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../mini-lisp/expression'
import Symbol from '../mini-lisp/symbol'
import MolQL from './symbols'

namespace Builder {
    export type ExpressionArguments<T> = Partial<{ [P in keyof T]: Expression }>

    function category<T>(symbols: T): <S extends Symbol>(s: (cat: T) => S, args?: ExpressionArguments<S['arguments']['@type']>) => Expression {
        return (s, args) => Expression.Apply(s(symbols).id, args as any);
    }

    export function argArray(expr: Expression[]): { [key: string]: Expression } {
        return expr as any as { [key: string]: Expression };
    }

    export const type = category(MolQL.primitive.type);
    export const operator = category(MolQL.primitive.operator);

    export namespace Struct {
        export const type = category(MolQL.structure.type);
        export const gen = category(MolQL.structure.generator);
        export const atomProp = category(MolQL.structure.atomProperty);
        export const filter = category(MolQL.structure.filter);
        export const mod = category(MolQL.structure.modifier);
        export const comb = category(MolQL.structure.combinator);
        export const atomSet = category(MolQL.structure.atomSet);
    }
}

export default Builder