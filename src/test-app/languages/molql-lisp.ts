/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Language from './language'
import Transpilers from '../../reference-implementation/transpilers/all'

const lang: Language = {
    name: 'MolQL Lisp',
    editorMode: 'molql-lisp',
    transpiler: Transpilers.molQLlisp,
    examples: [{
        name: 'All C or N atoms in ALA residues',
        value: `(struct.atom-groups
  :residue-test (=
    (atom.auth_comp_id)
    ALA)
  :atom-test (set-has
    (set (struct.create-es C) (struct.create-es N))
    (atom.es)))`
    }, {
        name: 'All residues within 5 ang from Fe atom',
        value: `(struct.include-surroundings
  :selection (struct.atom-groups
    :atom-test (=
      (atom.es)
      (struct.create-es Fe)))
  :radius 5
  :as-whole-residues true)`
    }, {
        name: 'Cluster LYS residues within 5 ang',
        value: `(struct.cluster
  :selection (struct.atom-groups
    :residue-test (eq
      (atom.auth_comp_id)
      LYS)
    :group-by (atom.residue-key))
  :max-distance 5)`
    }, {
        name: 'Residues with max b-factor < 45',
        value: `(struct.pick
  :selection (struct.atom-groups
    :group-by (atom.residue-key))
  :test (<
    (atom-set.reduce
      :initial (atom.B_iso_or_equiv)
      :value (max
        (atom-set.reduce.value)
        (atom.B_iso_or_equiv)))
    35))`
    }]
}

export default lang