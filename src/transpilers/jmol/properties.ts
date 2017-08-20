/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { PropertyDict } from '../types'
import B from '../../molql/builder'

const reFloat = /[-+]?[0-9]*\.?[0-9]+/
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
  adpmax: {
    '@desc': 'the maximum anisotropic displacement parameter for the selected atom',
    '@examples': [''],
    isUnsupported: true,
    regex: reFloat, map: parseFloat,
    level: 'atom-test'
  },
  adpmin: {
    '@desc': 'the minimum anisotropic displacement parameter for the selected atom',
    '@examples': [''],
    isUnsupported: true,
    regex: reFloat, map: parseFloat,
    level: 'atom-test'
  },
  altloc: {
    '@desc': 'PDB alternate location identifier',
    '@examples': [''],
    regex: /[a-zA-Z0-9]/, map: str,
    level: 'atom-test', property: B.ammp('label_alt_id')
  },
  altname: {
    '@desc': 'an alternative name given to atoms by some file readers (for example, P2N)',
    '@examples': [''],
    isUnsupported: true,
    regex: /[a-zA-Z0-9]/, map: str,
    level: 'atom-test'
  },
  atomID: {
    '@desc': 'special atom IDs for PDB atoms assigned by Jmol',
    '@examples': [''],
    isUnsupported: true,
    regex: rePosInt, map: parseInt,
    level: 'atom-test'
  },
  atomIndex: {
    '@desc': 'atom 0-based index; a unique number for each atom regardless of the number of models loaded',
    '@examples': [''],
    isUnsupported: true,
    regex: rePosInt, map: parseInt,
    level: 'atom-test'
  },
  atomName: {
    '@desc': 'atom name',
    '@examples': [''],
    regex: /[a-zA-Z0-9]+/, map: str,
    level: 'atom-test', property: B.ammp('label_atom_id')
  },
  atomno: {
    '@desc': 'sequential number; you can use "@" instead of "atomno=" -- for example, select @33 or Var x = @33 or @35',
    '@examples': [''],
    isUnsupported: true,
    regex: rePosInt, map: parseInt,
    level: 'atom-test'
  },
  atomType: {
    '@desc': 'atom type (mol2, AMBER files) or atom name (other file types)',
    '@examples': [''],
    regex: /[a-zA-Z0-9]+/, map: str,
    level: 'atom-test', property: B.ammp('label_atom_id')
  },
  atomX: {
    '@desc': 'Cartesian X coordinate (or just X)',
    '@examples': [''],
    isNumeric: true,
    regex: reFloat, map: parseFloat,
    level: 'atom-test', property: B.acp('x')
  },
  atomY: {
    '@desc': 'Cartesian Y coordinate (or just Y)',
    '@examples': [''],
    isNumeric: true,
    regex: reFloat, map: parseFloat,
    level: 'atom-test', property: B.acp('y')
  },
  atomZ: {
    '@desc': 'Cartesian Z coordinate (or just Z',
    '@examples': [''],
    isNumeric: true,
    regex: reFloat, map: parseFloat,
    level: 'atom-test', property: B.acp('z')
  },
  bondcount: {
    '@desc': 'covalent bond count',
    '@examples': ['bondcount = 0'],
    isNumeric: true,
    regex: rePosInt, map: parseInt,
    level: 'atom-test', property: B.acp('bondCount')
  },
  bondingRadius: {
    '@desc': 'radius used for auto bonding; synonymous with ionic and ionicRadius',
    '@examples': [''],
    isUnsupported: true,
    regex: reFloat, map: parseFloat,
    level: 'atom-test'
  },
  cell: {
    '@desc': 'crystallographic unit cell, expressed either in lattice integer notation (111-999) or as a coordinate in ijk space, where {1 1 1} is the same as 555. ANDing two cells, for example select cell=555 and cell=556, selects the atoms on the common face. (Note: in the specifc case of CELL, only "=" is allowed as a comparator.)',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  configuration: {
    '@desc': 'Only in the context {configuration=n}, this option selects the set of atoms with either no ALTLOC specified or those atoms having this index into the array of altlocs within its model. So, for example, if the model has altloc "A" and "B", select configuration=1 is equivalent to select altloc="" or altloc="A", and print {configuration=2} is equivalent to print {altloc="" or altloc="B"}. Configuration 0 is "all atoms in a model having configurations", and an invalid configuration number gives no atoms. (Note: in the specifc case of CONFIGURATION, only "=" is allowed as a comparator.)',
    '@examples': [''],
    isUnsupported: true,
    regex: rePosInt, map: parseInt,
    level: 'atom-test'
  },
  chain: {
    '@desc': 'protein chain. For newer CIF files allowing multicharacter chain specifications, use quotations marks: select chain="AA". For these multicharacter desigations, case is not checked unless the CIF file has lower-case chain designations.',
    '@examples': [''],
    regex: /[a-zA-Z0-9]+/, map: str,
    level: 'chain-test', property: B.ammp('auth_asym_id')
  }
}

export default properties
