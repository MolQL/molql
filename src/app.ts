/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import * as fs from 'fs'

import { Expression } from './language/expression'
import * as Query from './reference-implementation/query/data-model'
import compile from './reference-implementation/minimal-compiler/compiler'
import Q from './reference-implementation/query/builder'
import * as Molecule from './reference-implementation/molecule/data-model'

function run(model: Molecule.Model) {
    // for (const c of Molecule.AtomSiteColumns) {
    //     console.log(model.data[c].getString(model.atoms.dataIndex[0]));
    // }

    // (generator (always) (map-get (map 'ALA' 1 'HEM' 1) residue_name 0))
    // { 'ALA': 1, ''}

    const residues = Q.atoms(
        true, //Q.equal(Q.props.residue.label_comp_id, 'HEM'), 
        Q.structProp.residue.uniqueId);
    //const query = Q.filter(residues, Q.lt(Q.structProp.atomSet.atomCount, 7));
    const query = Q.filter(
        Q.atoms(true, Q.structProp.residue.uniqueId), 
        Q.lt(
            Q.div(
                Q.foldl(Q.plus(Q.structProp.atomSet.accumulate.value, Q.structProp.atom.B_iso_or_equiv), 0),
                Q.structProp.atomSet.atomCount),
            40));
    console.log(JSON.stringify(query, null, 2));
    console.log(Expression.format(query));
    const compiled = compile(query);
    const ctx = Query.Context.ofModel(model);

    const result = compiled(ctx) as Query.AtomSetSeq;
    console.log(result.atomSets.length, result.atomSets[0].atomIndices);
    // for (const set of result.atomSets)
    //     console.log(set.atomIndices);
}

fs.readFile('c:/test/quick/1tqn_updated.cif', 'utf-8', (err, data) => {
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