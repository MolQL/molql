
Table of Contents
=================


   * [Langauge Primitives](#langauge-primitives)
     * [Constructors](#constructors)
     * [Functional Operators](#functional-operators)
     * [Operators](#operators)
   * [Molecular Structure Queries](#molecular-structure-queries)
     * [Constructors](#constructors)
     * [Properties](#properties)
     * [Query Primitives](#query-primitives)
     * [Atom Set Modifiers](#atom-set-modifiers)
     * [Sequence Combinators](#sequence-combinators)
     * [Context Updates](#context-updates)
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

``primitive.constructor.map :: (values: value*) -> map``

Has reference implementation: *yes*

-------------------

## Functional Operators

### apply-partial

``primitive.functional.apply-partial :: (f: value+->value) -> value``

Has reference implementation: *no*

-------------------

### slot

``primitive.functional.slot :: (index: value) -> value``

Has reference implementation: *no*

-------------------

## Operators

### not

``primitive.operator.not :: (a: value) -> value``

Has reference implementation: *yes*

-------------------

### and

``primitive.operator.and :: (args: value+) -> value``

Has reference implementation: *yes*

-------------------

### or

``primitive.operator.or :: (args: value+) -> value``

Has reference implementation: *yes*

-------------------

### plus

``primitive.operator.plus :: (args: value+) -> value``

Has reference implementation: *yes*

-------------------

### minus

``primitive.operator.minus :: (a: value, b: value) -> value``

Has reference implementation: *no*

-------------------

### times

``primitive.operator.times :: (args: value+) -> value``

Has reference implementation: *no*

-------------------

### div

``primitive.operator.div :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### power

``primitive.operator.power :: (a: value, b: value) -> value``

Has reference implementation: *no*

-------------------

### min

``primitive.operator.min :: (args: value+) -> value``

Has reference implementation: *no*

-------------------

### max

``primitive.operator.max :: (args: value+) -> value``

Has reference implementation: *no*

-------------------

### eq

``primitive.operator.eq :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### neq

``primitive.operator.neq :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### lt

``primitive.operator.lt :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### lte

``primitive.operator.lte :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### gr

``primitive.operator.gr :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### gre

``primitive.operator.gre :: (a: value, b: value) -> value``

Has reference implementation: *yes*

-------------------

### in-range

``primitive.operator.in-range :: (min: value, max: value, value: value) -> value``

Has reference implementation: *yes*

-------------------

### in-set

``primitive.operator.in-set :: (set: set, value: value) -> value``

Has reference implementation: *no*

-------------------

### map-get

``primitive.operator.map-get :: (map: map, key: value, default: value) -> value``

Has reference implementation: *no*

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

## Properties

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

> Returns the name of the symmetry operator applied to this atom.

Has reference implementation: *no*

-------------------

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

### label_asym_id

``structure.property.chain.label_asym_id :: value``

Has reference implementation: *yes*

-------------------

### atom-count

``structure.property.atom-set.atom-count :: value``

Has reference implementation: *yes*

-------------------

### foldl

``structure.property.atom-set.accumulate.foldl :: (f: value, initial: value) -> value``

Has reference implementation: *yes*

-------------------

### value

``structure.property.atom-set.accumulate.value :: value``

Has reference implementation: *yes*

-------------------

### length

``structure.property.atom-set-seq.length :: (seq: atom-set-seq) -> atom-set-seq``

Has reference implementation: *yes*

-------------------

## Query Primitives

### generate

``structure.primitive.generate :: (predicate: ?value, group-by: ?value) -> atom-set-seq``

Has reference implementation: *yes*

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

> Executes the query inside a different context. This query cannot be used inside a generator or modifier sequence.

Has reference implementation: *yes*

-------------------

## Atom Set Modifiers

### filter

``structure.modifier.filter :: (predicate: value) -> atom-set-seq``

Has reference implementation: *yes*

-------------------

### within

``structure.modifier.within :: (radius: value, seq: atom-set-seq) -> atom-set-seq``

Has reference implementation: *no*

-------------------

### find

``structure.modifier.find :: (query: atom-set-seq) -> atom-set-seq``

> Executes the specified query in the context induced by each of the atoms sets in the sequence.

Has reference implementation: *no*

-------------------

## Sequence Combinators

### merge

``structure.combinator.merge :: atom-set-seq``

Has reference implementation: *no*

-------------------

### union

``structure.combinator.union :: atom-set-seq``

> Collects all atom sets in the sequence into a single atom set.

Has reference implementation: *no*

-------------------

### near

``structure.combinator.near :: (max-distance: value) -> atom-set-seq``

> Merges all tuples of atom sets that are mutually no further than the specified threshold.

Has reference implementation: *no*

-------------------

## Context Updates

### inside

``structure.context.inside :: (query: atom-set-seq) -> value``

> Create a context induced by the query.

Has reference implementation: *no*

-------------------

### assembly

``structure.context.assembly :: (name: value) -> value``

> Creates a context by applying assembly operators.

Has reference implementation: *no*

-------------------

### symmetry-mates

``structure.context.symmetry-mates :: (radius: value) -> value``

> Creates a context by adding symmetry mates that are within *radius* angstroms.

Has reference implementation: *no*

-------------------

