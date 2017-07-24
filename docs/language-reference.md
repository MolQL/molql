
Table of Contents
=================


   * [Langauge Primitives](#langauge-primitives)
     * [Constructors](#constructors)
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

**list**

``primitive.constructor.list :: (values: value*) -> list``

-------------------

**set**

``primitive.constructor.set :: (values: value*) -> set``

-------------------

**map**

``primitive.constructor.map :: (values: value*) -> map``

-------------------

## Operators

**not**

``primitive.operator.not :: (a: value) -> value``

-------------------

**and**

``primitive.operator.and :: (args: value+) -> value``

-------------------

**or**

``primitive.operator.or :: (args: value+) -> value``

-------------------

**plus**

``primitive.operator.plus :: (args: value+) -> value``

-------------------

**minus**

``primitive.operator.minus :: (a: value, b: value) -> value``

-------------------

**times**

``primitive.operator.times :: (args: value+) -> value``

-------------------

**div**

``primitive.operator.div :: (a: value, b: value) -> value``

-------------------

**power**

``primitive.operator.power :: (a: value, b: value) -> value``

-------------------

**min**

``primitive.operator.min :: (args: value+) -> value``

-------------------

**max**

``primitive.operator.max :: (args: value+) -> value``

-------------------

**eq**

``primitive.operator.eq :: (a: value, b: value) -> value``

-------------------

**neq**

``primitive.operator.neq :: (a: value, b: value) -> value``

-------------------

**lt**

``primitive.operator.lt :: (a: value, b: value) -> value``

-------------------

**lte**

``primitive.operator.lte :: (a: value, b: value) -> value``

-------------------

**gr**

``primitive.operator.gr :: (a: value, b: value) -> value``

-------------------

**gre**

``primitive.operator.gre :: (a: value, b: value) -> value``

-------------------

**in-range**

``primitive.operator.in-range :: (min: value, max: value, value: value) -> value``

-------------------

**set-has**

``primitive.operator.set-has :: (set: set, value: value) -> value``

-------------------

**map-get**

``primitive.operator.map-get :: (map: map, key: value, default: value) -> value``

-------------------

# Molecular Structure Queries

## Constructors

**element-symbol**

``structure.constructor.element-symbol :: (symbol: value) -> element-symbol``

-------------------

**atom-set**

``structure.constructor.atom-set :: (atom-indices: value+) -> atom-set``

-------------------

**atom-set-seq**

``structure.constructor.atom-set-seq :: (sets: atom-set*) -> atom-set-seq``

-------------------

## Properties

**id**

``structure.property.atom.id :: value``

-------------------

**label_atom_id**

``structure.property.atom.label_atom_id :: value``

-------------------

**type_symbol**

``structure.property.atom.type_symbol :: value``

-------------------

**B_iso_or_equiv**

``structure.property.atom.B_iso_or_equiv :: value``

-------------------

**operator-name**

``structure.property.atom.operator-name :: value``

*Returns the name of the symmetry operator applied to this atom.*

-------------------

**unique-id**

``structure.property.residue.unique-id :: value``

*unique-id*

-------------------

**label_seq_id**

``structure.property.residue.label_seq_id :: value``

-------------------

**label_comp_id**

``structure.property.residue.label_comp_id :: value``

-------------------

**label_asym_id**

``structure.property.chain.label_asym_id :: value``

-------------------

**atom-count**

``structure.property.atom-set.atom-count :: value``

*atom-count*

-------------------

**foldl**

``structure.property.atom-set.accumulate.foldl :: (f: value, initial: value) -> value``

-------------------

**value**

``structure.property.atom-set.accumulate.value :: value``

-------------------

**length**

``structure.property.atom-set-seq.length :: (seq: atom-set-seq) -> atom-set-seq``

-------------------

## Query Primitives

**generate**

``structure.primitive.generate :: (predicate: ?value, group-by: ?value) -> atom-set-seq``

-------------------

**modify**

``structure.primitive.modify :: (seq: atom-set-seq, f: atom-set-seq) -> atom-set-seq``

-------------------

**combine**

``structure.primitive.combine :: (combinator: atom-set-seq, seqs: atom-set-seq+) -> atom-set-seq``

-------------------

**in-context**

``structure.primitive.in-context :: (context: value, query: atom-set-seq) -> atom-set-seq``

*Executes the query inside a different context. This query cannot be used inside a generator or modifier sequence.*

-------------------

## Atom Set Modifiers

**filter**

``structure.modifier.filter :: (predicate: value) -> atom-set-seq``

-------------------

**within**

``structure.modifier.within :: (radius: value, seq: atom-set-seq) -> atom-set-seq``

-------------------

**find**

``structure.modifier.find :: (query: atom-set-seq) -> atom-set-seq``

*Executes the specified query in the context induced by each of the atoms sets in the sequence.*

-------------------

## Sequence Combinators

**merge**

``structure.combinator.merge :: atom-set-seq``

-------------------

**union**

``structure.combinator.union :: atom-set-seq``

*Collects all atom sets in the sequence into a single atom set.*

-------------------

**near**

``structure.combinator.near :: (max-distance: value) -> atom-set-seq``

*Merges all tuples of atom sets that are mutually no further than the specified threshold.*

-------------------

## Context Updates

**inside**

``structure.context.inside :: (query: atom-set-seq) -> value``

*Create a context induced by the query.*

-------------------

**assembly**

``structure.context.assembly :: (name: value) -> value``

*Creates a context by applying assembly operators.*

-------------------

**symmetry-mates**

``structure.context.symmetry-mates :: (radius: value) -> value``

*Creates a context by adding symmetry mates that are within *radius* angstroms.*

-------------------

