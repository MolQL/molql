/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as fs from 'fs'
import { Model } from './reference-implementation/structure/data'
import AtomSelection from './reference-implementation/molql/data/atom-selection'
import AtomSet from './reference-implementation/molql/data/atom-set'
import parseCIF from './reference-implementation/structure/parser'
import compile from './reference-implementation/molql/compiler'
import mmCIFwriter from './reference-implementation/structure/writer'
import Context from './reference-implementation/molql/runtime/context'
import typeCheck from './reference-implementation/molql/type/checker'
//import formatE from './reference-implementation/mini-lisp/expression-formatter'
import { SymbolMap } from './molql/symbol-table'
import B from './molql/builder'

import AtomSetIt = AtomSet.Iterator;

// import { isSymbol } from './mini-lisp/symbol'
// import MolQL from './molql/symbols'

// function _normalizeTable(namespace: string, key: string, obj: any) {
//     if (isSymbol(obj)) {
//         console.log(`Alias(MolQL.${namespace}.${key}, '${obj.info.name}'),`);
//         return;
//     }
//     const newNs = namespace ? `${namespace}.${key}` : key;
//     for (const childKey of Object.keys(obj)) {
//         if (typeof obj[childKey] !== 'object' && !isSymbol(obj[childKey])) continue;
//         _normalizeTable(newNs, childKey, obj[childKey]);
//     }
// }

// _normalizeTable('', '', MolQL);

const a = AtomSet([1,5,7])
const b = AtomSet([4,6,8])
const v = AtomSet([5, 7, 9])
console.log(AtomSet.toIndices(AtomSet.union(a, b)))
console.log(AtomSet.toIndices(AtomSet.union(a, v)))

// const aResId = (c: string, r: number, i?: string) => B.struct.type.authResidueId([c, r, i]);
// const resSet = B.core.type.set([aResId('A', 7), aResId('A', 9)]);
// const has = B.core.set.has([resSet, aResId('A', 7)])
// const comp = compile(has);

// console.log(comp(0 as any));

function testSet() {
    console.log('testing set');
    let atomSet = AtomSet([1]);
    const it = AtomSetIt();

    // it.reset(atomSet);
    // for (const a of it) {
    //     console.log('set', a);
    // }

    it.reset(atomSet);
    for (let a = AtomSetIt.start(it, atomSet); !it.done; a = it.next().value) {
        console.log('set for', a);
    }
    atomSet = AtomSet([2, 3, 4]);
    // it.reset(atomSet);
    // for (const a of it) {
    //     console.log('set m', a);
    // }
    it.reset(atomSet);
    for (let a = AtomSetIt.start(it, atomSet); !it.done; a = it.next().value) {
        console.log('set m for', a);
    }
}
testSet();

function run(model: Model) {

    Model.rings(model);

    // const query = B.Struct.gen(g => g.atomGroups, {
    //     'residue-test': B.operator(o => o.relational.eq, [B.Struct.atomProp(p => p.auth_comp_id), 'ALA']),
    //     'atom-test': B.operator(o => o.set.has, [
    //         B.type(t => t.set, B.argArray([es('C'), es('N')])),
    //         B.Struct.atomProp(p => p.type_symbol)
    //     ]),
    // });
    // const query =  B.struct.generator.atomGroups({
    //     'atom-test': B.core.rel.eq([B.acp('elementSymbol'), B.es('Fe')]),
    // });

    // const lys = B.struct.generator.atomGroups({
    //     'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'LYS']),
    //     'group-by': B.ammp('residueKey')
    // })
      //B.core.rel.eq([B.ammp('auth_comp_id'), 'LYS']);

    //const query = B.evaluate(B.struct.modifier.cluster({
    //     'selection': B.struct.generator.atomGroups({
    //         'residue-test': B.core.rel.eq([B.ammp('auth_comp_id'), 'LYS']),
    //         'group-by': B.ammp('residueKey')
    //     }),
    //     'max-distance': 5
    // }));
    //const l = B.core.type.list;
    // const query = B.struct.filter.isConnectedTo({
    //     0: B.struct.generator.atomGroups({
    //         //'residue-test': B.core.rel.eq([B.ammp('label_comp_id'), 'CYS']),
    //         'atom-test': B.core.rel.eq([B.ammp('id'), 3810]),
    //         'group-by': B.ammp('residueKey')
    //     }),
    //     target: B.struct.generator.atomGroups({
    //         'residue-test': B.core.rel.eq([B.ammp('label_comp_id'), 'HEM']),
    //         'group-by': B.ammp('residueKey')
    //     }),
    // });
    // const query = B.struct.modifier.includeConnected({
    //     0: B.struct.generator.atomGroups({
    //         'residue-test': B.core.rel.eq([B.ammp('label_comp_id'), 'HEM']),
    //         'group-by': B.ammp('residueKey')
    //     }),
    //     'layer-count': 1,
    //     'as-whole-residues': true
    // });
    const query = B.struct.modifier.expandProperty({
        0: B.struct.generator.atomGroups({
            'residue-test': B.core.rel.eq([B.ammp('label_comp_id'), 'HEM']),
            'group-by': B.ammp('residueKey')
        }),
        property: B.atp('connectedComponentKey')
    });

    // const query = B.struct.generator.atomGroups({
    //     'atom-test': B.core.rel.eq([B.ammp('id'), 3810]),
    //     'group-by': B.ammp('residueKey')
    // });
    
    // B.evaluate(B.struct.combinator.distanceCluster({
    //     matrix: l([l([0, 5, 5]), l([0, 0, 5]), l([0, 0, 0])]),
    //     selections: l([lys, lys, lys])
    // }));

    //console.log('check');

    const toTypeCheck =  B.struct.atomSet.reduce({
        initial: B.ammp('B_iso_or_equiv'),
        value: B.core.math.max([
            B.struct.slot.atomSetReduce(),
            B.ammp('B_iso_or_equiv')
        ])
    });

    typeCheck(SymbolMap, toTypeCheck);

    //console.log(formatE(query));

    const compiled = compile(query, 'query');
    const ctx = Context.ofModel(model);
    const res = compiled(ctx);
    console.log('count', AtomSelection.atomSets(res).length);
    if (AtomSelection.atomSets(res).length) console.log('ac', AtomSet.count(AtomSelection.atomSets(res)[0]));
    const cif = mmCIFwriter(model, AtomSelection.getAtomIndices(res));

    console.log(cif.substr(0, 450));
    //console.log(AtomSet.atomIndices(AtomSelection.toAtomSet(res)));
    //console.log(model.entities);
    //console.log(model.chains);
}

fs.readFile('spec/1tqn_updated.cif', 'utf-8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    try {
        const mol = parseCIF(data);
        run(mol.models[0]);
    } catch (e) {
        console.error(e);
        return;
    }
})