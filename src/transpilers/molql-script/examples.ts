/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 */

export default [{
    name: 'All C or N atoms in ALA residues',
    value: `(sel.atom.atom-groups
  :residue-test (= atom.auth_comp_id ALA)
  :atom-test (set.has (set _C _N) atom.el))`
}, {
    name: 'Atoms named C N CA',
    value: `;; The . in front of the names indicates that the value is
;; an "AtomName" (fancy way of saying that case does not matter).
(sel.atom.atoms (set.has (set .C .N .CA) atom.name))`
}, {
    name: 'Residues 130 to 180',
    value: `(sel.atom.res (in-range atom.resno 130 180))`
}, {
    name: 'All residues within 5 ang from Fe atom',
    value: `(sel.atom.include-surroundings
  (sel.atom.atoms (= atom.el _Fe))
  :radius 5
  :as-whole-residues true)`
}, {
    name: 'Cluster LYS residues within 5 ang',
    value: `(sel.atom.cluster
  (sel.atom.res (= atom.label_comp_id LYS))
  :max-distance 5)`
}, {
    name: 'Residues with max b-factor < 45',
    value: `(sel.atom.pick
  (sel.atom.atom-groups
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
    value: `(sel.atom.is-connected-to
  (sel.atom.atom-groups
    :residue-test true
    :group-by (atom.key.res))
    :target (sel.atom.res (= atom.label_comp_id HEM))
  ;; default bond test allows only covalent bonds
  :bond-test true
  :disjunct true)`
}, {
    name: 'HEM and 2 layers of connected residues',
    value: `(sel.atom.include-connected
  (sel.atom.atom-groups
    :residue-test (= (atom.label_comp_id) HEM)
    :group-by (atom.key.res))
  :bond-test (bond.is metallic covalent)
  :layer-count 2
  :as-whole-residues true)`
}];