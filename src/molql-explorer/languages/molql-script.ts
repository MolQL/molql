/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import Language from './language'
import Transpilers from '../../transpilers/all'

const lang: Language = {
    name: 'MolQL Script',
    editorMode: 'molql-script',
    transpiler: Transpilers.molQLscript,
    examples: [{
        name: 'All C or N atoms in ALA residues',
        value: `(atom.sel.atom-groups
  :residue-test (= atom.auth_comp_id ALA)
  :atom-test (set.has (set _C _N) atom.el))`
    }, {
        name: 'All residues within 5 ang from Fe atom',
        value: `(atom.sel.include-surroundings
  (atom.sel.atom-groups
    :atom-test (=
      (atom.el)
      (atom.new.el Fe)))
  :radius 5
  :as-whole-residues true)`
    }, {
        name: 'Cluster LYS residues within 5 ang',
        value: `(atom.sel.cluster
  (atom.sel.res (= atom.label_comp_id LYS))
  :max-distance 5)`
    }, {
        name: 'Residues with max b-factor < 45',
        value: `(atom.sel.pick
  (atom.sel.atom-groups
    :group-by (atom.key.res))
  :test (<
    (atom.set.reduce
      :initial (atom.B_iso_or_equiv)
      :value (max
        (atom.set.reduce.value)
        (atom.B_iso_or_equiv)))
    35))`
    }, {
      name: 'Residues connected to HEM',
      value: `(atom.sel.is-connected-to
  (atom.sel.atom-groups
    :residue-test true
    :group-by (atom.key.res))
  :target (atom.sel.res (= atom.label_comp_id HEM))
  ;; default bond test allows only covalent bonds
  :bond-test true
  :disjunct true)`
    }, {
      name: 'HEM and 2 layers of connected residues',
      value: `(atom.sel.include-connected
  (atom.sel.res (= atom.label_comp_id HEM))
  ;; default bond test allows only covalent bonds
  ;; another option is to use :bond-test true to allow any connection
  :bond-test (bond.has-flags (bond.flags metallic covalent))
  :layer-count 2
  :as-whole-residues true)`
    }, {
      name: 'All rings',
      value: `(atom.sel.rings)`
    }, {
      name: 'CCCCN and CCNCN rings',
      value: `(atom.sel.rings
  (atom.ringfp _C _N _C _N _C)
  ;; the "rotation" of element symbols has no effect
  ;; the following is the same as (atom.ringfp _C _C _C _C _N)
  (atom.ringfp _C _C _C _N _C))`
    }]
}

export default lang