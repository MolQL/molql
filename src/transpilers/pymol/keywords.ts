
import * as P from 'parsimmon'

import * as h from '../helper'
import B from '../../molql/builder'

interface KeywordSpec {
  '@desc'?: string,
  short?: string
  map: () => any
}

const keywordsSpec: { [k: string]: KeywordSpec } = {
  all: {
    '@desc': 'All atoms currently loaded into PyMOL',
    short: '*',
    map: () => B.struct.generator.atomGroups()
  },
  none: {
    '@desc': 'No atoms (empty selection)',
    short: 'none',
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
    short: 'v.',
    map: h.makeError('VISIBLE keyword not supported')
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
    short: 'bb.',
    map: h.makeError('BACKBONE keyword not supported')
  },
  sidechain: {
    '@desc': 'Polymer non-backbone atoms (new in PyMOL 1.6.1)',
    short: 'sc.',
    map: h.makeError('SIDECHAIN keyword not supported')
  },
  present: {
    '@desc': 'All atoms with defined coordinates in the current state (used in creating movies)',
    short: 'pr.',
    map: h.makeError('PRESENT keyword not supported')
  },
  center: {
    '@desc': 'Pseudo-atom at the center of the scene',
    map: h.makeError('CENTER keyword not supported')
  },
  origin: {
    '@desc': 'Pseudo-atom at the origin of rotation',
    map: h.makeError('ORIGIN keyword not supported')
  },
  enabled: {
    '@desc': 'All enabled objects or selections from the object list.',
    map: h.makeError('ENABLED keyword not supported')
  },
  masked: {
    '@desc': 'All masked atoms.',
    short: 'msk.',
    map: h.makeError('MASKED keyword not supported')
  },
  protected: {
    '@desc': 'All protected atoms.',
    short: 'pr.',
    map: h.makeError('PROTECTED keyword not supported')
  },
  bonded: {
    '@desc': 'All bonded atoms',
    map: h.makeError('BONDED keyword not supported')
  },
  donors: {
    '@desc': 'All hydrogen bond donor atoms.',
    short: 'don.',
    map: h.makeError('DONORS keyword not supported')
  },
  acceptors: {
    '@desc': 'All hydrogen bond acceptor atoms.',
    short: 'acc.',
    map: h.makeError('ACCEPTORS keyword not supported')
  },
  fixed: {
    '@desc': 'All fixed atoms.',
    short: 'fxd.',
    map: h.makeError('FIXED keyword not supported')
  },
  restrained: {
    '@desc': 'All restrained atoms.',
    short: 'rst.',
    map: h.makeError('RESTRAINED keyword not supported')
  },
  organic: {
    '@desc': 'All atoms in non-polymer organic compounds (e.g. ligands, buffers).',
    short: 'org.',
    map: h.makeError('ORGANIC keyword not supported')
  },
  inorganic: {
    '@desc': 'All non-polymer inorganic atoms/ions.',
    short: 'ino.',
    map: h.makeError('INORGANIC keyword not supported')
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
    '@desc': 'All protein CA and nucleic acid C4*/C4',
    map: h.makeError('GUIDE keyword not supported')
  },
  metals: {
    '@desc': 'All metal atoms (new in PyMOL 1.6.1)',
    map: h.makeError('METALS keyword not supported')
  }
}

const keywordsList: P.Parser<any>[] = []
Object.keys(keywordsSpec).forEach( name => {
  const ks = keywordsSpec[name]
  const reStr = ks.short ? `${name}|${h.escapeRegExp(ks.short)}` : `${name}`
  const rule = P.regex(RegExp(reStr, 'i')).map(ks.map)
  keywordsList.push(rule)
})

export {
  keywordsList
}
