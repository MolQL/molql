/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Expression from '../../language/expression'
import Symbols, { SymbolInfo } from '../../language/symbols'
import { StaticAtomProperties } from '../../language/properties'

namespace Builder {
    function category<T>(symbols: T): (s: (cat: T) => SymbolInfo, ...args: Expression[]) => Expression {
        return (s, ...args) => Expression.apply(Expression.symbol(s(symbols).name), args.length ? args : void 0);
    }

    export function symbol(symb: (s: Symbols) => SymbolInfo) {
        return Expression.symbol(symb(Symbols).name);
    }

    export const ctor = category(Symbols.primitive.type);
    export const logic = category(Symbols.primitive.operator.logic);
    export const rel = category(Symbols.primitive.operator.relational);
    export const math = category(Symbols.primitive.operator.arithmetic);
    export const str = category(Symbols.primitive.operator.string);
    export const set = category(Symbols.primitive.operator.set);
    export const map = category(Symbols.primitive.operator.map);

    export namespace Struct {
        export const ctor = category(Symbols.structure.constructor);
        export const filter = category(Symbols.structure.filter);
        export const modifier = category(Symbols.structure.modifier);
        export const gen = category(Symbols.structure.generator);
        export const atomSet = category(Symbols.structure.atomSet);
        //export const mod = category(Symbols.structure.modifier);
        //export const comb = category(Symbols.structure.modifier);
        export const attr = category(Symbols.structure.property);

        // export function modify(what: Expression, modifier: Expression) { return prim(s => s.modify, what, modifier); }
        // export function combine(combinator: (c: typeof comb) => Expression, ...seqs: Expression[]) {
        //     return prim(s => s.combine, combinator(comb), ...seqs);
        // }

        export function atomProperty(name: StaticAtomProperties) {
            return Expression.apply(Expression.symbol(Symbols.structure.property.atomStatic.name), [name]);
        }
    }
}

export default Builder