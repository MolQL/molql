/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import * as h from '../helper'
import { KeywordDict } from '../types'
import B from '../../molql/builder'

function proteinExpr() {
  return B.struct.filter.pick({
    selection: B.struct.generator.atomGroups({
      'group-by': B.ammp('residueKey')
    }),
    test: B.core.set.isSubset([
      B.core.type.set([ 'C', 'N', 'CA', 'O' ]),
      B.struct.atomSet.propertySet({
        property: B.ammp('label_atom_id')
      })
    ])
  })
}

const keywords: KeywordDict = {
  all: {
    '@desc': 'everything',
    map: () => B.struct.generator.atomGroups()
  },
  none: {
    '@desc': 'nothing',
    map: () => B.struct.generator.empty()
  },
  protein: {
    '@desc': 'a residue with atoms named C, N, CA, and O',
    map: proteinExpr
  },
  nucleic: {
    '@desc': "a residue with atoms named P, O1P, O2P and either O3', C3', C4', C5', O5' or O3*, C3*, C4*, C5*, O5*. This definition assumes that the base is phosphorylated, an assumption which will be corrected in the future."
  },
  backbone: {
    '@desc': 'the C, N, CA, and O atoms of a protein and the equivalent atoms in a nucleic acid.'
  },
  sidechain: {
    '@desc': 'non-backbone atoms and bonds'
  },
  water: {
    '@desc': 'all atoms with the resname H2O, HH0, OHH, HOH, OH2, SOL, WAT, TIP, TIP2, TIP3 or TIP4',
    short: 'waters'
  },
  at: {
    '@desc': 'residues named ADA A THY T'
  },
  acidic: {
    '@desc': 'residues named ASP GLU'
  },
  acyclic: {
    '@desc': '`protein and not cyclic`'
  },
  aliphatic : {
    '@desc': 'residues named ALA GLY ILE LEU VAL'
  },
  alpha: {
    '@desc': "atom's residue is an alpha helix"
  },
  amino: {
    '@desc': 'a residue with atoms named C, N, CA, and O',
    map: proteinExpr
  },
  aromatic: {
    '@desc': 'residues named HIS PHE TRP TYR'
  },
  basic: {
    '@desc': 'residues named ARG HIS LYS'
  },
  bonded: {
    '@desc': 'atoms for which numbonds > 0'
  },
  buried: {
    '@desc': 'residues named ALA LEU VAL ILE PHE CYS MET TRP'
  },
  cg: {
    '@desc': 'residues named CYT C GUA G'
  },
  charged: {
    '@desc': '`basic or acidic`'
  },
  cyclic: {
    '@desc': 'residues named HIS PHE PRO TRP TYR'
  },

  hetero: {
    '@desc': '`not (protein or nucleic)`',
    map: () => h.invertExpr('todo', proteinExpr())
  },
  hydrogen: {
    '@desc': 'name "[0-9]?H.*"'
  },
  large: {
    '@desc': '`protein and not (small or medium)`'
  },
  medium : {
    '@desc': 'residues named VAL THR ASP ASN PRO CYS ASX PCA HYP'
  },
  neutral: {
    '@desc': 'residues named VAL PHE GLN TYR HIS CYS MET TRP ASX GLX PCA HYP'
  },
  polar: {
    '@desc': '`protein and not hydrophobic`'
  },
  purine: {
    '@desc': 'residues named ADE A GUA G'
  },
  pyrimidine: {
    '@desc': 'residues named CYT C THY T URI U'
  },
  small: {
    '@desc': 'residues named ALA GLY SER'
  },
  surface: {
    '@desc': '`protein and not buried`'
  },
  alpha_helix: {
    '@desc': "atom's residue is in an alpha helix"
  },
  pi_helix: {
    '@desc': "atom's residue is in a pi helix"
  },
  helix_3_10: {
    '@desc': "atom's residue is in a 3-10 helix"
  },
  helix: {
    '@desc': "atom's residue is in an alpha or pi or 3-10 helix"
  },
  extended_beta: {
    '@desc': "atom's residue is a beta sheet"
  },
  bridge_beta: {
    '@desc': "atom's residue is a beta sheet"
  },
  sheet: {
    '@desc': "atom's residue is a beta sheet"
  },
  turn: {
    '@desc': "atom's residue is in a turn conformation"
  },
  coil: {
    '@desc': "atom's residue is in a coil conformation"
  }
}

export default keywords
