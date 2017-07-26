/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 */

import Type from './type-system'
import Expression from './expression'

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
    header: 'Langauge Primitives',
    constructor: {
        header: 'Constructors',
        list: ctor(Type.Primitive.list, [['values', Type.zeroOrMore(Type.value), 'A list of values.']]),
        set: ctor(Type.Primitive.set, [['values', Type.zeroOrMore(Type.value), 'A list of values.']]),
        map: ctor(Type.Primitive.map, [['key-value-pairs', Type.zeroOrMore(Type.value), 'A list of key value pairs, e.g. (map 1 "x" 2 "y").']]),
        regex: symbol({
            type: Type.Primitive.regex,
            args: [
                ['expression', Type.value],
                ['flags', Type.optional(Type.value)]
            ],
            description: 'Creates a regular expression from a string using the ECMAscript syntax.'
        })
    },
    functional: {
        header: 'Functional Operators',
        partial: symbol({
            type: Type.value,
            args: [
                ['f', Type.fn(Type.zeroOrMore(Type.value), Type.value)],
                ['args', Type.zeroOrMore(Type.value)]
            ]
        }),
        slot: symbol({
            type: Type.value,
            args: [['index', Type.value]]
        })
    },
    operator: {
        header: 'Operators',
        logic: {
            header: 'Logic',
            not: unaryOp(),
            and: binOp(),
            or: binOp(),
        },

        arithmetic: {
            header: 'Arithmetic',
            add: binOp(),
            sub: binRel(),
            minus: unaryOp(),
            mult: binOp(),
            div: binRel(),
            pow: binRel(),

            min: binOp(),
            max: binOp(),

            floor: unaryOp(),
            ceil: unaryOp(),
            roundInt: unaryOp(),
            abs: unaryOp(),
            sin: unaryOp(),
            cos: unaryOp(),
            tan: unaryOp(),
            asin: unaryOp(),
            acos: unaryOp(),
            atan: unaryOp(),
            atan2: symbol({ type: Type.value, args: [['index', Type.value]] }),
            sinh: unaryOp(),
            cosh: unaryOp(),
            tanh: unaryOp(),
            exp: unaryOp(),
            log: unaryOp(),
            log10: unaryOp()
        },

        relational: {
            header: 'Relational',
            eq: binRel(),
            neq: binRel(),
            lt: binRel(),
            lte: binRel(),
            gr: binRel(),
            gre: binRel(),
            inRange: symbol({
                type: Type.value,
                args: [['min', Type.value], ['max', Type.value], ['value', Type.value]]
            }),
        },

        string: {
            header: 'Strings',
            concat: binOp(),
            match: symbol({
                type: Type.value,
                args: [
                    ['expression', Type.Primitive.regex],
                    ['value', Type.value]
                ]
            })
        },

        collections: {
            header: 'Collections',
            inSet: symbol({
                type: Type.value,
                args: [['set', Type.Primitive.set], ['value', Type.value]]
            }),
            mapGet: symbol({
                type: Type.value,
                args: [['map', Type.Primitive.map], ['key', Type.value], ['default', Type.value]]
            })
        }
    }
}

const modifierType = Type.fn(Type.Structure.atomSet, Type.Structure.atomSetSeq);
const combinatorType = Type.fn(Type.oneOrMore(Type.Structure.atomSetSeq), Type.Structure.atomSetSeq);

const structure = {
    header: 'Molecular Structure Queries',
    constructor: {
        header: 'Constructors',
        elementSymbol: ctor(Type.Structure.elementSymbol, [['symbol', Type.value]]),
        atomSet: ctor(Type.Structure.atomSet, [['atom-indices', Type.oneOrMore(Type.value)]]),
        atomSetSeq: ctor(Type.Structure.atomSetSeq, [['sets', Type.zeroOrMore(Type.Structure.atomSet)]])
    },
    primitive: {
        modify: symbol({
            type: Type.Structure.atomSetSeq,
            args: [['seq', Type.Structure.atomSetSeq], ['f', Type.Structure.atomSetSeq]]
        }),
        combine: symbol({
            type: Type.Structure.atomSetSeq,
            args: [['combinator', Type.Structure.atomSetSeq], ['seqs', Type.oneOrMore(Type.Structure.atomSetSeq)]]
        }),
        inContext: symbol({
            description: 'Executes the query inside a different context. This query cannot be used inside a generator or modifier sequence.',
            type: Type.Structure.atomSetSeq,
            args: [['context', Type.value], ['query', Type.Structure.atomSetSeq]]
        })
    },
    generator: {
        header: 'Generators',
        atomGroups: symbol({
            type: Type.Structure.atomSetSeq,
            args: [['predicate', Type.optional(Type.value)], ['group-by', Type.optional(Type.value)]]
        }),
    },
    modifier: {
        header: 'Atom Set Modifiers',
        filter: symbol({
            type: Type.Structure.atomSetSeq,
            args: [['predicate', Type.value]]
        }),
        within: symbol({
            type: Type.Structure.atomSetSeq,
            args: [['radius', Type.value], ['seq', Type.Structure.atomSetSeq]]
        }),
        find: symbol({
            description: 'Executes the specified query in the context induced by each of the atoms sets in the sequence.',
            type: Type.Structure.atomSetSeq,
            args: [['query', Type.Structure.atomSetSeq]]
        }),
    },
    combinator: {
        header: 'Sequence Combinators',
        merge: symbol({
            type: Type.Structure.atomSetSeq,
        }),
        union: symbol({
            description: 'Collects all atom sets in the sequence into a single atom set.',
            type: Type.Structure.atomSetSeq,
        }),
        near: symbol({
            description: 'Merges all tuples of atom sets that are mutually no further than the specified threshold.',
            type: Type.Structure.atomSetSeq,
            args: [['max-distance', Type.value]]
        })
    },
    context: {
        header: 'Context Updates',
        inside: symbol({
            type: Type.value,
            description: 'Create a context induced by the query.',
            args: [ ['query', Type.Structure.atomSetSeq] ]
        })
    },
    property: {
        header: 'Properties',
        atom: {
            header: 'Atoms',
            uniqueId: value('Returns an implementation specific unique identifier of the current atom.'),

            Cartn_x: value(),
            Cartn_y: value(),
            Cartn_z: value(),
            id: value(),
            label_atom_id: value(),
            type_symbol: value(),
            occupancy: value(),
            B_iso_or_equiv: value(),
            operatorName: value('Returns the name of the symmetry operator applied to this atom (e.g., 4_455). Atoms from the loaded asymmetric always return 1_555')
        },
        residue: {
            header: 'Residues',
            uniqueId: value('Returns an implementation specific unique identifier of the current residue.'),

            group_PDB: value(),
            label_seq_id: value(),
            label_comp_id: value(),
            pdbx_PDB_ins_code: value()
        },
        chain: {
            header: 'Chains',
            uniqueId: value('Returns an implementation specific unique identifier of the current chain.'),

            label_asym_id: value()
        },
        entity: {
            header: 'Entities',
            uniqueId: value('Returns an implementation specific unique identifier of the current entity.'),

            id: value()
        },
        model: {
            header: 'Model',
            pdbx_PDB_model_num: value()
        },
        secondaryStructure: {
            header: 'Secondary Structure',
            uniqueId: value('Returns an implementation specific unique identifier of the current secondary structure element.'),
        },
        atomSet: {
            header: 'Atom Sets',
            namespace: Type.Structure.atomSet.kind,
            atomCount: value(),
            reduce: symbol({
                type: Type.value,
                args: [['f', Type.fn(Type.value, Type.value)], ['initial', Type.value]]
            })
        },
        atomSetSeq: {
            header: 'Atom Set Sequences',
            namespace: Type.Structure.atomSetSeq.kind,
            length: symbol({
                type: Type.Structure.atomSetSeq,
                args: [ ['seq', Type.Structure.atomSetSeq] ]
            }),
            propertySet: symbol({
                type: Type.Primitive.set,
                args: [ ['prop', Type.value], ['seq', Type.Structure.atomSetSeq] ],
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

function value(description?: string) {
    return symbol({ type: Type.value, description });
}

function unaryOp(description?: string) {
    return symbol({
        type: Type.value,
        description,
        args: [
            ['args', Type.value]
        ]
    });
}


function binOp(description?: string) {
    return symbol({
        type: Type.value,
        description,
        args: [
            ['args', Type.oneOrMore(Type.value)]
        ]
    });
}

function binRel(description?: string) {
    return symbol({
        type: Type.value,
        description,
        args: [['a', Type.value], ['b', Type.value]]
    });
}

function formatKey(key: string) {
    return key.replace(/.[A-Z]/g, s => `${s[0]}-${s[1].toLocaleLowerCase()}`);
}

function normalizeName(prefix: string, key: string, obj: any) {
    if (isSymbolInfo(obj)) {
        obj.shortName = obj.shortName || formatKey(key);
        obj.name = `${prefix}.${obj.shortName}`;

        return;
    }
    const namespace = `${obj['namespace'] || key}`;
    const newPrefix = prefix ? `${prefix}.${namespace}` : namespace;
    for (const childKey of Object.keys(obj)) {
        if (typeof obj[childKey] !== 'object') continue;
        normalizeName(newPrefix, childKey, obj[childKey]);
    }
}
normalizeName('', '', table);

export default table;