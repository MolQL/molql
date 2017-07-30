
MolQL
=====

MolQL (Molecular Query Language) is a declarative language for describing selections/substructures of molecular data. This language is
not meant to be used direcly be the user but rather used as a compilation target for various "user facing" selection languages.
Emphasis is on making the language extensible. Basically, the language is a weaker version of LISP.

The language is based on work described in this [dissertation](https://is.muni.cz/th/140435/fi_d/thesis.pdf)
that was implemented as part the [PattenQuery](http://webchem.ncbr.muni.cz/Platform/PatternQuery/Index) service ([publication](http://dx.doi.org/10.1093/nar/gkv561)), the [CoordinateServer](https://cs.litemol.org) ([@PDB](https://www.ebi.ac.uk/pdbe/coordinates/)) and [LiteMol](https://github.com/dsehnal/LiteMol).

[Language Reference](docs/language-reference.md)

Roadmap
=======

1. Tune the specification: decide which symbols should be included and how to name them.
2. Do some more stuff:
    * Implement the specification in multiple programming languages.
    * Implement transpilers from different selection languages such as PyMOL, VMD, or Chimera.
    * Design a test suite for individual queries to test different implementations.
3. Move the reference implementation into a separate repository once the specification is stable.
4. ????
5. Profit.

Examples
========

TODO.

Building & Running
========

### Build:

    npm install
    npm run build

### Interactive builds on file save:

    npm run watch

### Building docs:
 
    npm run docs

### To run the test app:

    node build/app

### Building "HTML" test app

    npm run testapp

Then just open ``test-app/index.html``.