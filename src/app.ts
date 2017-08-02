/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import * as fs from 'fs'
import { Model } from './reference-implementation/molecule/data'
import AtomSelection from './reference-implementation/mol-ql/data/atom-selection'
import AtomSet from './reference-implementation/mol-ql/data/atom-set'
import parseCIF from './reference-implementation/molecule/parser'
import compile from './reference-implementation/mol-ql/compiler'
import mmCIFwriter from './reference-implementation/molecule/writer'
import Context from './reference-implementation/mol-ql/runtime/context'
import B from './mol-ql/builder'


function run(model: Model) {

    const es = (s: string) => B.Struct.type(c => c.elementSymbol, [s])

    // const query = B.Struct.gen(g => g.atomGroups, {
    //     'residue-test': B.operator(o => o.relational.eq, [B.Struct.atomProp(p => p.auth_comp_id), 'ALA']),
    //     'atom-test': B.operator(o => o.set.has, [
    //         B.type(t => t.set, B.argArray([es('C'), es('N')])),
    //         B.Struct.atomProp(p => p.type_symbol)
    //     ]),
    // });
    const query =  B.Struct.gen(g => g.atomGroups, {
        'atom-test': B.operator(o => o.relational.eq, [B.Struct.atomProp(p => p.type_symbol), es('Fe')]),
    });

    const compiled = compile(query);
    const ctx = Context.ofModel(model);
    const res = compiled(ctx);
    const cif = mmCIFwriter(model, AtomSet.atomIndices(AtomSelection.toAtomSet(res)));

    console.log(cif.substr(0, 100));
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
        run(mol.models[0]);
    } catch (e) {
        console.error(e);
        return;
    }
})