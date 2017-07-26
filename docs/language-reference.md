
Table of Contents
=================


   * [Langauge Primitives](#langauge-primitives)
     * [Constructors](#constructors)
     * [Functional Operators](#functional-operators)
     * [Operators](#operators)
       * [Logic](#logic)
       * [Arithmetic](#arithmetic)
       * [Relational](#relational)
       * [Strings](#strings)
       * [Collections](#collections)
   * [Molecular Structure Queries](#molecular-structure-queries)
     * [Constructors](#constructors)
     * [Generators](#generators)
     * [Atom Set Modifiers](#atom-set-modifiers)
     * [Sequence Combinators](#sequence-combinators)
     * [Context Updates](#context-updates)
     * [Properties](#properties)
       * [Atoms](#atoms)
       * [Residues](#residues)
       * [Chains](#chains)
       * [Atom Sets](#atom-sets)
       * [Atom Set Sequences](#atom-set-sequences)
# Langauge Primitives

## Constructors

### list

``primitive.constructor.list :: (values: value*) -> list``

Has reference implementation: *yes*

-------------------

### set

``primitive.constructor.set :: (values: value*) -> set``

Has reference implementation: *yes*

-------------------

### map

``primitive.constructor.map :: (key-value-pairs: value*) -> map``

Has reference implementation: *yes*

-------------------

### regex

``primitive.constructor.regex :: (expression: value, flags: ?value) -> regex``

*Creates a regular expression from a string using the ECMAscript syntax.*

Has reference implementation: *yes*

-------------------

## Functional Operators

### partial

``primitive.functional.partial :: (f: value*->value, args: value*) -> value``

Has reference implementation: *yes*

-------------------

### slot

``primitive.functional.slot :: (index: value) -> value``

Has reference implementation: *yes*

-------------------

## Operators

### Logic

### not

``primitive.operator.logic.not :: (a: value) -> value``

Has reference implementation: *yes*

-------------------

### and

``primitive.operator.logic.and :: (args: value+) -> value``

Has reference implementation: *yes*

-------------------

### or

``primitive.operator.logic.or :: (args: value+) -> value``

Has reference implementation: *yes*

-------------------

### Arithmetic

### add

``primitive.operator.arithmetic.add :: (args: value+) -> value``

Has reference implementation: *yes*

-------------------

### sub

``primitive.operator.arithmetic.sub :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### minus

``primitive.operator.arithmetic.minus :: (a: value) -> value``

Has reference implementation: *no*

-------------------

### mult

``primitive.operator.arithmetic.mult :: (args: value+) -> value``

Has reference implementation: *yes*

-------------------

### div

``primitive.operator.arithmetic.div :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### pow

``primitive.operator.arithmetic.pow :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### min

``primitive.operator.arithmetic.min :: (args: value+) -> value``

Has reference implementation: *yes*

-------------------

### max

``primitive.operator.arithmetic.max :: (args: value+) -> value``

Has reference implementation: *yes*

-------------------

### Relational

### eq

``primitive.operator.relational.eq :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### neq

``primitive.operator.relational.neq :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### lt

``primitive.operator.relational.lt :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### lte

``primitive.operator.relational.lte :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### gr

``primitive.operator.relational.gr :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### gre

``primitive.operator.relational.gre :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### in-range

``primitive.operator.relational.in-range :: (min: value, max: value, value: value) -> value``

Has reference implementation: *yes*

-------------------

### Strings

### concat

``primitive.operator.string.concat :: (args: value+) -> value``

Has reference implementation: *yes*

-------------------

### match

``primitive.operator.string.match :: (expression: regex, value: value) -> value``

Has reference implementation: *no*

-------------------

### Collections

### in-set

``primitive.operator.collections.in-set :: (set: set, value: value) -> value``

Has reference implementation: *yes*

-------------------

### map-get

``primitive.operator.collections.map-get :: (map: map, key: value, default: value) -> value``

Has reference implementation: *yes*

-------------------

# Molecular Structure Queries

## Constructors

### element-symbol

``structure.constructor.element-symbol :: (symbol: value) -> element-symbol``

Has reference implementation: *yes*

-------------------

### atom-set

``structure.constructor.atom-set :: (atom-indices: value+) -> atom-set``

Has reference implementation: *no*

-------------------

### atom-set-seq

``structure.constructor.atom-set-seq :: (sets: atom-set*) -> atom-set-seq``

Has reference implementation: *no*

-------------------

### modify

``structure.primitive.modify :: (seq: atom-set-seq, f: atom-set-seq) -> atom-set-seq``

Has reference implementation: *yes*

-------------------

### combine

``structure.primitive.combine :: (combinator: atom-set-seq, seqs: atom-set-seq+) -> atom-set-seq``

Has reference implementation: *no*

-------------------

### in-context

``structure.primitive.in-context :: (context: value, query: atom-set-seq) -> atom-set-seq``

*Executes the query inside a different context. This query cannot be used inside a generator or modifier sequence.*

Has reference implementation: *yes*

-------------------

## Generators

### atom-groups

``structure.generator.atom-groups :: (predicate: ?value, group-by: ?value) -> atom-set-seq``

Has reference implementation: *yes*

-------------------

## Atom Set Modifiers

### filter

``structure.modifier.filter :: (predicate: value) -> atom-set->atom-set-seq``

Has reference implementation: *yes*

-------------------

### within

``structure.modifier.within :: (radius: value, seq: atom-set-seq) -> atom-set->atom-set-seq``

Has reference implementation: *no*

-------------------

### find

``structure.modifier.find :: (query: atom-set-seq) -> atom-set->atom-set-seq``

*Executes the specified query in the context induced by each of the atoms sets in the sequence.*

Has reference implementation: *no*

-------------------

## Sequence Combinators

### merge

``structure.combinator.merge :: atom-set-seq+->atom-set-seq``

Has reference implementation: *no*

-------------------

### union

``structure.combinator.union :: atom-set-seq+->atom-set-seq``

*Collects all atom sets in the sequence into a single atom set.*

Has reference implementation: *no*

-------------------

### near

``structure.combinator.near :: (max-distance: value) -> atom-set-seq+->atom-set-seq``

*Merges all tuples of atom sets that are mutually no further than the specified threshold.*

Has reference implementation: *no*

-------------------

## Context Updates

### inside

``structure.context.inside :: (query: atom-set-seq) -> value``

*Create a context induced by the query.*

Has reference implementation: *no*

-------------------

## Properties

### Atoms

### unique-id

``structure.property.atom.unique-id :: value``

Has reference implementation: *yes*

-------------------

### id

``structure.property.atom.id :: value``

Has reference implementation: *yes*

-------------------

### label_atom_id

``structure.property.atom.label_atom_id :: value``

Has reference implementation: *yes*

-------------------

### type_symbol

``structure.property.atom.type_symbol :: value``

Has reference implementation: *yes*

-------------------

### B_iso_or_equiv

``structure.property.atom.B_iso_or_equiv :: value``

Has reference implementation: *yes*

-------------------

### operator-name

``structure.property.atom.operator-name :: value``

*Returns the name of the symmetry operator applied to this atom (e.g., 4_455). Atoms from the loaded asymmetric always return 1_555*

Has reference implementation: *no*

-------------------

### Residues

### unique-id

``structure.property.residue.unique-id :: value``

Has reference implementation: *yes*

-------------------

### label_seq_id

``structure.property.residue.label_seq_id :: value``

Has reference implementation: *yes*

-------------------

### label_comp_id

``structure.property.residue.label_comp_id :: value``

Has reference implementation: *yes*

-------------------

### Chains

### label_asym_id

``structure.property.chain.label_asym_id :: value``

Has reference implementation: *yes*

-------------------

### Atom Sets

### atom-count

``structure.property.atom-set.atom-count :: value``

Has reference implementation: *yes*

-------------------

### reduce

``structure.property.atom-set.reduce :: (f: value->value, initial: value) -> value``

Has reference implementation: *yes*

-------------------

### Atom Set Sequences

### length

``structure.property.atom-set-seq.length :: (seq: atom-set-seq) -> atom-set-seq``

Has reference implementation: *yes*

-------------------

