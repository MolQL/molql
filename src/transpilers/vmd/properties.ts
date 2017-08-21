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

const properties: PropertyDict = {
  name: {
    '@desc': 'str    atom name',
    '@examples': ['name CA'],
    regex: /[a-zA-Z0-9]+/, map: B.atomName,
    level: 'atom-test', property: B.ammp('label_atom_id')
  },
  type: {
    '@desc': 'str    atom type',
    '@examples': ['type C3'],
    isUnsupported: true,
    regex: /[a-zA-Z0-9]+/, map: str,
    level: 'atom-test'
  },
  index: {
    '@desc': 'num    the atom number, starting at 0',
    '@examples': ['index 10'],
    isNumeric: true,
    regex: rePosInt, map: x => (parseInt(x) - 1),
    level: 'atom-test', property: B.ammp('id')
  },
  serial: {
    '@desc': 'num    the atom number, starting at 1',
    '@examples': ['serial 11'],
    isNumeric: true,
    regex: rePosInt, map: parseInt,
    level: 'atom-test', property: B.ammp('id')
  },
  atomicnumber: {
    '@desc': 'num    atomic number (0 if undefined)',
    '@examples': ['atomicnumber 13'],
    isUnsupported: true,
    isNumeric: true,
    regex: rePosInt, map: parseInt,
    level: 'atom-test'//, property: B.acp('atomicNumber')
  },
  element: {
    '@desc': 'str  atomic element symbol string ("X" if undefined)',
    '@examples': ['element N'],
    regex: /[a-zA-Z0-9]{1,3}/, map: x => B.es(x),
    level: 'atom-test', property: B.acp('elementSymbol')
  },
  altloc: {
    '@desc': 'str  alternate location/conformation identifier',
    '@examples': ['altloc C'],
    regex: /[a-zA-Z0-9]+/, map: str,
    level: 'atom-test', property: B.ammp('label_alt_id')
  },
  chain: {
    '@desc': 'str  the one-character chain identifier',
    '@examples': ['chain A'],
    regex: /[a-zA-Z0-9]+/, map: str,
    level: 'residue-test', property: B.ammp('auth_asym_id')
  },
  residue: {
    '@desc': 'num  a set of connected atoms with the same residue number',
    '@examples': ['residue 11'],
    isNumeric: true,
    regex: rePosInt, map: parseInt,
    level: 'residue-test', property: B.ammp('auth_seq_id')
  },
}

export default properties
