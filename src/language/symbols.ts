/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 */

import Type from './type-system'

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
    functional: {
        '@header': 'Operators',
        lazy: symbol({
            type: Type.fn(Type.tuple(), Type.anyValue),
            args: [['value', Type.anyValue]],
            description: 'Holds a value without evaluating it.'
        }),
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
        atomSet: ctor(Type.Structure.atomSet, [['atom-indices', Type.oneOrMore(Type.Primitive.num)]],
            'A list of atom indices. This is a bit dodgy because the ordering can be de-facto orginary. Not 100% about including this into the language.'),
        atomSelection: ctor(Type.Structure.atomSelection, [['sets', Type.zeroOrMore(Type.Structure.atomSet)]])
    },
    primitive: {
        modify: symbol({
            type: Type.Structure.atomSelection,
            args: [['seq', Type.Structure.atomSelection], ['f', Type.Structure.atomSelection]]
        }),
        combine: symbol({
            type: Type.Structure.atomSelection,
            args: [['combinator', Type.Structure.atomSelection], ['seqs', Type.oneOrMore(Type.Structure.atomSelection)]]
        })
    },
    generator: {
        '@header': 'Generators',
        atomGroups: symbol({
            type: Type.Structure.atomSelection,
            args: [
                ['entity-predicate', Type.lazyValue(Type.Primitive.bool)],
                ['chain-predicate', Type.lazyValue(Type.Primitive.bool)],
                ['residue-predicate', Type.lazyValue(Type.Primitive.bool)],
                ['atom-predicate', Type.lazyValue(Type.Primitive.bool)],
                ['group-by', Type.optional(Type.lazyValue(Type.anyValue))]
            ]
        }),
        connectedComponents: symbol({
            type: Type.Structure.atomSelection,
            description: 'Returns all covalently connected components.'
        })
    },
    modifier: {
        '@header': 'Atom Set Modifiers',
        filter: symbol({
            type: Type.Structure.atomSelection,
            args: [['seq', Type.Structure.atomSelection], ['predicate', Type.Primitive.bool]]
        }),
        findIn: symbol({
            description: 'Executes the specified query in the context induced by each of the atoms sets in the sequence.',
            type: Type.Structure.atomSelection,
            args: [['seq', Type.Structure.atomSelection], ['query', Type.Structure.atomSelection]]
        }),
    },
    combinator: {
        '@header': 'Sequence Combinators',
        intersectWith: symbol({
            type: Type.Structure.atomSelection,
        }),
        merge: symbol({
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
        atom: {
            '@header': 'Atoms',
            uniqueId: value(Type.anyValue, 'Returns an implementation specific unique identifier of the current atom.'),
            id: value(Type.Primitive.num),
            Cartn_x: value(Type.Primitive.num),
            Cartn_y: value(Type.Primitive.num),
            Cartn_z: value(Type.Primitive.num),
            label_atom_id: value(Type.Primitive.str),
            type_symbol: value(Type.Primitive.str),
            occupancy: value(Type.Primitive.num),
            B_iso_or_equiv: value(Type.Primitive.num),
            operatorName: value(Type.Primitive.str, 'Returns the name of the symmetry operator applied to this atom (e.g., 4_455). Atoms from the loaded asymmetric always return 1_555. Probably should have specific type constructor for this?')
        },
        residue: {
            '@header': 'Residues',
            uniqueId: value(Type.anyValue, 'Returns an implementation specific unique identifier of the current residue.'),
            isHet: value(Type.Primitive.str),
            label_seq_id: value(Type.Primitive.num),
            label_comp_id: value(Type.Primitive.str),
            pdbx_PDB_ins_code: value(Type.Primitive.str),
            isModified: value(Type.Primitive.bool),
        },
        chain: {
            '@header': 'Chains',
            uniqueId: value(Type.anyValue, 'Returns an implementation specific unique identifier of the current chain.'),
            label_asym_id: value(Type.Primitive.str)
        },
        entity: {
            '@header': 'Entities',
            uniqueId: value(Type.anyValue, 'Returns an implementation specific unique identifier of the current entity.'),
            label_entity_id: value(Type.Primitive.str)
        },
        model: {
            '@header': 'Model',
            pdbx_PDB_model_num: value(Type.Primitive.str)
        },
        secondaryStructure: {
            '@header': 'Secondary Structure',
            uniqueId: value(Type.anyValue, 'Returns an implementation specific unique identifier of the current secondary structure element.'),
        },
        atomSet: {
            '@header': 'Atom Sets',
            '@namespace': Type.Structure.atomSet.kind,
            atomCount: value(Type.Primitive.num),
            isAmino: value(Type.Primitive.bool, 'Is the current atom set formed solely from amino acid atoms?'),
            isNucleotide: value(Type.Primitive.bool, 'Is the current atom set formed solely from nucleotide atoms?'),
            isLigand: value(Type.Primitive.bool, 'Is the current atom set formed solely from ligand atoms?'),
            reduce: {
                accumulator: symbol({
                    type: Type.anyValue,
                    args: [['value', Type.anyValue], ['initial', Type.anyValue]],
                    description: 'Compute a property of an atom set based on it\'s properties. The current value is assigned to the 0-th slot [``(primitive.functional.slot 0)``].'
                }),
                value: symbol({ type: Type.anyValue, description: 'Current value of the accumulator.' })
            ,
            propertySet: symbol({
                type: Type.Primitive.set,
                args: [ ['prop', Type.anyValue] ],
                description: 'Returns a set of unique properties from all atoms within the current atom set.'
            }),}
        },
        atomSelection: {
            '@header': 'Atom Set Sequences',
            '@namespace': Type.Structure.atomSelection.kind,
            length: symbol({
                type: Type.Structure.atomSelection,
                args: [ ['seq', Type.Structure.atomSelection] ]
            }),
            propertySet: symbol({
                type: Type.Primitive.set,
                args: [ ['prop', Type.anyValue], ['seq', Type.Structure.atomSelection] ],
                description: 'Returns a set of unique properties from all atoms within the source sequence.'
            }),
        }
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