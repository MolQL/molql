
import Expression from './mini-lisp/expression'
import Transpiler from './transpilers/transpiler'
import _transpiler from './transpilers/all'

import * as fs from 'fs'
// import { Model } from './reference-implementation/molecule/data'
import AtomSelection from './reference-implementation/molql/data/atom-selection'
import AtomSet from './reference-implementation/molql/data/atom-set'
import parseCIF from './reference-implementation/molecule/parser'
import compile from './reference-implementation/molql/compiler'
import Context from './reference-implementation/molql/runtime/context'

const transpiler: {[index: string]: Transpiler} = _transpiler

const util = require('util')

const testStrings: {[index: string]: string[]} = {
  jmol: [
    '123',
    '-42',
    '_C',
    '.CA',
    'ALA',
    '%A',
    '^B',
    ':C',
    '/2',
    '10^A:F.CA%C/0',
    '10^A:F.CA%C',
    '10^A:F.CA',
    '10^A:F',
    '10^A',
    '10:F.CA',
    '10/0',
    '32 or 42',
    '.CA/0 OR 42:A',
    '!23',
    'not ASP',
    '(ASP or .CA)',
    'ASP and .CA',
    '123.CA',
    '(1 or 2) and .CA',
    '(1 or 2) and (.CA or .N)',
    '.CA and (2 or 3)',
    '.CA and (2 or 3) and ^A',
    '!32 or :A and .CA'
  ],
  molQLlisp: [
    `
    (atom.sel.atom-groups
      :residue-test (eq
        (atom.auth_comp_id)
        ALA)
      :atom-test (set.has
        (set
          (atom.new.el C)
          (atom.new.el N))
        (atom.el)))
    `
  ],
  pymol: [
    'resi 42',

    '/pept/lig/',
    '/pept/lig/a',
    '/pept/lig/a/10',
    '/pept/lig/a/10/ca',
    '/pept//a/10',

    '10/cb',
    'a/10-12/ca',
    'lig/b/6+8/c+o',
    'pept/enz/c/3/n',
    'pept/enz///n',

    'resi 42 or chain A',
    'not (resi 42 or chain A)',
    '!resi 42 or chain A',

    'b >= 0.3',
    'b != 0.3',
    'b>0.3',
    'b <0.3',
    'b <= 0.3',
    'b = 1',
    'fc.=.1',

    'segi A IN segi B',
    'segi A LIKE segi B',

    'segi A GAP 2',
    'segi A AROUND 2',
    'segi A EXPAND 2',

    'segi A WITHIN 3.01 OF segi B',
    'segi A NEAR_TO 3.01 OF segi B',
    'segi A BEYOND 3.01 OF segi B',

    'BYRES name CA',
    'BYMOLECULE name CA',
    'BYFRAGMENT name CA',
    'BYSEGMENT name CA',
    'BYOBJECT name CA',
    'BYCELL chain A',
    'BYRING name N',
    'NEIGHBOUR resn HOH',
    'BOUND_TO resn CYS',

    'resn ALA EXTEND 2',
    'PEPSEQ FATEW',
    'REP spheres'
  ]
}

function run (query: Expression) {
    const compiled = compile(query);

    fs.readFile('spec/1tqn_updated.cif', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        try {
            const mol = parseCIF(data);
            const ctx = Context.ofModel(mol.models[0]);
            const res = compiled(ctx);
            console.log('count', AtomSelection.atomSets(res).length);
            // const cif = mmCIFwriter(model, AtomSet.atomIndices(AtomSelection.toAtomSet(res)));

            // console.log(cif.substr(0, 100));
            console.log(AtomSet.atomIndices(AtomSelection.toAtomSet(res)));
            //console.log(model.entities);
            //console.log(model.chains);
        } catch (e) {
            console.error(e);
            return;
        }
    })
}

function parse(lang: string, str: string) {
  const query = transpiler[lang](str)
  console.log(str)
  console.log(util.inspect(query, {depth: 20, color: true}))
  console.log('\n')
  return query
}

const [,,lang, str, doRun] = process.argv

if (lang && str) {
  const q = parse(lang, str)
  if(doRun === 't') run(q)
} else if (lang) {
  testStrings[lang].forEach(str => parse(lang, str))
}
