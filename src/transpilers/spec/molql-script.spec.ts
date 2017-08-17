/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import 'jasmine'

import transpiler from '../molql-script/parser'
import compile from '../../reference-implementation/molql/compiler'

describe('molql-script', () => {
    const examples = [{
        name: 'All C or N atoms in ALA residues',
        value: `(atom.sel.atom-groups
  :residue-test (=
    (atom.auth_comp_id)
    ALA)
  :atom-test (set.has
    ;; Element symbols must be "constructed" to be normalized, e.g. Fe vs FE
    (set (atom.new.el C) (atom.new.el N))
    (atom.el)))`
    }, {
        name: 'All residues within 5 ang from Fe atom',
        value: `(atom.sel.include-surroundings
  :selection (atom.sel.atom-groups
    :atom-test (=
      (atom.el)
      (atom.new.el Fe)))
  :radius 5
  :as-whole-residues true)`
    }, {
        name: 'Cluster LYS residues within 5 ang',
        value: `(atom.sel.cluster
  :selection (atom.sel.atom-groups
    :residue-test (eq
      (atom.auth_comp_id)
      LYS)
    :group-by (atom.key.res))
  :max-distance 5)`
    }, {
        name: 'Residues with max b-factor < 45',
        value: `(atom.sel.pick
  :selection (atom.sel.atom-groups
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
  :selection (atom.sel.atom-groups
    :residue-test true
    :group-by (atom.key.res))
    :target (atom.sel.atom-groups
      :residue-test (= (atom.label_comp_id) HEM)
      :group-by (atom.key.res))
  ;; default bond test allows only covalent bonds
  :bond-test true
  :disjunct true)`
    }, {
      name: 'HEM and 2 layers of connected residues',
      value: `(atom.sel.include-connected
  :selection (atom.sel.atom-groups
    :residue-test (= (atom.label_comp_id) HEM)
    :group-by (atom.key.res))
  :bond-test (bond.has-flags (bond.flags metallic covalent))
  :layer-count 2
  :as-whole-residues true)`
    }];

    for (const e of examples) {
        it(e.name, () => {
            // check if it transpiles and compiles/typechecks.
            const expr = transpiler(e.value);
            compile(expr);
        });
    }
});