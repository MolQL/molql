/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { KeywordDict } from '../types'
import B from '../../molql/builder'

const keywords: KeywordDict = {
  all: {
    '@desc': 'All atoms currently loaded into PyMOL',
    short: '*',
    map: () => B.struct.generator.atomGroups()
  },
  none: {
    '@desc': 'No atoms (empty selection)',
    map: () => B.struct.generator.empty()
  },
  hydro: {
    '@desc': 'All hydrogen atoms currently loaded into PyMOL',
    short: 'h.',
    map: () => B.struct.generator.atomGroups({
      'atom-test': B.core.rel.eq([
        B.acp('elementSymbol'),
        B.struct.type.elementSymbol('H')
      ])
    })
  },
  hetatm: {
    '@desc': 'All atoms loaded from Protein Data Bank HETATM records',
    short: 'het',
    map: () => B.struct.generator.atomGroups({
      'atom-test': B.core.rel.eq([B.ammp('isHet'), true])
    })
  },
  visible: {
    '@desc': 'All atoms in enabled objects with at least one visible representation',
    short: 'v.'
  },
  polymer: {
    '@desc': 'All atoms on the polymer (not het).',
    short: 'pol.',
    map: () => B.struct.generator.atomGroups({
      'atom-test': B.core.rel.eq([B.ammp('isHet'), false])
    })
  },
  backbone: {
    '@desc': 'Polymer backbone atoms (new in PyMOL 1.6.1)',
    short: 'bb.'
  },
  sidechain: {
    '@desc': 'Polymer non-backbone atoms (new in PyMOL 1.6.1)',
    short: 'sc.'
  },
  present: {
    '@desc': 'All atoms with defined coordinates in the current state (used in creating movies)',
    short: 'pr.'
  },
  center: {
    '@desc': 'Pseudo-atom at the center of the scene'
  },
  origin: {
    '@desc': 'Pseudo-atom at the origin of rotation',
  },
  enabled: {
    '@desc': 'All enabled objects or selections from the object list.',
  },
  masked: {
    '@desc': 'All masked atoms.',
    short: 'msk.'
  },
  protected: {
    '@desc': 'All protected atoms.',
    short: 'pr.'
  },
  bonded: {
    '@desc': 'All bonded atoms',
  },
  donors: {
    '@desc': 'All hydrogen bond donor atoms.',
    short: 'don.'
  },
  acceptors: {
    '@desc': 'All hydrogen bond acceptor atoms.',
    short: 'acc.'
  },
  fixed: {
    '@desc': 'All fixed atoms.',
    short: 'fxd.'
  },
  restrained: {
    '@desc': 'All restrained atoms.',
    short: 'rst.'
  },
  organic: {
    '@desc': 'All atoms in non-polymer organic compounds (e.g. ligands, buffers).',
    short: 'org.'
  },
  inorganic: {
    '@desc': 'All non-polymer inorganic atoms/ions.',
    short: 'ino.'
  },
  solvent: {
    '@desc': 'All water molecules.',
    short: 'sol.',
    map: () => B.struct.generator.atomGroups({
      'residue-test': B.core.set.has([
        B.core.type.set(['HOH', 'SOL', 'WAT', 'H2O']),
        B.ammp('label_comp_id')
      ])
    })
  },
  guide: {
    '@desc': 'All protein CA and nucleic acid C4*/C4'
  },
  metals: {
    '@desc': 'All metal atoms (new in PyMOL 1.6.1)'
  }
}

export default keywords
