
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
  vmd: []
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
    // console.log(e)
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
