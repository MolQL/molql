/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import * as fs from 'fs'

import Expression from './language/expression'
import S from './language/symbols'
import * as Query from './reference-implementation/query/data-model'
import compile from './reference-implementation/compiler/compile'
import Q from './reference-implementation/query/builder'
import * as Molecule from './reference-implementation/molecule/data-model'

//function symb(s: { name: string }) { return Expression.symbol(s.name); }
//console.log('symb', S.primitive.functional.partial.symbol);
function apply(s: string | Expression.Symbol, args?: any[]) { return Expression.symbol(s, args) }
const expr = apply(apply(S.primitive.functional.partial.name, [apply(S.primitive.operator.add.name), 1, 2, 3, 4]), [5])
//const expr = apply(S.primitive.operator.plus, 1, 2)
console.log(Expression.format(expr));
const comp = compile(expr);
console.log(comp(0 as any));

function run(model: Molecule.Model) {
    // for (const c of Molecule.AtomSiteColumns) {
    //     console.log(model.data[c].getString(model.atoms.dataIndex[0]));
    // }

    // (generator (always) (map-get (map 'ALA' 1 'HEM' 1) residue_name 0))
    // { 'ALA': 1, ''}

    const residues = Q.atoms(
        true, //Q.equal(Q.props.residue.label_comp_id, 'HEM'), 
        Q.structProp.residue.uniqueId);
    const cOnHEM = Q.atoms(
        Q.and(Q.eq(Q.structProp.residue.label_comp_id, 'HEM'), Q.eq(Q.structProp.atom.type_symbol, Q.element('C'))),
        Q.structProp.residue.uniqueId);
    //const query = Q.filter(residues, Q.lt(Q.structProp.atomSet.atomCount, 7));
    //const query = residues;
    let query = Q.filter(
        Q.atoms(true, Q.structProp.residue.uniqueId),
        Q.lt(
            Q.div(
                Q.foldl(Q.plus(Q.slot(), Q.structProp.atom.B_iso_or_equiv), 0),
                Q.structProp.atomSet.atomCount),
            40));
    query = cOnHEM;
    console.log(JSON.stringify(query, null, 2));
    console.log(Expression.format(query));
    const compiled = compile(query);
    const ctx = Query.Context.ofModel(model);

    const result = compiled(ctx) as Query.AtomSetSeq;
    console.log(result.atomSets.length, result.atomSets[0].atomIndices);
    // for (const set of result.atomSets)
    //     console.log(set.atomIndices);
}

fs.readFile('e:/test/quick/1tqn_updated.cif', 'utf-8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    try {
        const mol = Molecule.parseCIF(data);
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