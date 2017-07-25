/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
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

export function isSymbolInfo(x: any): x is SymbolInfo {
    return !!x.isSymbol;
}

function symbol(info: SymbolSpec): SymbolInfo {
    return { name: '', shortName: '', ...info, isSymbol: true };
}

const valuesArg: ArgSpec = ['values', Type.zeroOrMore(Type.value), 'A list of values.'];
function ctor(type: Type, args: ArgSpec[], description?: string) {
    return symbol({ name: type.kind, type, args, description });
}

function value(description?: string) {
    return symbol({ type: Type.value, description });
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

const primitive = {
    header: 'Langauge Primitives',
    constructor: {
        header: 'Constructors',
        list: ctor(Type.Primitive.list, [valuesArg]),
        set: ctor(Type.Primitive.set, [valuesArg]),
        map: ctor(Type.Primitive.map, [valuesArg]),
    },
    functional: {
        header: 'Functional Operators',
        applyPartial: symbol({
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
        not: symbol({ type: Type.value, args: [['a', Type.value]] }),
        and: binOp(),
        or: binOp(),

        plus: binOp(),
        minus: binRel(),
        times: binOp(),
        div: binRel(),
        power: binRel(),
        min: binOp(),
        max: binOp(),

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

const structure = {
    header: 'Molecular Structure Queries',
    constructor: {
        header: 'Constructors',
        elementSymbol: ctor(Type.Structure.elementSymbol, [['symbol', Type.value]]),
        atomSet: ctor(Type.Structure.atomSet, [['atom-indices', Type.oneOrMore(Type.value)]]),
        atomSetSeq: ctor(Type.Structure.atomSetSeq, [['sets', Type.zeroOrMore(Type.Structure.atomSet)]])
    },
    property: {
        header: 'Properties',
        atom: {
            header: 'Atoms',
            id: value(),
            label_atom_id: value(),
            type_symbol: value(),
            B_iso_or_equiv: value(),
            operatorName: value('Returns the name of the symmetry operator applied to this atom.')
        },
        residue: {
            header: 'Residues',
            uniqueId: value(),
            label_seq_id: value(),
            label_comp_id: value()
        },
        chain: {
            header: 'Chains',
            label_asym_id: value()
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
            })
        }
    },
    primitive: {
        header: 'Query Primitives',
        generate: symbol({
            type: Type.Structure.atomSetSeq,
            args: [['predicate', Type.optional(Type.value)], ['group-by', Type.optional(Type.value)]]
        }),
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
            type: Type.Structure.atomSetSeq
        }),
        union: symbol({
            description: 'Collects all atom sets in the sequence into a single atom set.',
            type: Type.Structure.atomSetSeq
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
        }),
        assembly: symbol({
            type: Type.value,
            description: 'Creates a context by applying assembly operators.',
            args: [ ['name', Type.value] ]
        }),
        symmetryMates: symbol({
            description: 'Creates a context by adding symmetry mates that are within *radius* angstroms.',
            type: Type.value,
            args: [ ['radius', Type.value] ]
        })
    }
}

const table = {
    primitive,
    structure
};

function formatKey(key: string) {
    return key.replace(/.[A-Z]/g, s => `${s[0]}-${s[1].toLocaleLowerCase()}`);
}

function normalizeName(prefix: string, key: string, obj: any) {
    if (isSymbolInfo(obj)) {
        obj.shortName = `${obj.name || formatKey(key)}`;
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