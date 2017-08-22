/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { KeywordDict } from '../types'
import B from '../../molql/builder'

const keywords: KeywordDict = {
  // general terms
  all: {
    '@desc': 'all atoms; same as *',
    abbr: ['*'],
    map: () => B.struct.generator.atomGroups()
  },
  bonded: {
    '@desc': 'covalently bonded',
    map: () => B.struct.generator.atomGroups({
      'atom-test': B.core.rel.gr([B.struct.atomProperty.core.bondCount({
        flags: B.struct.type.bondFlags(['covalent', 'metallic', 'sulfide'])
      }), 0])
    })
  },
  clickable: {
    '@desc': 'actually visible -- having some visible aspect such as wireframe, spacefill, or a label showing, or the alpha-carbon or phosphorus atom in a biomolecule that is rendered with only cartoon, rocket, or other biomolecule-specific shape.'
  },
  connected: {
    '@desc': 'bonded in any way, including hydrogen bonds',
    map: () => B.struct.generator.atomGroups({
      'atom-test': B.core.rel.gr([B.struct.atomProperty.core.bondCount({
        flags: B.struct.type.bondFlags()
      }), 0])
    })
  },
  displayed: {
    '@desc': 'displayed using the display or hide command; not necessarily visible'
  },
  hidden: {
    '@desc': 'hidden using the display or hide command'
  },
  none: {
    '@desc': 'no atoms',
    map: () => B.struct.generator.empty()
  },
  selected: {
    '@desc': 'atoms that have been selected; defaults to all when a file is first loaded'
  },
  thisModel: {
    '@desc': 'atoms in the current frame set, as defined by frame, model, or animation commands. If more than one model is in this set, "thisModel" refers to all of them, regardless of atom displayed/hidden status.'
  },
  visible: {
    '@desc': 'visible in any way, including PDB residue atoms for which a cartoon or other such rendering makes their group visible, even if they themselves are not visible.'
  }
}

export default keywords
