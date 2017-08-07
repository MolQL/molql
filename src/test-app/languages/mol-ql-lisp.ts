/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

import Language from './language'
import transpiler from '../../reference-implementation/transpilers/mol-ql-lisp/parser'

const lang: Language = {
    name: 'MolQL Lisp',
    editorMode: 'lisp',
    transpiler,
    examples: [{
        name: 'Example 1',
        value: `
(structure.generator.atom-groups
  :residue-test (core.rel.eq
    (structure.atom-property.macromolecular.auth_comp_id)
    ALA)
  :atom-test (core.set.has
    (core.type.set
      (structure.type.element-symbol C)
      (structure.type.element-symbol N))
    (structure.atom-property.core.element-symbol)))`
    }, {
        name: 'Example 2',
        value: `
(atomGroups
  :residue-test (eq
    (mmcif.auth_comp_id)
    ALA)
  :atom-test (set.has
    (make.set
      (make.elementSymbol C)
      (make.elementSymbol N))
    (elementSymbol)))`
    }]
}

export default lang