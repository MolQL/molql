
import Expression from './mini-lisp/expression'
import Transpiler from './transpilers/transpiler'
import _transpiler from './transpilers/all'

import * as fs from 'fs'
// import { Model } from './reference-implementation/structure/data'
import AtomSelection from './reference-implementation/molql/data/atom-selection'
import parseCIF from './reference-implementation/structure/parser'
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
  molQLscript: [],
  pymol: [],
  vmd: [
    'name CA',
    'resid 35',
    'name CA and resname ALA',
    'backbone',
    'not protein',
    'protein (backbone or name H)',
    "name 'A 1'",
    "name 'A *'",
    'name "C.*"',
    'mass < 5',
    'numbonds = 2',
    'abs(charge) > 1',
    'x < 6 and x > 3',
    'sqr(x-5)+sqr(y+4)+sqr(z) > sqr(5)',
    'within 5 of name FE',
    'protein within 5 of nucleic',
    'same resname as (protein within 5 of nucleic)',
    'protein sequence "C..C"',
    'name eq $atomname',
    'protein and @myselection'
  ]
}

function run (query: Expression) {
  const compiled = compile(query, 'query');

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
      console.log(AtomSelection.getAtomIndices(res));
      //console.log(model.entities);
      //console.log(model.chains);
    } catch (e) {
      console.error(e);
      return;
    }
  })
}

function parse(lang: string, str: string) {
  try {
    const query = transpiler[lang](str)
    console.log(str)
    console.log(util.inspect(query, {depth: 20, color: true}))
    console.log('\n')
    return query
  } catch (e) {
    console.log(str)
    console.log(e.message)
    console.log(e)
    console.log('\n')
  }
}

const [,,lang, str, doRun] = process.argv

if (lang && str) {
  const q = parse(lang, str)
  if(doRun === 't' && q) run(q)
} else if (lang) {
  testStrings[lang].forEach(str => parse(lang, str))
}
