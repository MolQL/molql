
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
     * [Properties](#properties)
       * [Atoms](#atoms)
       * [Residues](#residues)
       * [Chains](#chains)
       * [Entities](#entities)
       * [Model](#model)
       * [Secondary Structure](#secondary-structure)
       * [Atom Sets](#atom-sets)
       * [Atom Set Sequences](#atom-set-sequences)
# Langauge Primitives

## Constructors

### bool

``primitive.constructor.bool :: (value: value) -> value``

-------------------

### number

``primitive.constructor.number :: (value: value) -> value``

-------------------

### str

``primitive.constructor.str :: (value: value) -> value``

-------------------

### list

``primitive.constructor.list :: (values: value*) -> list``

-------------------

### set

``primitive.constructor.set :: (values: value*) -> set``

-------------------

### map

``primitive.constructor.map :: (key-value-pairs: value*) -> map``

-------------------

### regex

``primitive.constructor.regex :: (expression: value, flags: ?value) -> regex``

*Creates a regular expression from a string using the ECMAscript syntax.*

-------------------

## Functional Operators

### partial

``primitive.functional.partial :: (f: value*->value, args: value*) -> value``

-------------------

### slot

``primitive.functional.slot :: (index: value) -> value``

-------------------

## Operators

### Logic

### not

``primitive.operator.logic.not :: (args: value) -> value``

-------------------

### and

``primitive.operator.logic.and :: (args: value+) -> value``

-------------------

### or

``primitive.operator.logic.or :: (args: value+) -> value``

-------------------

### Arithmetic

### add

``primitive.operator.arithmetic.add :: (args: value+) -> value``

-------------------

### sub

``primitive.operator.arithmetic.sub :: (a: value, b: value) -> value``

-------------------

### minus

``primitive.operator.arithmetic.minus :: (args: value) -> value``

-------------------

### mult

``primitive.operator.arithmetic.mult :: (args: value+) -> value``

-------------------

### div

``primitive.operator.arithmetic.div :: (a: value, b: value) -> value``

-------------------

### pow

``primitive.operator.arithmetic.pow :: (a: value, b: value) -> value``

-------------------

### min

``primitive.operator.arithmetic.min :: (args: value+) -> value``

-------------------

### max

``primitive.operator.arithmetic.max :: (args: value+) -> value``

-------------------

### floor

``primitive.operator.arithmetic.floor :: (args: value) -> value``

-------------------

### ceil

``primitive.operator.arithmetic.ceil :: (args: value) -> value``

-------------------

### round-int

``primitive.operator.arithmetic.round-int :: (args: value) -> value``

-------------------

### abs

``primitive.operator.arithmetic.abs :: (args: value) -> value``

-------------------

### sin

``primitive.operator.arithmetic.sin :: (args: value) -> value``

-------------------

### cos

``primitive.operator.arithmetic.cos :: (args: value) -> value``

-------------------

### tan

``primitive.operator.arithmetic.tan :: (args: value) -> value``

-------------------

### asin

``primitive.operator.arithmetic.asin :: (args: value) -> value``

-------------------

### acos

``primitive.operator.arithmetic.acos :: (args: value) -> value``

-------------------

### atan

``primitive.operator.arithmetic.atan :: (args: value) -> value``

-------------------

### atan2

``primitive.operator.arithmetic.atan2 :: (index: value) -> value``

-------------------

### sinh

``primitive.operator.arithmetic.sinh :: (args: value) -> value``

-------------------

### cosh

``primitive.operator.arithmetic.cosh :: (args: value) -> value``

-------------------

### tanh

``primitive.operator.arithmetic.tanh :: (args: value) -> value``

-------------------

### exp

``primitive.operator.arithmetic.exp :: (args: value) -> value``

-------------------

### log

``primitive.operator.arithmetic.log :: (args: value) -> value``

-------------------

### log10

``primitive.operator.arithmetic.log10 :: (args: value) -> value``

-------------------

### Relational

### eq

``primitive.operator.relational.eq :: (a: value, b: value) -> value``

-------------------

### neq

``primitive.operator.relational.neq :: (a: value, b: value) -> value``

-------------------

### lt

``primitive.operator.relational.lt :: (a: value, b: value) -> value``

-------------------

### lte

``primitive.operator.relational.lte :: (a: value, b: value) -> value``

-------------------

### gr

``primitive.operator.relational.gr :: (a: value, b: value) -> value``

-------------------

### gre

``primitive.operator.relational.gre :: (a: value, b: value) -> value``

-------------------

### in-range

``primitive.operator.relational.in-range :: (min: value, max: value, value: value) -> value``

-------------------

### Strings

### concat

``primitive.operator.string.concat :: (args: value+) -> value``

-------------------

### match

``primitive.operator.string.match :: (expression: regex, value: value) -> value``

-------------------

### Collections

### in-set

``primitive.operator.collections.in-set :: (set: set, value: value) -> value``

-------------------

### map-get

``primitive.operator.collections.map-get :: (map: map, key: value, default: value) -> value``

-------------------

# Molecular Structure Queries

## Constructors

### element-symbol

``structure.constructor.element-symbol :: (symbol: value) -> element-symbol``

-------------------

### atom-set

``structure.constructor.atom-set :: (atom-indices: value+) -> atom-set``

-------------------

### atom-set-seq

``structure.constructor.atom-set-seq :: (sets: atom-set*) -> atom-set-seq``

-------------------

### modify

``structure.primitive.modify :: (seq: atom-set-seq, f: atom-set-seq) -> atom-set-seq``

-------------------

### combine

``structure.primitive.combine :: (combinator: atom-set-seq, seqs: atom-set-seq+) -> atom-set-seq``

-------------------

## Generators

### atom-groups

``structure.generator.atom-groups :: (entity-predicate: value, chain-predicate: value, residue-predicate: value, atom-predicate: value, group-by: ?value) -> atom-set-seq``

-------------------

## Atom Set Modifiers

### filter

``structure.modifier.filter :: (predicate: value) -> atom-set-seq``

-------------------

### within

``structure.modifier.within :: (radius: value, seq: atom-set-seq) -> atom-set-seq``

-------------------

### find

``structure.modifier.find :: (query: atom-set-seq) -> atom-set-seq``

*Executes the specified query in the context induced by each of the atoms sets in the sequence.*

-------------------

## Sequence Combinators

### intersect-with

``structure.combinator.intersect-with :: atom-set-seq``

-------------------

### merge

``structure.combinator.merge :: atom-set-seq``

-------------------

### union

``structure.combinator.union :: atom-set-seq``

*Collects all atom sets in the sequence into a single atom set.*

-------------------

### near

``structure.combinator.near :: (max-distance: value) -> atom-set-seq``

*Merges all tuples of atom sets that are mutually no further than the specified threshold.*

-------------------

## Properties

### Atoms

### unique-id

``structure.property.atom.unique-id :: value``

*Returns an implementation specific unique identifier of the current atom.*

-------------------

### id

``structure.property.atom.id :: value``

-------------------

### Cartn_x

``structure.property.atom.Cartn_x :: value``

-------------------

### Cartn_y

``structure.property.atom.Cartn_y :: value``

-------------------

### Cartn_z

``structure.property.atom.Cartn_z :: value``

-------------------

### label_atom_id

``structure.property.atom.label_atom_id :: value``

-------------------

### type_symbol

``structure.property.atom.type_symbol :: value``

-------------------

### occupancy

``structure.property.atom.occupancy :: value``

-------------------

### B_iso_or_equiv

``structure.property.atom.B_iso_or_equiv :: value``

-------------------

### Residues

### unique-id

``structure.property.residue.unique-id :: value``

*Returns an implementation specific unique identifier of the current residue.*

-------------------

### group_-pD-b

``structure.property.residue.group_-pD-b :: value``

-------------------

### label_seq_id

``structure.property.residue.label_seq_id :: value``

-------------------

### label_comp_id

``structure.property.residue.label_comp_id :: value``

-------------------

### pdbx_-pD-b_ins_code

``structure.property.residue.pdbx_-pD-b_ins_code :: value``

-------------------

### Chains

### unique-id

``structure.property.chain.unique-id :: value``

*Returns an implementation specific unique identifier of the current chain.*

-------------------

### label_asym_id

``structure.property.chain.label_asym_id :: value``

-------------------

### Entities

### unique-id

``structure.property.entity.unique-id :: value``

*Returns an implementation specific unique identifier of the current entity.*

-------------------

### id

``structure.property.entity.id :: value``

-------------------

### Model

### pdbx_-pD-b_model_num

``structure.property.model.pdbx_-pD-b_model_num :: value``

-------------------

### Secondary Structure

### unique-id

``structure.property.secondaryStructure.unique-id :: value``

*Returns an implementation specific unique identifier of the current secondary structure element.*

-------------------

### Atom Sets

### atom-count

``structure.property.atom-set.atom-count :: value``

-------------------

### reduce

``structure.property.atom-set.reduce :: (f: value->value, initial: value) -> value``

-------------------

### Atom Set Sequences

### length

``structure.property.atom-set-seq.length :: (seq: atom-set-seq) -> atom-set-seq``

-------------------

### property-set

``structure.property.atom-set-seq.property-set :: (prop: value, seq: atom-set-seq) -> set``

*Returns a set of unique properties from all atoms within the source sequence.*

-------------------

