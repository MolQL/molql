/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */


/*
  fragment: ???
  segment: label_asym_id
  chain: auth_asym_id

  selection algebra
  - see https://pymolwiki.org/index.php/Selection_Algebra
  - supported
    - not, and, or
    - around, expand
    - within, near_to, beyond
    - bysegment, byres
  - unsupported
    - todo
      - like, in
    - gap: needs vdW radius
    - bymolecule: everything connected by bonds
    - byfragment:
    - byobject:
    - bycell,
    - byring, neighbour, bound_to, extend
  selection macros
  - see https://pymolwiki.org/index.php/Selection_Macros
  - object-id is ignored
  property selectors
  - see https://pymolwiki.org/index.php/Property_Selectors
  - todo
    - support ''+A syntax for empty list elements
  single word selectors
  - see https://pymolwiki.org/index.php/Single-word_Selectors
*/

import * as P from 'parsimmon'
import * as h from '../helper'

import { properties as p, namedPropertiesList, propertiesSpec } from './properties'
import { opList } from './operators'
import { keywordsList } from './keywords'

import Transpiler from '../transpiler'
import B from '../../molql/builder'

const Q = h.QueryBuilder

const slash = P.string('/')

function orNull(rule: P.Parser<any>) {
  return rule.or(P.of(null))
}

function atomSelectionQuery(x: any) {
  const tests: h.AtomGroupArgs = {}
  const props: {[k: string]: any[]} = {}

  for (let k in x) {
    const ps = propertiesSpec[k]
    if (!ps) {
      throw new Error(`property '${k}' not supported, value '${x[k]}'`)
    }
    if (x[k] === null) continue
    if (!props[ps.level]) props[ps.level] = []
    props[ps.level].push(x[k])
  }

  for (let p in props) {
    tests[p] = Q.and(props[p])
  }

  return B.struct.generator.atomGroups(tests)
}

const lang = P.createLanguage({
  Parens: function (r) {
    return P.string('(')
      .then(P.alt(r.Parens, r.Operator, r.Expression))
      .skip(P.string(')'))
  },

  Expression: function(r) {
    return P.alt(
      r.AtomSelectionMacro.map(atomSelectionQuery),
      r.NamedAtomProperties,
      r.Pepseq,
      r.Rep,
      r.Keywords
    )
  },

  AtomSelectionMacro: function(r) {
    return P.alt(
      slash.then(P.alt(
        P.seq(
          orNull(r.Object).skip(slash),
          orNull(p.segi).skip(slash),
          orNull(p.chain).skip(slash),
          orNull(p.resi).skip(slash),
          orNull(p.name)
        ).map(x => {return {object: x[0], segi: x[1], chain: x[2], resi: x[3], name: x[4]}}),
        P.seq(
          orNull(r.Object).skip(slash),
          orNull(p.segi).skip(slash),
          orNull(p.chain).skip(slash),
          orNull(p.resi)
        ).map(x => {return {object: x[0], segi: x[1], chain: x[2], resi: x[3]}}),
        P.seq(
          orNull(r.Object).skip(slash),
          orNull(p.segi).skip(slash),
          orNull(p.chain)
        ).map(x => {return {object: x[0], segi: x[1], chain: x[2]}}),
        P.seq(
          orNull(r.Object).skip(slash),
          orNull(p.segi)
        ).map(x => {return {object: x[0], segi: x[1]}}),
        P.seq(
          orNull(r.Object)
        ).map(x => {return {object: x[0]}}),
      )),
      P.alt(
        P.seq(
          orNull(r.Object).skip(slash),
          orNull(p.segi).skip(slash),
          orNull(p.chain).skip(slash),
          orNull(p.resi).skip(slash),
          orNull(p.name)
        ).map(x => {return {object: x[0], segi: x[1], chain: x[2], resi: x[3], name: x[4]}}),
        P.seq(
          orNull(p.segi).skip(slash),
          orNull(p.chain).skip(slash),
          orNull(p.resi).skip(slash),
          orNull(p.name)
        ).map(x => {return {segi: x[0], chain: x[1], resi: x[2], name: x[3]}}),
        P.seq(
          orNull(p.chain).skip(slash),
          orNull(p.resi).skip(slash),
          orNull(p.name)
        ).map(x => {return {chain: x[0], resi: x[1], name: x[2]}}),
        P.seq(
          orNull(p.resi).skip(slash),
          orNull(p.name)
        ).map(x => {return {resi: x[0], name: x[1]}}),
      )
    )
  },

  NamedAtomProperties: function() {
    return P.alt(...namedPropertiesList)
  },

  Keywords: () => P.alt(...keywordsList),

  Object: () => P.regex(/[a-zA-Z0-9+]+/),

  // Selects peptide sequence matching upper-case one-letter
  // sequence SEQ (see also FindSeq).
  // PEPSEQ seq
  Pepseq: () => {
    return P.regex(/(PEPSEQ|ps\.)\s+([a-z]+)/i, 2)
      .map(h.makeError('PEPSEQ operator unsupported'))
  },

  // Selects atoms which show representation rep.
  // REP rep
  Rep: () => {
    return P.regex(/REP\s+(lines|spheres|mesh|ribbon|cartoon|sticks|dots|surface|labels|extent|nonbonded|nb_spheres|slice|extent|slice|dashes|angles|dihedrals|cgo|cell|callback|everything)/i, 1)
      .map(h.makeError('REP operator unsupported'))
  },

  Operator: function(r) {
    return h.combineOperators(opList, P.alt(r.Parens, r.Expression))
  },

  Query: function(r) {
    return P.alt(
      r.Operator,
      r.Parens,
      r.Expression
    ).trim(P.optWhitespace)
  }
})

const transpiler: Transpiler = str => lang.Query.tryParse(str)
export default transpiler
