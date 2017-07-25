/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../language/expression'
import Type from '../../language/type-system'
import Symbols, { SymbolInfo, isSymbolInfo } from '../../language/symbols'

namespace Language {
    export type E<T extends Type = Type> = (Expression) & { '@type'?: T }

    type Q = E<Type.Structure.AtomSetSeq>
    type V = E<Type.Value>
    type Varg = V | SymbolInfo

    function symbol<T extends E>(symbol: SymbolInfo, args?: (E | SymbolInfo)[]): T {
        const normalizedArgs = args && args.map(a => isSymbolInfo(a) ? Expression.symbol(a.name) : a);
        return Expression.symbol(symbol.name, normalizedArgs as Expression[]) as T;
    }

    export function element(s: string): V { return symbol(Symbols.structure.constructor.elementSymbol, [s]); }

    export function or(...xs: Varg[]): V { return symbol(Symbols.primitive.operator.or, xs); }
    export function and(...xs: Varg[]): V { return symbol(Symbols.primitive.operator.and, xs); }
    export function plus(...xs: Varg[]): V { return symbol(Symbols.primitive.operator.add, xs); }
    export function div(x: Varg, y: Varg): V { return symbol(Symbols.primitive.operator.div, [x, y]); }

    export function eq(a: Varg, b: Varg): V { return symbol(Symbols.primitive.operator.eq, [a, b]); }
    export function neq(a: Varg, b: Varg): V { return symbol(Symbols.primitive.operator.eq, [a, b]); }
    export function lt(a: Varg, b: Varg): V { return symbol(Symbols.primitive.operator.lt, [a, b]); }
    export function lte(a: Varg, b: Varg): V { return symbol(Symbols.primitive.operator.lte, [a, b]); }
    export function gr(a: Varg, b: Varg): V { return symbol(Symbols.primitive.operator.gr, [a, b]); }
    export function gre(a: Varg, b: Varg): V { return symbol(Symbols.primitive.operator.gre, [a, b]); }

    export function filter(src: Q, f: Varg): Q {
        return symbol(Symbols.structure.primitive.modify, [src, symbol(Symbols.structure.modifier.filter, [f])])
    }

    export function atoms(pred?: Varg, groupBy?: Varg): Q {
        return symbol(Symbols.structure.generator.atomGroups, pred ? groupBy ? [pred, groupBy] : [pred] : void 0);
    }

    export function foldl(f: Varg, initial: Varg): V { return symbol(Symbols.structure.property.atomSet.reduce, [f, initial]); }
    export function slot(index = 0): V { return symbol(Symbols.primitive.functional.slot, [index]); }
    export const structProp = Symbols.structure.property
}

export default Language