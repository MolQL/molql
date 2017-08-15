![Logo](docs/logo.png)

**MolQL** (Molecular Query Language) is a declarative language for describing selections/substructures of molecular data. 

Goals of the language:

* Provide a common set of functions that is straightforward to implement in different environments while being powerful enough to express a wide range of queries. MolQL could therefore serve as a compilation target for other selection languages, for example the ones used by PyMOL, Jmol, or VMD. For a list of available function, see 
the [language reference](docs/language-reference.md).
* Make it easy to serialize/deserialize the expressions. JSON is the default format.
* Easily extensible. The language is essentially a stripped-down (Mini) LISP. New functionality is as easy as adding a new symbol.

The language is based on work described in this [dissertation](https://is.muni.cz/th/140435/fi_d/thesis.pdf)
that was implemented as part the [PattenQuery](http://webchem.ncbr.muni.cz/Platform/PatternQuery/Index) service ([publication](http://dx.doi.org/10.1093/nar/gkv561)), the [CoordinateServer](https://cs.litemol.org) ([@PDB](https://www.ebi.ac.uk/pdbe/coordinates/)) and [LiteMol](https://github.com/dsehnal/LiteMol).

Project Structure
========

* [Mini LISP "specification"](src/mini-lisp) A simple language that could easily be serialized as JSON.
* [MolQL "specification"](src/molql) Definition of symbols and types that form the MolQL language.
* [Reference implementation](src/reference-implementation)
    * [Mini LISP](src/reference-implementation/mini-lisp) Compiler for the Mini LISP language.
    * [MolQL](src/reference-implementation/molql) Implementation of the MolQL runtime.
    * [Molecule Representation](src/reference-implementation/molecule) Representations of molecules based on the mmCIF format.
* [Transpilers](src/transpilers)
    * [MolQL Script](src/transpilers/molql-script) A LISP inspired language that defines aliases to the somewhat verbose MolQL functions.
    * [PyMol](src/transpilers/pymol) Allows to compile a subset of PyMol selections to MolQL.
    * [Jmol](src/transpilers/jmol) Allows to compile a subset of Jmol selections to MolQL.
* [MolQL Explorer](src/molql-explorer) An application that showcases the language. Ability to execute any query on any PDB entry and export the result as mmCIF + show it in context of the whole structure using [LiteMol](https://github.com/dsehnal/LiteMol).

## Building & Running

### Build:

    npm install
    npm run build

### Interactive builds on file save:

    npm run watch

### Building docs:
 
    npm run docs

### Building MolQL Explorer

    npm run app

Then just open ``molql-explorer/index-dev.html``.

To build the minified version, also call ``npm run appmin``, then ``molql-explorer/index.html`` will work.

# FAQ

## How to add a new symbol to the language?

1) Add the symbol definition to the appropriate place in ``src/symbol-table/``.
2) Add implementation to an appropriate place in ``src/reference-implementation/molql/runtime/``.
3) Map the symbol to implementation in ``src/reference-implementation/molql/runtime.ts``.
    * If adding new atom properties and implementing them in ``src/reference-implementation/molql/runtime/structure/atom-propeties.ts``, this step could be skipped provided the same "key" is used for the symbol.
4) Add alias for it to ``src/transpilers/molql-list/symbols``.
5) If possible, add a unit test to ``src/reference-implementation/molql/spec/?``.

## License?

MIT.