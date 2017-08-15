
import * as P from 'parsimmon'

import * as h from '../helper'
import B from '../../molql/builder'

const Q = h.QueryBuilder
const reFloat = /[-+]?[0-9]*\.?[0-9]+/
const rePosInt = /[0-9]+/

function listMap(x: string) { return x.split('+') }
function rangeMap(x: string) {
  const [min, max] = x.split('-').map(parseInt)
  return {min, max}
}
function listOrRangeMap(x: string) {
  return x.includes('-') ? rangeMap(x) : listMap(x).map(parseInt)
}
function elementListMap(x: string) {
  return x.split('+').map(B.struct.type.elementSymbol)
}

interface PropertySpec {
  '@desc'?: string
  isNumeric?: boolean
  isUnsupported?: boolean
  short: string
  regex: RegExp
  map: (s: string) => any
  level: 'atom-test' | 'residue-test' | 'chain-test' | 'entity-test'
  property: any
  value?: Function
}

const propertiesSpec: { [k: string]: PropertySpec } = {
  symbol: {
    '@desc': 'chemical-symbol-list: list of 1- or 2-letter chemical symbols from the periodic table (symbol O+N)',
    short: 'e.', regex: /[a-zA-Z+]+/, map: listMap,
    level: 'atom-test', property: B.acp('elementSymbol')
  },
  name: {
    '@desc': 'atom-name-list: list of up to 4-letter codes for atoms in proteins or nucleic acids (name CA+CB+CG+CD)',
    short: 'n.', regex: /[a-zA-Z0-9+]+/, map: listMap,
    level: 'atom-test', property: B.ammp('label_atom_id')
  },
  resn: {
    '@desc': 'residue-name-list: list of 3-letter codes for amino acids (resn ASP+GLU+ASN+GLN) or list of up to 2-letter codes for nucleic acids (resn A+G)',
    short: 'r.', regex: /[a-zA-Z0-9+]+/, map: listMap,
    level: 'residue-test', property: B.ammp('label_comp_id')
  },
  resi: {
    '@desc': 'residue-identifier-list list of up to 4-digit residue numbers (resi 1+10+100+1000) or residue-identifier-range (resi 1-10)',
    short: 'i.', regex: /[0-9+-]+/, map: listOrRangeMap,
    level: 'residue-test', property: B.ammp('auth_seq_id')
  },
  alt: {
    '@desc': 'alternate-conformation-identifier-list list of single letters (alt A+"")',
    short: 'alt', regex: /[a-zA-Z0-9+]+/, map: listMap,
    level: 'atom-test', property: B.ammp('label_alt_id')
  },
  chain: {
    '@desc': 'chain-identifier-list list of single letters or sometimes numbers (chain A)',
    short: 'c.', regex: /[a-zA-Z0-9+]+/, map: listMap,
    level: 'chain-test', property: B.ammp('auth_asym_id')
  },
  segi: {
    '@desc': 'segment-identifier-list list of up to 4 letter identifiers (segi lig)',
    short: 's.', regex: /[a-zA-Z0-9+]+/, map: listMap,
    level: 'chain-test', property: B.ammp('label_asym_id')
  },
  flag: {
    '@desc': 'flag-number a single integer from 0 to 31 (flag 0)',
    isUnsupported: true,
    short: 'f.', regex: /[0-9]+/, map: parseInt,
    level: 'atom-test', property: undefined
  },
  numeric_type: {
    '@desc': 'type-number a single integer (nt. 5)',
    isUnsupported: true,
    short: 'nt.', regex: /[0-9]+/, map: parseInt,
    level: 'atom-test', property: undefined
  },
  text_type: {
    '@desc': 'type-string a list of up to 4 letter codes (text_type HA+HC)',
    short: 'tt.', regex: /[a-zA-Z0-9+]+/, map: elementListMap,
    level: 'atom-test', property: B.acp('elementSymbol')
  },
  id: {
    '@desc': 'external-index-number a single integer (id 23)',
    short: 'id', regex: rePosInt, map: parseInt,
    level: 'atom-test', property: B.ammp('id')
  },
  index: {
    '@desc': 'nternal-index-number a single integer (index 11)',
    isUnsupported: true,
    short: 'idx.', regex: rePosInt, map: parseInt,
    level: 'atom-test', property: undefined
  },
  ss: {
    '@desc': 'secondary-structure-type list of single letters (ss H+S+L+"")',
    isUnsupported: true,
    short: 'ss', regex: /[a-zA-Z+]+/, map: listMap,
    level: 'residue-test', property: undefined
  },

  b: {
    '@desc': 'comparison-operator b-factor-value a real number (b > 10)',
    isNumeric: true,
    short: 'b', regex: reFloat, map: parseFloat,
    level: 'atom-test', property: B.ammp('B_iso_or_equiv')
  },
  q: {
    '@desc': 'comparison-operator occupancy-value a real number (q <0.50)',
    isNumeric: true,
    short: 'q', regex: reFloat, map: parseFloat,
    level: 'atom-test', property: B.ammp('occupancy')
  },
  formal_charge: {
    '@desc': 'comparison-operator formal charge-value an integer (fc. = -1)',
    isNumeric: true,
    short: 'fc.', regex: reFloat, map: parseFloat,
    level: 'atom-test', property: B.ammp('pdbx_formal_charge')
  },
  partial_charge: {
    '@desc': 'comparison-operator partial charge-value a real number (pc. > 1)',
    isUnsupported: true,
    isNumeric: true,
    short: 'pc.', regex: reFloat, map: parseFloat,
    level: 'atom-test', property: undefined
  }
}

const properties: {[k: string]: P.Parser<any>} = {}
const namedPropertiesList: P.Parser<any>[] = []
Object.keys(propertiesSpec).forEach( name => {
  const ps = propertiesSpec[name]
  const errorFn = h.makeError(`property '${name}' not supported`)
  const rule = P.regex(ps.regex).map(x => {
    if (ps.isUnsupported) errorFn()
    return Q.test(ps.property, ps.map(x))
  })
  const short = h.escapeRegExp(ps.short)
  const nameRule = P.regex(RegExp(`${name}|${short}`, 'i')).trim(P.optWhitespace)
  const groupMap = (x: any) => B.struct.generator.atomGroups({[ps.level]: x})

  if (ps.isNumeric) {
    namedPropertiesList.push(
      nameRule.then(P.seq(
        P.regex(/>=|<=|=|!=|>|</).trim(P.optWhitespace),
        P.regex(ps.regex).map(ps.map)
      )).map(x => {
        if (ps.isUnsupported) errorFn()
        return Q.test(ps.property, { op: x[0], val: x[1] })
      }).map(groupMap)
    )
  } else {
    properties[name] = rule
    namedPropertiesList.push(nameRule.then(rule).map(groupMap))
  }
})

export {
    propertiesSpec,
    properties,
    namedPropertiesList
}
