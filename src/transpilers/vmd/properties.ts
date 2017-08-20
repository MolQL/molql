/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { PropertyDict } from '../types'
import B from '../../molql/builder'

// const reFloat = /[-+]?[0-9]*\.?[0-9]+/
const rePosInt = /[0-9]+/

function str(x: string) { return x }
// function listMap(x: string) { return x.split('+') }
// function rangeMap(x: string) {
//   const [min, max] = x.split('-').map(parseInt)
//   return {min, max}
// }
// function listOrRangeMap(x: string) {
//   return x.includes('-') ? rangeMap(x) : listMap(x).map(parseInt)
// }
// function elementListMap(x: string) {
//   return x.split('+').map(B.struct.type.elementSymbol)
// }

const properties: PropertyDict = {
  name: {
    '@desc': 'str    atom name',
    '@examples': ['name CA'],
    regex: /[a-zA-Z+]+/, map: str,
    level: 'atom-test', property: B.ammp('label_atom_id')
  },
  type: {
    '@desc': 'str    atom type',
    '@examples': [''],
    isUnsupported: true,
    regex: /[a-zA-Z+]+/, map: str,
    level: 'atom-test'
  },
  index: {
    '@desc': 'num    the atom number, starting at 0',
    '@examples': ['index 10'],
    regex: rePosInt, map: (x) => (parseInt(x) - 1),
    level: 'atom-test', property: B.acp('elementSymbol')
  },
  serial: {
    '@desc': 'num    the atom number, starting at 1',
    '@examples': ['serial 11'],
    regex: rePosInt, map: parseInt,
    level: 'atom-test', property: B.ammp('id')
  },
  atomicnumber: {
    '@desc': 'num    atomic number (0 if undefined)',
    '@examples': [''],
    isUnsupported: true,
    regex: rePosInt, map: parseInt,
    level: 'atom-test'//, property: B.acp('atomicNumber')
  },
}

export default properties
