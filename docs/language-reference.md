
Language Reference
==================


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

## Functional Operators

### **slot**&nbsp;&nbsp;&nbsp;``primitive.functional.slot :: (index: number) => any-value``

*Evaluates into a value assigned to a slot with this index in the runtime environment. Useful for example for ``atomSet.reduce``.*

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

## Collections

### **in-set**&nbsp;&nbsp;&nbsp;``primitive.operator.collections.in-set :: (set: set, value: any-value) => bool``

-------------------

### **map-get**&nbsp;&nbsp;&nbsp;``primitive.operator.collections.map-get :: (map: map, key: any-value, default: any-value) => any-value``

-------------------

# Molecular Structure Queries

## Constructors

### **element-symbol**&nbsp;&nbsp;&nbsp;``structure.constructor.element-symbol :: (symbol: string) => element-symbol``

-------------------

## Generators

### **atom-groups**&nbsp;&nbsp;&nbsp;``structure.generator.atom-groups :: (entity-predicate: bool, chain-predicate: bool, residue-predicate: bool, atom-predicate: bool, group-by: ?any-value) => atom-set-seq``

-------------------

## Atom Set Modifiers

## Sequence Combinators

## Properties

## Atoms

### **unique-id**&nbsp;&nbsp;&nbsp;``structure.property.atom.unique-id :: any-value``

*Returns an implementation specific unique identifier of the current atom.*

-------------------

### **id**&nbsp;&nbsp;&nbsp;``structure.property.atom.id :: number``

-------------------

### **Cartn_x**&nbsp;&nbsp;&nbsp;``structure.property.atom.Cartn_x :: number``

-------------------

### **Cartn_y**&nbsp;&nbsp;&nbsp;``structure.property.atom.Cartn_y :: number``

-------------------

### **Cartn_z**&nbsp;&nbsp;&nbsp;``structure.property.atom.Cartn_z :: number``

-------------------

### **label_atom_id**&nbsp;&nbsp;&nbsp;``structure.property.atom.label_atom_id :: string``

-------------------

### **type_symbol**&nbsp;&nbsp;&nbsp;``structure.property.atom.type_symbol :: string``

-------------------

### **occupancy**&nbsp;&nbsp;&nbsp;``structure.property.atom.occupancy :: number``

-------------------

### **B_iso_or_equiv**&nbsp;&nbsp;&nbsp;``structure.property.atom.B_iso_or_equiv :: number``

-------------------

## Residues

### **unique-id**&nbsp;&nbsp;&nbsp;``structure.property.residue.unique-id :: any-value``

*Returns an implementation specific unique identifier of the current residue.*

-------------------

### **is-het**&nbsp;&nbsp;&nbsp;``structure.property.residue.is-het :: string``

-------------------

### **label_seq_id**&nbsp;&nbsp;&nbsp;``structure.property.residue.label_seq_id :: number``

-------------------

### **label_comp_id**&nbsp;&nbsp;&nbsp;``structure.property.residue.label_comp_id :: string``

-------------------

### **pdbx_PDB_ins_code**&nbsp;&nbsp;&nbsp;``structure.property.residue.pdbx_PDB_ins_code :: string``

-------------------

## Chains

### **unique-id**&nbsp;&nbsp;&nbsp;``structure.property.chain.unique-id :: any-value``

*Returns an implementation specific unique identifier of the current chain.*

-------------------

### **label_asym_id**&nbsp;&nbsp;&nbsp;``structure.property.chain.label_asym_id :: string``

-------------------

## Entities

### **unique-id**&nbsp;&nbsp;&nbsp;``structure.property.entity.unique-id :: any-value``

*Returns an implementation specific unique identifier of the current entity.*

-------------------

### **label_entity_id**&nbsp;&nbsp;&nbsp;``structure.property.entity.label_entity_id :: string``

-------------------

## Model

## Secondary Structure

## Atom Sets

### **atom-count**&nbsp;&nbsp;&nbsp;``structure.property.atom-set.atom-count :: number``

-------------------

## Atom Set Sequences

### **length**&nbsp;&nbsp;&nbsp;``structure.property.atom-set-seq.length :: (seq: atom-set-seq) => atom-set-seq``

-------------------


Not yet implemented
===================

### **atom-set**&nbsp;&nbsp;&nbsp;``structure.constructor.atom-set :: (atom-indices: number+) => atom-set``

-------------------

### **atom-set-seq**&nbsp;&nbsp;&nbsp;``structure.constructor.atom-set-seq :: (sets: atom-set*) => atom-set-seq``

-------------------

### **modify**&nbsp;&nbsp;&nbsp;``structure.primitive.modify :: (seq: atom-set-seq, f: atom-set-seq) => atom-set-seq``

-------------------

### **combine**&nbsp;&nbsp;&nbsp;``structure.primitive.combine :: (combinator: atom-set-seq, seqs: atom-set-seq+) => atom-set-seq``

-------------------

### **connected-components**&nbsp;&nbsp;&nbsp;``structure.generator.connected-components :: atom-set-seq``

*Returns all covalently connected components.*

-------------------

### **filter**&nbsp;&nbsp;&nbsp;``structure.modifier.filter :: (predicate: bool) => atom-set-seq``

-------------------

### **find**&nbsp;&nbsp;&nbsp;``structure.modifier.find :: (query: atom-set-seq) => atom-set-seq``

*Executes the specified query in the context induced by each of the atoms sets in the sequence.*

-------------------

### **intersect-with**&nbsp;&nbsp;&nbsp;``structure.combinator.intersect-with :: atom-set-seq``

-------------------

### **merge**&nbsp;&nbsp;&nbsp;``structure.combinator.merge :: atom-set-seq``

-------------------

### **union**&nbsp;&nbsp;&nbsp;``structure.combinator.union :: atom-set-seq``

*Collects all atom sets in the sequence into a single atom set.*

-------------------

### **near**&nbsp;&nbsp;&nbsp;``structure.combinator.near :: (max-distance: number) => atom-set-seq``

*Merges all tuples of atom sets that are mutually no further than the specified threshold.*

-------------------

### **operator-name**&nbsp;&nbsp;&nbsp;``structure.property.atom.operator-name :: string``

*Returns the name of the symmetry operator applied to this atom (e.g., 4_455). Atoms from the loaded asymmetric always return 1_555. Probably should have specific type constructor for this?*

-------------------

### **is-modified**&nbsp;&nbsp;&nbsp;``structure.property.residue.is-modified :: bool``

-------------------

### **pdbx_PDB_model_num**&nbsp;&nbsp;&nbsp;``structure.property.model.pdbx_PDB_model_num :: string``

-------------------

### **unique-id**&nbsp;&nbsp;&nbsp;``structure.property.secondaryStructure.unique-id :: any-value``

*Returns an implementation specific unique identifier of the current secondary structure element.*

-------------------

### **is-amino**&nbsp;&nbsp;&nbsp;``structure.property.atom-set.is-amino :: bool``

*Is the current atom set formed solely from amino acid atoms?*

-------------------

### **is-nucleotide**&nbsp;&nbsp;&nbsp;``structure.property.atom-set.is-nucleotide :: bool``

*Is the current atom set formed solely from nucleotide atoms?*

-------------------

### **is-ligand**&nbsp;&nbsp;&nbsp;``structure.property.atom-set.is-ligand :: bool``

*Is the current atom set formed solely from ligand atoms?*

-------------------

### **reduce**&nbsp;&nbsp;&nbsp;``structure.property.atom-set.reduce :: (f: any-value->any-value, initial: any-value) => any-value``

*Compute a property of an atom set based on it's properties. The current value is assigned to the 0-th slot [``(primitive.functional.slot 0)``].*

-------------------

### **property-set**&nbsp;&nbsp;&nbsp;``structure.property.atom-set-seq.property-set :: (prop: any-value, seq: atom-set-seq) => set``

*Returns a set of unique properties from all atoms within the source sequence.*

-------------------

