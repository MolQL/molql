
import * as P from 'parsimmon'

import * as h from '../helper'
import B from '../../molql/builder'
import Expression from '../../mini-lisp/expression'

const Q = h.QueryBuilder

function ofOp (name: string, short?: string) {
  const op = short ? `${name}|${h.escapeRegExp(short)}` : name
  const re = RegExp(`(${op})\\s+([-+]?[0-9]*\\.?[0-9]+)\\s+OF`, 'i')
  return h.infixOp(re, 2).map(parseFloat)
}

const opList = [
  {
    '@desc': 'Selects atoms that are not included in s1. NOT s1',
    name: 'not',
    type: h.prefix,
    rule: P.alt(
      P.regex(/NOT/i).skip(P.whitespace),
      P.string('!').skip(P.optWhitespace)
    ),
    map: Q.invert
  },
  {
    '@desc': 'Selects atoms included in both s1 and s2. s1 AND s2',
    name: 'and',
    type: h.binaryLeft,
    rule: h.infixOp(/AND|&/i),
    map: Q.intersect
  },
  {
    '@desc': 'Selects atoms included in either s1 or s2. s1 OR s2',
    name: 'or',
    type: h.binaryLeft,
    rule: h.infixOp(/OR|\|/i),
    map: Q.merge
  },
  {
    '@desc': 'Selects atoms in s1 whose identifiers name, resi, resn, chain and segi all match atoms in s2. s1 IN s2',
    name: 'in',
    type: h.binaryLeft,
    rule: h.infixOp(/IN/i),
    map: (op: string, selection: Expression, source: Expression) => {
      return B.struct.filter.withSameAtomProperties({
        selection,
        source,
        property: B.core.str.concat([
          B.ammp('label_atom_id'),
          B.core.type.str([B.ammp('label_seq_id')]),
          B.ammp('label_comp_id'),
          B.ammp('label_asym_id')
        ])
      })
    }
  },
  {
    '@desc': 'Selects atoms in s1 whose identifiers name and resi match atoms in s2. s1 LIKE s2',
    name: 'like',
    type: h.binaryLeft,
    rule: h.infixOp(/LIKE|l\./i),
    map: (op: string, selection: Expression, source: Expression) => {
      return B.struct.filter.withSameAtomProperties({
        selection,
        source,
        property: B.core.str.concat([
          B.ammp('label_atom_id'),
          B.core.type.str([B.ammp('label_seq_id')])
        ])
      })
    }
  },
  {
    '@desc': 'Selects all atoms whose van der Waals radii are separated from the van der Waals radii of s1 by a minimum of X Angstroms. s1 GAP X',
    name: 'gap',
    type: h.postfix,
    rule: h.postfixOp(/GAP\s+([-+]?[0-9]*\.?[0-9]+)/i, 1).map(parseFloat),
    map: (distance: number, target: Expression) => {
      return B.struct.filter.within({
        selection: B.struct.generator.atomGroups(),
        target,
        radius: B.core.math.add([distance, 1.4]) // TODO replace by vdw
      })
    }
  },
  {
    '@desc': 'Selects atoms with centers within X Angstroms of the center of any atom ins1. s1 AROUND X',
    name: 'around',
    type: h.postfix,
    rule: h.postfixOp(/(AROUND|a\.)\s+([-+]?[0-9]*\.?[0-9]+)/i, 2).map(parseFloat),
    map: (radius: number, target: Expression) => {
      return B.struct.filter.within({
        selection: B.struct.generator.atomGroups(), target, radius
      })
    }
  },
  {
    '@desc': 'Expands s1 by all atoms within X Angstroms of the center of any atom in s1. s1 EXPAND X',
    name: 'expand',
    type: h.postfix,
    rule: h.postfixOp(/(EXPAND|x\.)\s+([-+]?[0-9]*\.?[0-9]+)/i, 2).map(parseFloat),
    map: (radius: number, selection: Expression) => {
      return B.struct.modifier.includeSurroundings({ selection, radius })
    }
  },
  {
    '@desc': 'Selects atoms in s1 that are within X Angstroms of any atom in s2. s1 WITHIN X OF s2',
    name: 'within',
    type: h.binaryLeft,
    rule: ofOp('WITHIN', 'w.'),
    map: (radius: number, selection: Expression, target: Expression) => {
      return B.struct.filter.within({ selection, target, radius })
    }
  },
  {
    '@desc': 'Same as within, but excludes s2 from the selection (and thus is identical to s1 and s2 around X). s1 NEAR_TO X OF s2',
    name: 'near_to',
    type: h.binaryLeft,
    rule: ofOp('NEAR_TO', 'nto.'),
    map: (radius: number, selection: Expression, target: Expression) => {
      return B.struct.modifier.exceptBy({
        selection: B.struct.filter.within({ selection, target, radius }),
        by: target
      })
    }
  },
  {
    '@desc': 'Selects atoms in s1 that are at least X Anstroms away from s2. s1 BEYOND X OF s2',
    name: 'beyond',
    type: h.binaryLeft,
    rule: ofOp('BEYOND', 'be.'),
    map: (radius: number, selection: Expression, target: Expression) => {
      return B.struct.modifier.intersectBy({
        selection,
        by: B.struct.generator.queryInSelection({
          selection: B.struct.modifier.includeSurroundings({ selection: target, radius }),
          query: B.struct.generator.atomGroups(),
          'in-complement': true
        })
      })
    }
  },
  {
    '@desc': 'Expands selection to complete residues. BYRES s1',
    name: 'byres',
    type: h.prefix,
    rule: h.prefixOp(/BYRES|br\./i),
    map: (op: string, selection: Expression) => {
      return B.struct.filter.withSameAtomProperties({
        selection: B.struct.generator.atomGroups(),
        source: selection,
        property: B.struct.type.labelResidueId([
          B.ammp('label_entity_id'),
          B.ammp('label_asym_id'),
          B.ammp('label_seq_id'),
          B.ammp('pdbx_PDB_ins_code')
        ])
      })
    }
  },
  {
    '@desc': 'Expands selection to complete molecules. BYMOLECULE s1',
    isUnsupported: true,
    name: 'bymolecule',
    type: h.prefix,
    rule: h.prefixOp(/BYMOLECULE|bm\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    '@desc': 'Expands selection to complete fragments. BYFRAGMENT s1',
    isUnsupported: true,
    name: 'byfragment',
    type: h.prefix,
    rule: h.prefixOp(/BYFRAGMENT|bf\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    '@desc': 'Expands selection to complete segments. BYSEGMENT s1',
    name: 'bysegment',
    type: h.prefix,
    rule: h.prefixOp(/BYSEGMENT|bs\./i),
    map: (op: string, selection: Expression) => {
      return B.struct.filter.withSameAtomProperties({
        selection: B.struct.generator.atomGroups(),
        source: selection,
        property: B.ammp('label_asym_id')
      })
    }
  },
  {
    '@desc': 'Expands selection to complete objects. BYOBJECT s1',
    isUnsupported: true,
    name: 'byobject',
    type: h.prefix,
    rule: h.prefixOp(/BYOBJECT|bo\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    '@desc': 'Expands selection to unit cell. BYCELL s1',
    isUnsupported: true,
    name: 'bycell',
    type: h.prefix,
    rule: h.prefixOp(/BYCELL/i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    '@desc': 'All rings of size ≤ 7 which have at least one atom in s1. BYRING s1',
    isUnsupported: true,
    name: 'byring',
    type: h.prefix,
    rule: h.prefixOp(/BYRING/i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    '@desc': 'Selects atoms directly bonded to s1, excludes s1. NEIGHBOUR s1',
    isUnsupported: true,
    name: 'neighbour',
    type: h.prefix,
    rule: h.prefixOp(/NEIGHBOUR|nbr\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    '@desc': 'Selects atoms directly bonded to s1, may include s1. BOUND_TO s1',
    isUnsupported: true,
    name: 'bound_to',
    type: h.prefix,
    rule: h.prefixOp(/BOUND_TO|bto\./i),
    map: (op: string, selection: Expression) => [op, selection]
  },
  {
    '@desc': 'Extends s1 by X bonds connected to atoms in s1. s1 EXTEND X',
    isUnsupported: true,
    name: 'extend',
    type: h.postfix,
    rule: h.postfixOp(/(EXTEND|xt\.)\s+([0-9]+)/i, 2),
    map: (op: string, selection: Expression) => [op, selection]
  }
]

export {
    opList
}
