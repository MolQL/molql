
Language Reference
==================


   * [Langauge Primitives](#langauge-primitives)
     * [Constructors](#constructors)
     * [Operators](#operators)
       * [Logic](#logic)
       * [Arithmetic](#arithmetic)
       * [Relational](#relational)
       * [Strings](#strings)
       * [Sets](#sets)
       * [Maps](#maps)
   * [Molecular Structure Queries](#molecular-structure-queries)
     * [Constructors](#constructors)
     * [Generators](#generators)
     * [Atom Set Modifiers](#atom-set-modifiers)
     * [Sequence Combinators](#sequence-combinators)
     * [Attributes](#attributes)
     * [Properties](#properties)
       * [Secondary Structure](#secondary-structure)
       * [Atom Sets](#atom-sets)
       * [Atom Set Sequences](#atom-set-sequences)
# Langauge Primitives

## Constructors

### **bool**&nbsp;&nbsp;&nbsp;``primitive.constructor.bool :: (value: any-value) => bool``

-------------------

### **number**&nbsp;&nbsp;&nbsp;``primitive.constructor.number :: (value: any-value) => number``

-------------------

### **str**&nbsp;&nbsp;&nbsp;``primitive.constructor.str :: (value: any-value) => string``

-------------------

### **list**&nbsp;&nbsp;&nbsp;``primitive.constructor.list :: (values: any-value*) => list``

-------------------

### **set**&nbsp;&nbsp;&nbsp;``primitive.constructor.set :: (values: any-value*) => set``

-------------------

### **map**&nbsp;&nbsp;&nbsp;``primitive.constructor.map :: (key-value-pairs: any-value*) => map``

-------------------

### **regex**&nbsp;&nbsp;&nbsp;``primitive.constructor.regex :: (expression: string, flags: ?string) => regex``

*Creates a regular expression from a string using the ECMAscript syntax.*

-------------------

## Operators

## Logic

### **not**&nbsp;&nbsp;&nbsp;``primitive.operator.logic.not :: (x: bool) => bool``

-------------------

### **and**&nbsp;&nbsp;&nbsp;``primitive.operator.logic.and :: (xs: bool+) => bool``

-------------------

### **or**&nbsp;&nbsp;&nbsp;``primitive.operator.logic.or :: (xs: bool+) => bool``

-------------------

## Arithmetic

### **add**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.add :: (xs: number+) => number``

-------------------

### **sub**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.sub :: (x: number, y: number) => number``

-------------------

### **minus**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.minus :: (x: number) => number``

-------------------

### **mult**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.mult :: (xs: number+) => number``

-------------------

### **div**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.div :: (x: number, y: number) => number``

-------------------

### **pow**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.pow :: (x: number, y: number) => number``

-------------------

### **min**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.min :: (xs: number+) => number``

-------------------

### **max**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.max :: (xs: number+) => number``

-------------------

### **floor**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.floor :: (x: number) => number``

-------------------

### **ceil**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.ceil :: (x: number) => number``

-------------------

### **round-int**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.round-int :: (x: number) => number``

-------------------

### **abs**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.abs :: (x: number) => number``

-------------------

### **sin**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.sin :: (x: number) => number``

-------------------

### **cos**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.cos :: (x: number) => number``

-------------------

### **tan**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.tan :: (x: number) => number``

-------------------

### **asin**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.asin :: (x: number) => number``

-------------------

### **acos**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.acos :: (x: number) => number``

-------------------

### **atan**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.atan :: (x: number) => number``

-------------------

### **atan2**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.atan2 :: (x: number, y: number) => number``

-------------------

### **sinh**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.sinh :: (x: number) => number``

-------------------

### **cosh**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.cosh :: (x: number) => number``

-------------------

### **tanh**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.tanh :: (x: number) => number``

-------------------

### **exp**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.exp :: (x: number) => number``

-------------------

### **log**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.log :: (x: number) => number``

-------------------

### **log10**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.log10 :: (x: number) => number``

-------------------

## Relational

### **eq**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.eq :: (x: any-value, y: any-value) => bool``

-------------------

### **neq**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.neq :: (x: any-value, y: any-value) => bool``

-------------------

### **lt**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.lt :: (x: number, y: number) => bool``

-------------------

### **lte**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.lte :: (x: number, y: number) => bool``

-------------------

### **gr**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.gr :: (x: number, y: number) => bool``

-------------------

### **gre**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.gre :: (x: number, y: number) => bool``

-------------------

### **in-range**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.in-range :: (min: number, max: number, value: number) => number``

-------------------

## Strings

### **concat**&nbsp;&nbsp;&nbsp;``primitive.operator.string.concat :: (xs: string+) => string``

-------------------

### **match**&nbsp;&nbsp;&nbsp;``primitive.operator.string.match :: (regex: regex, value: string) => string``

-------------------

## Sets

### **has**&nbsp;&nbsp;&nbsp;``primitive.operator.set.has :: (set: set, value: any-value) => bool``

-------------------

### **add**&nbsp;&nbsp;&nbsp;``primitive.operator.set.add :: (set: set, value: any-value) => set``

-------------------

## Maps

### **get**&nbsp;&nbsp;&nbsp;``primitive.operator.map.get :: (map: map, key: any-value, default: any-value) => any-value``

-------------------

### **set**&nbsp;&nbsp;&nbsp;``primitive.operator.map.set :: (map: map, key: any-value, value: any-value) => map``

-------------------

# Molecular Structure Queries

## Constructors

### **element-symbol**&nbsp;&nbsp;&nbsp;``structure.constructor.element-symbol :: (symbol: string) => element-symbol``

-------------------

## Generators

### **atom-groups**&nbsp;&nbsp;&nbsp;``structure.generator.atom-groups :: (entity-predicate: ()->bool, chain-predicate: ()->bool, residue-predicate: ()->bool, atom-predicate: ()->bool, group-by: ?()->any-value) => atom-selection``

-------------------

## Atom Set Modifiers

## Sequence Combinators

## Attributes

### **static-atom-property**&nbsp;&nbsp;&nbsp;``structure.attribute.static-atom-property :: (name: string) => any-value``

*Access a "statically defined" atom property. One of: ``group_PDB``, ``id``, ``type_symbol``, ``label_atom_id``, ``label_alt_id``, ``label_comp_id``, ``label_asym_id``, ``label_entity_id``, ``label_seq_id``, ``pdbx_PDB_ins_code``, ``pdbx_formal_charge``, ``Cartn_x``, ``Cartn_y``, ``Cartn_z``, ``occupancy``, ``B_iso_or_equiv``, ``auth_atom_id``, ``auth_comp_id``, ``auth_asym_id``, ``auth_seq_id``, ``pdbx_PDB_model_num``, ``is-het``, ``operator-name``.*

-------------------

## Properties

## Secondary Structure

## Atom Sets

## Atom Set Sequences


Not yet implemented
===================

### **atom-set**&nbsp;&nbsp;&nbsp;``structure.constructor.atom-set :: (atom-indices: number+) => atom-set``

*A list of atom indices. This is a bit dodgy because the ordering can be de-facto orginary. Not 100% about including this into the language.*

-------------------

### **atom-selection**&nbsp;&nbsp;&nbsp;``structure.constructor.atom-selection :: (sets: atom-set*) => atom-selection``

-------------------

### **modify**&nbsp;&nbsp;&nbsp;``structure.primitive.modify :: (seq: atom-selection, f: atom-selection) => atom-selection``

-------------------

### **combine**&nbsp;&nbsp;&nbsp;``structure.primitive.combine :: (combinator: atom-selection, seqs: atom-selection+) => atom-selection``

-------------------

### **connected-components**&nbsp;&nbsp;&nbsp;``structure.generator.connected-components :: atom-selection``

*Returns all covalently connected components.*

-------------------

### **filter**&nbsp;&nbsp;&nbsp;``structure.modifier.filter :: (seq: atom-selection, predicate: bool) => atom-selection``

-------------------

### **find-in**&nbsp;&nbsp;&nbsp;``structure.modifier.find-in :: (seq: atom-selection, query: atom-selection) => atom-selection``

*Executes the specified query in the context induced by each of the atoms sets in the sequence.*

-------------------

### **intersect-with**&nbsp;&nbsp;&nbsp;``structure.combinator.intersect-with :: atom-selection``

-------------------

### **merge**&nbsp;&nbsp;&nbsp;``structure.combinator.merge :: atom-selection``

-------------------

### **union**&nbsp;&nbsp;&nbsp;``structure.combinator.union :: atom-selection``

*Collects all atom sets in the sequence into a single atom set.*

-------------------

### **near**&nbsp;&nbsp;&nbsp;``structure.combinator.near :: (max-distance: number) => atom-selection``

*Merges all tuples of atom sets that are mutually no further than the specified threshold.*

-------------------

### **atom-key**&nbsp;&nbsp;&nbsp;``structure.attribute.atom-key :: any-value``

-------------------

### **residue-key**&nbsp;&nbsp;&nbsp;``structure.attribute.residue-key :: any-value``

-------------------

### **chain-key**&nbsp;&nbsp;&nbsp;``structure.attribute.chain-key :: any-value``

-------------------

### **entity-key**&nbsp;&nbsp;&nbsp;``structure.attribute.entity-key :: any-value``

-------------------

### **unique-id**&nbsp;&nbsp;&nbsp;``structure.property.secondary-structure.unique-id :: any-value``

*Returns an implementation specific unique identifier of the current secondary structure element.*

-------------------

### **atom-count**&nbsp;&nbsp;&nbsp;``structure.property.atom-set.atom-count :: number``

-------------------

### **accumulator**&nbsp;&nbsp;&nbsp;``structure.property.atom-set.reduce.accumulator :: (value: any-value, initial: any-value) => any-value``

*Compute a property of an atom set based on it's properties. The current value is assigned to the 0-th slot [``(primitive.functional.slot 0)``].*

-------------------

### **value**&nbsp;&nbsp;&nbsp;``structure.property.atom-set.reduce.value :: any-value``

*Current value of the accumulator.*

-------------------

### **property-set**&nbsp;&nbsp;&nbsp;``structure.property.atom-set.property-set :: (prop: any-value) => set``

*Returns a set of unique properties from all atoms within the current atom set.*

-------------------

### **length**&nbsp;&nbsp;&nbsp;``structure.property.atom-selection.length :: (seq: atom-selection) => atom-selection``

-------------------

### **property-set**&nbsp;&nbsp;&nbsp;``structure.property.atom-selection.property-set :: (prop: any-value, seq: atom-selection) => set``

*Returns a set of unique properties from all atoms within the source sequence.*

-------------------

