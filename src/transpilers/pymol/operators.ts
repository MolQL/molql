/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import * as P from 'parsimmon'

import * as h from '../helper'
import { OperatorList } from '../types'
import B from '../../molql/builder'
import Expression from '../../mini-lisp/expression'

const operators: OperatorList = [
  {
    '@desc': 'Selects atoms that are not included in s1.',
    '@examples': ['NOT s1'],
    name: 'not',
    type: h.prefix,
    rule: P.alt(
      P.regex(/NOT/i).skip(P.whitespace),
      P.string('!').skip(P.optWhitespace)
    ),
    map: (op, selection) => h.invertExpr(selection),
  },
  {
    '@desc': 'Selects atoms included in both s1 and s2.',
    '@examples': ['s1 AND s2'],
    name: 'and',
    type: h.binaryLeft,
    rule: h.infixOp(/AND|&/i),
    map: (op, selection, by) => B.struct.modifier.intersectBy({ 0: selection, by })
  },
  {
    '@desc': 'Selects atoms included in either s1 or s2.',
    '@examples': ['s1 OR s2'],
    name: 'or',
    type: h.binaryLeft,
    rule: h.infixOp(/OR|\|/i),
    map: (op, s1, s2) => B.struct.combinator.merge([s1, s2])
  },
  {
    '@desc': 'Selects atoms in s1 whose identifiers name, resi, resn, chain and segi all match atoms in s2.',
    '@examples': ['s1 IN s2'],
    name: 'in',
    type: h.binaryLeft,
    rule: h.infixOp(/IN/i),
    map: (op: string, selection: Expression, source: Expression) => {
      return B.struct.filter.withSameAtomProperties({
        0: selection,
        source,
        property: B.core.str.concat([
          B.ammp('label_atom_id'),
          B.core.type.str([B.ammp('label_seq_id')]),
          B.ammp('label_comp_id'),
          B.ammp('auth_asym_id'),
          B.ammp('label_asym_id')
        ])
      })
    }
  },
  {
    '@desc': 'Selects atoms in s1 whose identifiers name and resi match atoms in s2.',
    '@examples': ['s1 LIKE s2'],
    name: 'like',
    type: h.binaryLeft,
    rule: h.infixOp(/LIKE|l\./i),
    map: (op: string, selection: Expression, source: Expression) => {
      return B.struct.filter.withSameAtomProperties({
        0: selection,
        source,
        property: B.core.str.concat([
          B.ammp('label_atom_id'),
          B.core.type.str([B.ammp('label_seq_id')])
        ])
      })
    }
  },
  {
    '@desc': 'Selects all atoms whose van der Waals radii are separated from the van der Waals radii of s1 by a minimum of X Angstroms.',
    '@examples': ['s1 GAP X'],
    name: 'gap',
    type: h.postfix,
    rule: h.postfixOp(/GAP\s+([-+]?[0-9]*\.?[0-9]+)/i, 1).map(parseFloat),
    map: (distance: number, target: Expression) => {
      return B.struct.filter.within({
        '0': B.struct.generator.atomGroups(),
        target,
        radius: B.core.math.add([distance, 1.4]) // TODO replace by vdw
      })
    }
  },
  {
    '@desc': 'Selects atoms with centers within X Angstroms of the center of any atom ins1.',
    '@examples': ['s1 AROUND X'],
    name: 'around',
    type: h.postfix,
    rule: h.postfixOp(/(AROUND|a\.)\s+([-+]?[0-9]*\.?[0-9]+)/i, 2).map(parseFloat),
    map: (radius: number, target: Expression) => {
      return B.struct.filter.within({
        '0': B.struct.generator.atomGroups(), target, radius
      })
    }
  },
  {
    '@desc': 'Expands s1 by all atoms within X Angstroms of the center of any atom in s1.',
    '@examples': ['s1 EXPAND X'],
    name: 'expand',
    type: h.postfix,
    rule: h.postfixOp(/(EXPAND|x\.)\s+([-+]?[0-9]*\.?[0-9]+)/i, 2).map(parseFloat),
    map: (radius: number, selection: Expression) => {
      return B.struct.modifier.includeSurroundings({ 0: selection, radius })
    }
  },
  {
    '@desc': 'Selects atoms in s1 that are within X Angstroms of any atom in s2.',
    '@examples': ['s1 WITHIN X OF s2'],
    name: 'within',
    type: h.binaryLeft,
    rule: h.ofOp('WITHIN', 'w.'),
    map: (radius: number, selection: Expression, target: Expression) => {
      return B.struct.filter.within({ 0: selection, target, radius })
    }
  },
  {
    '@desc': 'Same as within, but excludes s2 from the selection (and thus is identical to s1 and s2 around X).',
    '@examples': ['s1 NEAR_TO X OF s2'],
    name: 'near_to',
    type: h.binaryLeft,
    rule: h.ofOp('NEAR_TO', 'nto.'),
    map: (radius: number, selection: Expression, target: Expression) => {
      return B.struct.modifier.exceptBy({
        '0': B.struct.filter.within({ '0': selection, target, radius }),
        by: target
      })
    }
  },
  {
    '@desc': 'Selects atoms in s1 that are at least X Anstroms away from s2.',
    '@examples': ['s1 BEYOND X OF s2'],
    name: 'beyond',
    type: h.binaryLeft,
    rule: h.ofOp('BEYOND', 'be.'),
    map: (radius: number, selection: Expression, target: Expression) => {
      return B.struct.modifier.exceptBy({
        '0': B.struct.filter.within({ '0': selection, target, radius, invert: true }),
        by: target
      })
    }
  },
  {
    '@desc': 'Expands selection to complete residues.',
    '@examples': ['BYRESIDUE s1'],
    name: 'byresidue',
    type: h.prefix,
    rule: h.prefixOp(/BYRESIDUE|byresi|byres|br\./i),
    map: (op: string, selection: Expression) => {
      return B.struct.modifier.expandProperty({
        '0': B.struct.modifier.union({ 0: selection }),
        property: B.ammp('residueKey')
      })
    }
  },
  {
    '@desc': 'Completely selects all alpha carbons in all residues covered by a selection.',
    '@examples': ['BYCALPHA s1'],
    name: 'bycalpha',
    type: h.prefix,
    rule: h.prefixOp(/BYCALPHA|bca\./i),
    map: (op: string, selection: Expression) => {
      return B.struct.generator.queryInSelection({
        '0': B.struct.modifier.expandProperty({
          '0': B.struct.modifier.union({ 0: selection }),
          property: B.ammp('residueKey')
        }),
        query: B.struct.generator.atomGroups({
          'atom-test': B.core.rel.eq([
            'CA',
            B.ammp('label_atom_id')
          ])
        })
      })
    }
  },
  {
    '@desc': 'Expands selection to complete molecules.',
    '@examples': ['BYMOLECULE s1'],
    name: 'bymolecule',
    type: h.prefix,
    rule: h.prefixOp(/BYMOLECULE|bymol|bm\./i),
    map: (op: string, selection: Expression) => {
      return B.struct.modifier.expandProperty({
        '0': B.struct.modifier.union({ 0: selection }),
        property: B.atp('connectedComponentKey')
      })
    }
  },
  {
    '@desc': 'Expands selection to complete fragments.',
    '@examples': ['BYFRAGMENT s1'],
    name: 'byfragment',
    isUnsupported: true,
    type: h.prefix,
    rule: h.prefixOp(/BYFRAGMENT|byfrag|bf\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    '@desc': 'Expands selection to complete segments.',
    '@examples': ['BYSEGMENT s1'],
    name: 'bysegment',
    type: h.prefix,
    rule: h.prefixOp(/BYSEGMENT|bysegi|byseg|bs\./i),
    map: (op: string, selection: Expression) => {
      return B.struct.modifier.expandProperty({
        '0': B.struct.modifier.union({ 0: selection }),
        property: B.ammp('chainKey')
      })
    }
  },
  {
    '@desc': 'Expands selection to complete objects.',
    '@examples': ['BYOBJECT s1'],
    name: 'byobject',
    isUnsupported: true,
    type: h.prefix,
    rule: h.prefixOp(/BYOBJECT|byobj|bo\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    '@desc': 'Expands selection to unit cell.',
    '@examples': ['BYCELL s1'],
    name: 'bycell',
    isUnsupported: true,
    type: h.prefix,
    rule: h.prefixOp(/BYCELL/i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    '@desc': 'All rings of size ≤ 7 which have at least one atom in s1.',
    '@examples': ['BYRING s1'],
    name: 'byring',
    type: h.prefix,
    rule: h.prefixOp(/BYRING/i),
    map: (op: string, selection: Expression) => {
      return B.struct.filter.pick({
        '0': B.struct.generator.rings(),
        test: B.core.rel.gr([
          B.struct.atomSet.countQuery([ selection ]), 1
        ])
      })
    }
  },
  {
    '@desc': 'Selects atoms directly bonded to s1, excludes s1.',
    '@examples': ['NEIGHBOUR s1'],
    name: 'neighbour',
    type: h.prefix,
    rule: h.prefixOp(/NEIGHBOUR|nbr\./i),
    map: (op: string, selection: Expression) => {
      return B.struct.modifier.exceptBy({
        '0': B.struct.modifier.includeConnected({
          '0': B.struct.modifier.union({ 0: selection }),
          'bond-test': true
        }),
        by: B.struct.modifier.union({ 0: selection })
      })
    }
  },
  {
    '@desc': 'Selects atoms directly bonded to s1, may include s1.',
    '@examples': ['BOUND_TO s1'],
    name: 'bound_to',
    type: h.prefix,
    rule: h.prefixOp(/BOUND_TO|bto\./i),
    map: (op: string, selection: Expression) => {
      return B.struct.modifier.includeConnected({
        '0': B.struct.modifier.union({ 0: selection })
      })
    }
  },
  {
    '@desc': 'Extends s1 by X bonds connected to atoms in s1.',
    '@examples': ['s1 EXTEND X'],
    name: 'extend',
    type: h.postfix,
    rule: h.postfixOp(/(EXTEND|xt\.)\s+([0-9]+)/i, 2).map(parseInt),
    map: (count: number, selection: Expression) => {
      return B.struct.modifier.includeConnected({
        '0': B.struct.modifier.union({ 0: selection }),
        'layer-count': count
      })
    }
  }
]

export default operators
