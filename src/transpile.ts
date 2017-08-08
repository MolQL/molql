
import Transpiler from './reference-implementation/transpilers/transpiler'
import _transpiler from './reference-implementation/transpilers/all'

const transpiler: {[index: string]: Transpiler} = _transpiler

const util = require('util')

const testStrings: {[index: string]: string[]} = {
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
    'fc.=.1'
  ]
}

function parse(lang: string, str: string) {
  const result = transpiler[lang](str)
  console.log(str)
  console.log(util.inspect(result, {depth: 20, color: true}))
  console.log('\n')
}

const [,,lang, str] = process.argv

if (lang && str) {
  parse(lang, str)
} else if (lang) {
  testStrings[lang].forEach(str => parse(lang, str))
}
