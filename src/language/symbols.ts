/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 */

import Type from './type-system'
import { StaticAtomProperties } from './properties'

export type ArgSpec = [string, Type, string] | [string, Type]

interface SymbolSpec {
    name?: string,
    type: Type,
    description?: string,
    args?: ArgSpec[]
}

export interface SymbolInfo {
    isSymbol?: true,
    name: string,
    shortName: string,
    type: Type,
    description?: string,
    args?: ArgSpec[]
}

const primitive = {
    '@header': 'Langauge Primitives',
    constructor: {
        '@header': 'Constructors',
        bool: symbol({ type: Type.Primitive.bool, args: [['value', Type.anyValue]] }),
        number: symbol({ type: Type.Primitive.num, args: [['value', Type.anyValue]] }),
        str: symbol({ type: Type.Primitive.str, args: [['value', Type.anyValue]] }),
        list: ctor(Type.Primitive.list, [['values', Type.zeroOrMore(Type.anyValue), 'A list of values.']]),
        set: ctor(Type.Primitive.set, [['values', Type.zeroOrMore(Type.anyValue)]]),
        map: ctor(Type.Primitive.map, [['key-value-pairs', Type.zeroOrMore(Type.anyValue), 'A list of key value pairs, e.g. (map 1 "x" 2 "y").']]),
        regex: symbol({
            type: Type.Primitive.regex,
            args: [
                ['expression', Type.Primitive.str],
                ['flags', Type.optional(Type.Primitive.str)]
            ],
            description: 'Creates a regular expression from a string using the ECMAscript syntax.'
        })
    },
    operator: {
        '@header': 'Operators',
        logic: {
            '@header': 'Logic',
            not: unaryOp(Type.Primitive.bool),
            and: binOp(Type.Primitive.bool),
            or: binOp(Type.Primitive.bool),
        },

        arithmetic: {
            '@header': 'Arithmetic',
            add: binOp(Type.Primitive.num),
            sub: binRel(Type.Primitive.num, Type.Primitive.num),
            minus: unaryOp(Type.Primitive.num),
            mult: binOp(Type.Primitive.num),
            div: binRel(Type.Primitive.num, Type.Primitive.num),
            pow: binRel(Type.Primitive.num, Type.Primitive.num),

            min: binOp(Type.Primitive.num),
            max: binOp(Type.Primitive.num),

            floor: unaryOp(Type.Primitive.num),
            ceil: unaryOp(Type.Primitive.num),
            roundInt: unaryOp(Type.Primitive.num),
            abs: unaryOp(Type.Primitive.num),
            sin: unaryOp(Type.Primitive.num),
            cos: unaryOp(Type.Primitive.num),
            tan: unaryOp(Type.Primitive.num),
            asin: unaryOp(Type.Primitive.num),
            acos: unaryOp(Type.Primitive.num),
            atan: unaryOp(Type.Primitive.num),
            atan2: symbol({ type: Type.Primitive.num, args: [['x', Type.Primitive.num], ['y', Type.Primitive.num]] }),
            sinh: unaryOp(Type.Primitive.num),
            cosh: unaryOp(Type.Primitive.num),
            tanh: unaryOp(Type.Primitive.num),
            exp: unaryOp(Type.Primitive.num),
            log: unaryOp(Type.Primitive.num),
            log10: unaryOp(Type.Primitive.num)
        },

        relational: {
            '@header': 'Relational',
            eq: binRel(Type.anyValue, Type.Primitive.bool),
            neq: binRel(Type.anyValue, Type.Primitive.bool),
            lt: binRel(Type.Primitive.num, Type.Primitive.bool),
            lte: binRel(Type.Primitive.num, Type.Primitive.bool),
            gr: binRel(Type.Primitive.num, Type.Primitive.bool),
            gre: binRel(Type.Primitive.num, Type.Primitive.bool),
            inRange: symbol({
                type: Type.Primitive.num,
                args: [['min', Type.Primitive.num], ['max', Type.Primitive.num], ['value', Type.Primitive.num]]
            }),
        },

        string: {
            '@header': 'Strings',
            concat: binOp(Type.Primitive.str),
            match: symbol({
                type: Type.Primitive.str,
                args: [
                    ['regex', Type.Primitive.regex],
                    ['value', Type.Primitive.str]
                ]
            })
        },

        set: {
            '@header': 'Sets',
            has: symbol({
                type: Type.Primitive.bool,
                args: [['set', Type.Primitive.set], ['value', Type.anyValue]]
            }),
            add: symbol({
                type: Type.Primitive.set,
                args: [['set', Type.Primitive.set], ['value', Type.anyValue]]
            }),
        },

        map: {
            '@header': 'Maps',
            get: symbol({
                type: Type.anyValue,
                args: [['map', Type.Primitive.map], ['key', Type.anyValue], ['default', Type.anyValue]]
            }),
            set: symbol({
                type: Type.Primitive.map,
                args: [['map', Type.Primitive.map], ['key', Type.anyValue], ['value', Type.anyValue]]
            })
        }
    }
}

const structure = {
    '@header': 'Molecular Structure Queries',
    constructor: {
        '@header': 'Constructors',
        elementSymbol: ctor(Type.Structure.elementSymbol, [['symbol', Type.Primitive.str]]),
        secondaryStructureType: ctor(Type.Structure.secondaryStructureType, [['symbol', Type.Primitive.str]]),
    },
    generator: {
        '@header': 'Generators',
        atomGroups: symbol({
            type: Type.Structure.atomSelection,
            args: [
                ['entity-predicate', Type.Primitive.bool],
                ['chain-predicate', Type.Primitive.bool],
                ['residue-predicate', Type.Primitive.bool],
                ['atom-predicate', Type.Primitive.bool],
                ['group-by', Type.optional(Type.anyValue)]
            ]
        })
        // connectedComponents: symbol({
        //     type: Type.Structure.atomSelection,
        //     description: 'Returns all covalently connected components.'
        // })
    },
    modifier: {
        '@header': 'Selection Modifications',
        includeSurroundings: symbol({
            type: Type.Structure.atomSelection,
            args: [['selection', Type.Structure.atomSelection], ['radius', Type.Primitive.num], ['wholeResidues', Type.optional(Type.Primitive.bool)]]
        }),
        queryEach: symbol({
            type: Type.Structure.atomSelection,
            args: [['selection', Type.Structure.atomSelection], ['query', Type.Structure.atomSelection]]
        }),
        intersectBy: symbol({
            description: 'Intersect each atom set from the first sequence from atoms in the second one.',
            type: Type.Structure.atomSelection,
            args: [['selection', Type.Structure.atomSelection], ['by', Type.Structure.atomSelection]]
        }),
        unionBy: symbol({
            description: 'For each atom set A in the orginal sequence, combine all atoms sets in the target selection that intersect with A.',
            type: Type.Structure.atomSelection,
            args: [['selection', Type.Structure.atomSelection], ['by', Type.Structure.atomSelection]]
        }),
        complement: symbol({
            description: 'Complement each atom set in the selection (with respect to the current context).',
            type: Type.Structure.atomSelection,
            args: [['selection', Type.Structure.atomSelection]]
        }),
    },
    filter: {
        '@header': 'Selection Filters',
        withProperties: symbol({
            type: Type.Structure.atomSelection,
            args: [['selection', Type.Structure.atomSelection], ['source', Type.Structure.atomSelection], ['property', Type.anyValue]]
        }),
        within: symbol({
            type: Type.Structure.atomSelection,
            args: [['selection', Type.Structure.atomSelection], ['other-selection', Type.Structure.atomSelection]]
        }),
        pick: symbol({
            type: Type.Structure.atomSelection,
            args: [['selection', Type.Structure.atomSelection], ['predicate', Type.Primitive.bool]]
        }),
    },
    combinator: {
        '@header': 'Sequence Combinators',
        intersect: symbol({
            description: 'Return all unique atom sets that appear in all of the source selections.',
            type: Type.Structure.atomSelection,
        }),
        merge: symbol({
            description: 'Merges multiple selections into a single one.',
            type: Type.Structure.atomSelection,
        }),
        union: symbol({
            description: 'Collects all atom sets in the sequence into a single atom set.',
            type: Type.Structure.atomSelection,
        }),
        near: symbol({
            description: 'Merges all tuples of atom sets that are mutually no further than the specified threshold.',
            type: Type.Structure.atomSelection,
            args: [['max-distance', Type.Primitive.num]]
        })
    },
    property: {
        '@header': 'Properties',
        atomStatic: symbol({
            type: Type.anyValue,
            args: [['name', Type.Structure.atomProperty]],
            description: `Access a "statically defined" atom property. One of: ${Object.keys(StaticAtomProperties).map(k => '``' + k + '``').join(', ')}.`
        })
    },
    atomSet: {
        '@header': 'Atom Sets',
        '@namespace': Type.Structure.atomSet.kind,
        atomCount: value(Type.Primitive.num),
        reduce: {
            accumulator: symbol({
                type: Type.anyValue,
                args: [['value', Type.anyValue], ['initial', Type.anyValue]],
                description: 'Compute a property of an atom set based on it\'s properties. The current value is assigned to the 0-th slot [``(primitive.functional.slot 0)``].'
            }),
            value: symbol({ type: Type.anyValue, description: 'Current value of the accumulator.' })
        },
        propertySet: symbol({
            type: Type.Primitive.set,
            args: [ ['prop', Type.anyValue] ],
            description: 'Returns a set of unique properties from all atoms within the current atom set.'
        }),
        count: symbol({
            description: 'Counts the number of occurences of a specific query inside the current atom set.',
            type: Type.Structure.atomSelection,
            args: [['query', Type.Structure.atomSelection]]
        }),
    },
    selection: {
        '@header': 'Selection',
        propertySet: symbol({
            type: Type.Primitive.set,
            args: [ ['prop', Type.anyValue], ['seq', Type.Structure.atomSelection] ],
            description: 'Returns a set of unique properties from all atoms within the source sequence.'
        })
    }
}

const table = {
    primitive,
    structure
};

export function isSymbolInfo(x: any): x is SymbolInfo {
    return !!x.isSymbol;
}

function symbol(info: SymbolSpec): SymbolInfo {
    return { isSymbol: true, name: '', shortName: info.name || '', type: info.type, description: info.description, args: info.args };
}

function ctor(type: Type, args: ArgSpec[], description?: string) {
    return symbol({ name: type.kind, type, args, description });
}

function value(type: Type, description?: string) {
    return symbol({ type, description });
}

function unaryOp(type: Type, description?: string) {
    return symbol({
        type,
        description,
        args: [
            ['x', type]
        ]
    });
}


function binOp(type: Type, description?: string) {
    return symbol({
        type,
        description,
        args: [
            ['xs', Type.oneOrMore(type)]
        ]
    });
}

function binRel(type: Type, retType: Type, description?: string) {
    return symbol({
        type: retType,
        description,
        args: [['x', type], ['y', type]]
    });
}

function formatKey(key: string) {
    return key.replace(/([a-z])([A-Z])([a-z]|$)/g, (s, a, b, c) => `${a}-${b.toLocaleLowerCase()}${c}`);
}

function normalizeName(prefix: string, key: string, obj: any) {
    if (isSymbolInfo(obj)) {
        obj.shortName = obj.shortName || formatKey(key);
        obj.name = `${prefix}.${obj.shortName}`;

        return;
    }
    const namespace = `${obj['@namespace'] || formatKey(key)}`;
    const newPrefix = prefix ? `${prefix}.${namespace}` : namespace;
    for (const childKey of Object.keys(obj)) {
        if (typeof obj[childKey] !== 'object') continue;
        normalizeName(newPrefix, childKey, obj[childKey]);
    }
}
normalizeName('', '', table);

function _symbolList(obj: any, list: SymbolInfo[]) {
    if (isSymbolInfo(obj)) {
        list.push(obj);
        return;
    }
    for (const childKey of Object.keys(obj)) {
        if (typeof obj[childKey] !== 'object') continue;
        _symbolList(obj[childKey], list);
    }
}

export function getSymbolsWithoutImplementation(implemented: SymbolInfo[]) {
    const list: SymbolInfo[] = [];
    _symbolList(table, list);
    const names = new Set(implemented.map(s => s.name));
    return list.filter(s => !names.has(s.name));
}

type table = typeof table
export default table