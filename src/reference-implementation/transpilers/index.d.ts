/*
 * Copyright (c) 2017 MolQL contributors. licensed under MIT, See LICENSE file for more info.
 */

import * as P from 'parsimmon'

// Augmented Type definitions for Parsimmon 1.3 to 1.6
// Project: https://github.com/jneen/parsimmon
// Definitions by: Alexander Rose <https://github.com/arose>

declare module 'parsimmon' {
  interface Parser<T> {
    node(name: String): Parser<T>;
    thru(wrapper: Function): Parser<T>;
    sepBy(separator: String): Parser<T>;
    sepBy1(separator: String): Parser<T>;
    tie(): Parser<T>;
    trim(arg: Parser<any>): Parser<T>;
    wrap(before: Parser<any>, after: Parser<any>): Parser<T>;
  }
  function createLanguage(parsers: { [key: string]: (r: any) => Parser<any> }): { [key: string]: Parser<any> };
  function range(begin: Number, end: Number): Parser<string>;
  function seqObj(...parsers: Array<Parser<any>|[String, Parser<any>]>): Parser<any[]>;
}