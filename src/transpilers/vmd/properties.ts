/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */

import { PropertyDict } from '../types'
// import B from '../../molql/builder'

// const reFloat = /[-+]?[0-9]*\.?[0-9]+/
// const rePosInt = /[0-9]+/

// function listMap(x: string) { return x.split('+') }
// function rangeMap(x: string) {
//   const [min, max] = x.split('-').map(parseInt)
//   return {min, max}
// }
// function listOrRangeMap(x: string) {
//   return x.includes('-') ? rangeMap(x) : listMap(x).map(parseInt)
// }
// function elementListMap(x: string) {
//   return x.split('+').map(B.struct.type.elementSymbol)
// }

const properties: PropertyDict = {
  // symbol: {
  //   '@desc': 'chemical-symbol-list: list of 1- or 2-letter chemical symbols from the periodic table',
  //   '@examples': ['symbol O+N'],
  //   short: 'e.', regex: /[a-zA-Z+]+/, map: listMap,
  //   level: 'atom-test', property: B.acp('elementSymbol')
  // }
}

export default properties
