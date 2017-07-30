/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import * as fs from 'fs'

//import Expression from './language/expression'
//import S from './language/symbols'
//import * as Query from './reference-implementation/query/data'
import compile from './reference-implementation/compiler/compiler'
import B from './reference-implementation/utils/expression-builder'
import { Model } from './reference-implementation/molecule/data'
import parseCIF from './reference-implementation/molecule/parser'
import lispFormat from './reference-implementation/utils/expression-lisp-formatter'
import Environment from './reference-implementation/runtime/environment'
import { SymbolTable } from './reference-implementation/runtime/symbols'
import Context from './reference-implementation/query/context'
import AtomSelection from './reference-implementation/query/atom-selection'
import { getSymbolsWithoutImplementation } from './language/symbols'
import AtomSet from './reference-implementation/query/atom-set'
import mmCIFwriter from './reference-implementation/molecule/writer'

const notImplemented = getSymbolsWithoutImplementation(SymbolTable.map(s => s.symbol));
console.log(notImplemented.map(s => s.name).join('\n'));

const expr = B.math(s => s.mult, 1, 2, 3);

// symb(S.primitive.operator.arithmetic.mult.name,
//     [1, symb(S.primitive.operator.arithmetic.add.name, [3, 4, 5]), 2, 3, 4, 5])

//const expr = apply(S.primitive.operator.plus, 1, 2)
console.log(lispFormat(expr));
const comp = compile(expr);
console.log(comp(Environment()));

// function bb() {
//     const v = compile(expr);
//     let ret: any = [];
//     const env = Environment();
//     for (let i = 0; i < 1000000; i++) {
//         ret = v(env);
//     }
//     return ret;
// }
// function add(...args: number[]): number;
// function add() {
//     let ret = 0;
//     for (let i = 0; i < arguments.length; i++) ret += arguments[i];
//     return ret;
// }
// function fff(i: number) {
//     return i + 1;
// }
// function bl() {
//     let ret = 0;
//     for (let i = 0; i < 1000000; i++) {
//         ret += add.apply(null, [fff(i), fff(i), fff(i  -1 ), fff(i + 3), fff(i +9)]);
//     }
//     return ret;
// }

// console.time('bb');
// bb();
// console.timeEnd('bb');
// console.time('bb');
// bb();
// console.timeEnd('bb');
// console.time('bb');
// bb();
// console.timeEnd('bb');
// console.time('bl');
// bl();
// console.timeEnd('bl');
// console.time('bl');
// bl();
// console.timeEnd('bl');

function run(model: Model) {

    const es = (s: string) => B.Struct.ctor(c => c.elementSymbol, s)

    // const q = B.Struct.gen(
    //     g => g.atomGroups,
    //     true, // entity
    //     true, // chain
    //     B.rel(e => e.inRange, B.Struct.atomProperty('auth_seq_id'), 35, 45), // residue
    //     B.set(e => e.has, B.ctor(c => c.set, es('C'), es('N')), B.Struct.atomProperty('type_symbol')), // atom
    //     B.Struct.atomProperty('residue-key') // group by
    // );

    const fe = B.Struct.gen(
        g => g.atomGroups,
        true, // entity
        true, // chain
        true, // residue
        B.set(e => e.has, B.ctor(c => c.set, es('FE')), B.Struct.atomProperty('type_symbol')), // atom
        B.Struct.atomProperty('residue-key') // group by
    );

    const hem = B.Struct.gen(
        g => g.atomGroups,
        true, // entity
        true, // chain
        B.rel(r => r.eq, B.Struct.atomProperty('auth_comp_id'), 'HEM'), // residue
        true, // atom
        B.Struct.atomProperty('residue-key') // group by
    );

    const cn = B.Struct.gen(
        g => g.atomGroups,
        true, // entity
        true, // chain
        B.rel(r => r.eq, B.Struct.atomProperty('auth_comp_id'), 'ALA'),
        //B.rel(e => e.inRange, B.Struct.atomProperty('auth_seq_id'), 35, 45), // residue
        B.set(e => e.has, B.ctor(c => c.set, es('C'), es('N')), B.Struct.atomProperty('type_symbol')), // atom
        B.Struct.atomProperty('residue-key') // group by
    );

    const bfactor = B.Struct.atomSet(s => s.reduce.accumulator, 0, B.math(m => m.max, B.Struct.atomProperty('B_iso_or_equiv'), B.Struct.atomSet(s => s.reduce.value)));
    const q = B.Struct.modifier(m => m.includeSurroundings, fe, 5, true);
    //B.Struct.filter(f => f.pick, cn, B.rel(r => r.gr, bfactor, 80));

    console.log(lispFormat(q));

    const ctx = Context.ofModel(model);
    const env = Environment(ctx);
    const r = compile<AtomSelection>(q);
    console.time('query');
    const res = r(env);
    console.timeEnd('query');

    // console.time('query');
    // const res1 = r(env);
    // console.timeEnd('query');

    //console.log(AtomSelection.atomSets(res).map(s => AtomSet.atomIndices(s)));
    console.log(AtomSelection.atomSets(res).length);

    const cif = mmCIFwriter(model, AtomSet.atomIndices(AtomSelection.toAtomSet(res)));
    console.log(cif);
    //console.log(AtomSet.atomIndices(AtomSelection.toAtomSet(res)));
    //console.log(model.entities);
    //console.log(model.chains);
}

fs.readFile('e:/test/quick/1tqn_updated.cif', 'utf-8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    try {
        const mol = parseCIF(data);
        //console.log(mol.models[0].residues.secondaryStructureType);
        run(mol.models[0]);
    } catch (e) {
        console.error(e);
        return;
    }
})

// function chain(label_asym_id: string): Data.Molecule.ChainFields { return { label_asym_id }; }
// function residue(label_seq_id: number, label_comp_id: string): Data.Molecule.ResidueFields { return { label_seq_id, label_comp_id }; }
// function atom(id: number, type_symbol: string, label_atom_id: string): Data.Molecule.AtomFields { return { id, type_symbol, label_atom_id }; }

// let aId = 0, rId = 0;
// const molecule = Data.Molecule.ofShape({
//     chains: [{
//         fields: chain('A'),
//         residues: [{
//             fields: residue(rId++, 'ALA'),
//             atoms: [ atom(aId++, 'C', 'CA'), atom(aId++, 'O', 'O'), atom(aId++, 'C', 'CB') ]
//         }, {
//             fields: residue(rId++, 'HEM'),
//             atoms: [ atom(aId++, 'FE', 'FE'), atom(aId++, 'N', 'ND1') ]
//         }]
//     }]
// })

// const context = Data.Context.ofMolecule(molecule);

// ///const query = Q.residues(Q.equal(Q.props.residue.label_comp_id.symbol, Q.val('HEM')))

// // Expr.apply(Symbols.generators.atoms, [ 
// //     Expr.apply(Symbols.operators.equal, [  
// //         Symbols.props.type_symbol,
// //         Expr.value('C')
// //     ])
// //]);

// //console.log(JSON.stringify(query, null, 2));

// //const compiled = compile(query);
// //const result = compiled(context);

// //console.log(result);


// const orr = Q.logicOr(Q.val(false), Q.val(false), Q.val(false), Q.val(false), Q.val(true));
// console.log(JSON.stringify(orr, null, 2));
// console.log(compile(orr)(context));
// //  filter(residues(), gr(count(atoms('C')), 10))

// // atoms(type_symbol == 'C') => [['C'], ['C'], ['C']]
// // inside(atoms(type_symbol == 'C'), residues(name == 'HEM')) => [['C'], ['C']]
// // chains(asym_id == 'A' && res_name == 'HEM')

// // atoms(comp_id == 'HEM' && type_symbols == 'C')

// // residues('HEM').flatMap(find(atoms('C')))

// // residues('HEM').filter(count(atoms('C')) > 0)
