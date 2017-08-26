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
//   const [min, max] = x.split('-').map(x => parseInt(x))
//   return {min, max}
// }
// function listOrRangeMap(x: string) {
//   return x.includes('-') ? rangeMap(x) : listMap(x).map(x => parseInt(x))
// }
// function elementListMap(x: string) {
//   return x.split('+').map(B.struct.type.elementSymbol)
// }

const properties: PropertyDict = {
  adpmax: {
    '@desc': 'the maximum anisotropic displacement parameter for the selected atom',
    '@examples': [''],
    isUnsupported: true,
    regex: reFloat, map: x => parseFloat(x),
    level: 'atom-test'
  },
  adpmin: {
    '@desc': 'the minimum anisotropic displacement parameter for the selected atom',
    '@examples': [''],
    isUnsupported: true,
    regex: reFloat, map: x => parseFloat(x),
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
    regex: rePosInt, map: x => parseInt(x),
    level: 'atom-test'
  },
  atomIndex: {
    '@desc': 'atom 0-based index; a unique number for each atom regardless of the number of models loaded',
    '@examples': [''],
    isUnsupported: true,
    regex: rePosInt, map: x => parseInt(x),
    level: 'atom-test'
  },
  atomName: {
    '@desc': 'atom name',
    '@examples': [''],
    regex: /[a-zA-Z0-9]+/, map: v => B.atomName(v),
    level: 'atom-test', property: B.ammp('label_atom_id')
  },
  atomno: {
    '@desc': 'sequential number; you can use "@" instead of "atomno=" -- for example, select @33 or Var x = @33 or @35',
    '@examples': [''],
    isUnsupported: true,
    regex: rePosInt, map: x => parseInt(x),
    level: 'atom-test'
  },
  atomType: {
    '@desc': 'atom type (mol2, AMBER files) or atom name (other file types)',
    '@examples': [''],
    regex: /[a-zA-Z0-9]+/, map: v => B.atomName(v),
    level: 'atom-test', property: B.ammp('label_atom_id')
  },
  atomX: {
    '@desc': 'Cartesian X coordinate (or just X)',
    '@examples': [''],
    isNumeric: true,
    regex: reFloat, map: x => parseFloat(x),
    level: 'atom-test', property: B.acp('x')
  },
  atomY: {
    '@desc': 'Cartesian Y coordinate (or just Y)',
    '@examples': [''],
    isNumeric: true,
    regex: reFloat, map: x => parseFloat(x),
    level: 'atom-test', property: B.acp('y')
  },
  atomZ: {
    '@desc': 'Cartesian Z coordinate (or just Z',
    '@examples': [''],
    isNumeric: true,
    regex: reFloat, map: x => parseFloat(x),
    level: 'atom-test', property: B.acp('z')
  },
  bondcount: {
    '@desc': 'covalent bond count',
    '@examples': ['bondcount = 0'],
    isNumeric: true,
    regex: rePosInt, map: x => parseInt(x),
    level: 'atom-test', property: B.acp('bondCount')
  },
  bondingRadius: {
    '@desc': 'radius used for auto bonding; synonymous with ionic and ionicRadius',
    '@examples': [''],
    isUnsupported: true,
    regex: reFloat, map: x => parseFloat(x),
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
    regex: rePosInt, map: x => parseInt(x),
    level: 'atom-test'
  },
  chain: {
    '@desc': 'protein chain. For newer CIF files allowing multicharacter chain specifications, use quotations marks: select chain="AA". For these multicharacter desigations, case is not checked unless the CIF file has lower-case chain designations.',
    '@examples': [''],
    regex: /[a-zA-Z0-9]+/, map: str,
    level: 'chain-test', property: B.ammp('auth_asym_id')
  },


  // TODO
  chainNo: {
    '@desc': 'chain number; sequentially counted from 1 for each model; chainNo == 0 means"no chain" or PDB chain identifier indicated as a blank (Jmol 14.0).',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  color: {
    '@desc': 'the atom color',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  covalentRadius: {
    '@desc': 'covalent bonding radius, synonymous with covalent. Not used by Jmol, but could be used, for example, in {*}.spacefill={*}.covalentRadius.all.',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  cs: {
    '@desc': 'chemical shift calculated using computational results that include magnetic shielding tensors.',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  element: {
    '@desc': 'element symbol. The value of this parameter depends upon the context. Used with select structure=x, x can be either the quoted element symbol, "H", "He", "Li", etc. or atomic number. In all other contexts, the value is the element symbol. When the atom is a specific isotope, the string will contain the isotope number -- "13C", for example.',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  elemno: {
    '@desc': 'atomic element number',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  eta: {
    '@desc': 'Based on Carlos M. Duarte, Leven M. Wadley, and Anna Marie Pyle, RNA structure comparison, motif search and discovery using a reduced representation of RNA conformational space, Nucleic Acids Research, 2003, Vol. 31, No. 16 4755-4761. The parameter eta is the C4\'[i-1]-P[i]-C4\'[i]-P[i+1] dihedral angle; theta is the P[i]-C4\'[i]-P[i+1]-C4\'[i+1] dihedral angle. Both are measured on a 0-360 degree scale because they are commonly near 180 degrees. Using the commands plot PROPERTIES eta theta resno; select visible;wireframe only one can create these authors\' "RNA worm" graph.',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  theta: {
    '@desc': 'Based on Carlos M. Duarte, Leven M. Wadley, and Anna Marie Pyle, RNA structure comparison, motif search and discovery using a reduced representation of RNA conformational space, Nucleic Acids Research, 2003, Vol. 31, No. 16 4755-4761. The parameter eta is the C4\'[i-1]-P[i]-C4\'[i]-P[i+1] dihedral angle; theta is the P[i]-C4\'[i]-P[i+1]-C4\'[i+1] dihedral angle. Both are measured on a 0-360 degree scale because they are commonly near 180 degrees. Using the commands plot PROPERTIES eta theta resno; select visible;wireframe only one can create these authors\' "RNA worm" graph.',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  file: {
    '@desc': 'file number containing this atom',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  formalCharge: {
    '@desc': 'formal charge',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  format: {
    '@desc': 'format (label) of the atom.',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  fXyz: {
    '@desc': 'fractional XYZ coordinates',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  fX: {
    '@desc': 'fractional X coordinate',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  fY: {
    '@desc': 'fractional Y coordinate',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  fZ: {
    '@desc': 'fractional Z coordinate',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  fuxyz: {
    '@desc': 'fractional XYZ coordinates in the unitcell coordinate system',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  fux: {
    '@desc': 'fractional X coordinate in the unitcell coordinate system',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  fuy: {
    '@desc': 'fractional Y coordinate in the unitcell coordinate system',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  fuz: {
    '@desc': 'fractional Z coordinate in the unit cell coordinate system',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  group: {
    '@desc': '3-letter residue code',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  group1: {
    '@desc': 'single-letter residue code (amino acids only)',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
  groupID: {
    '@desc': 'group ID number: A unique ID for each amino acid or nucleic acid residue in a PDB file. 0  noGroup 1-5  ALA, ARG, ASN, ASP, CYS 6-10  GLN, GLU, GLY, HIS, ILE 11-15  LEU, LYS, MET, PHE, PRO 16-20  SER, THR, TRP, TYR, VAL 21-23  ASX, GLX, UNK 24-29  A, +A, G, +G, I, +I 30-35  C, +C, T, +T, U, +U Additional unique numbers are assigned arbitrarily by Jmol and cannot be used reproducibly.',
    '@examples': [''],
    isUnsupported: true,
    regex: /[0-9\s{}-]+/, map: str,
    level: 'atom-test'
  },
}

export default properties
