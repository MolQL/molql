
Language Reference
==================


   * [Langauge Primitives](#langauge-primitives)
     * [Types](#types)
     * [Operators](#operators)
       * [Logic](#logic)
       * [Control Flow](#control-flow)
       * [Arithmetic](#arithmetic)
       * [Relational](#relational)
       * [Strings](#strings)
       * [Sets](#sets)
       * [Maps](#maps)
     * [Types](#types)
     * [Generators](#generators)
     * [Selection Modifications](#selection-modifications)
     * [Selection Filters](#selection-filters)
     * [Selection Combinators](#selection-combinators)
     * [Atom Sets](#atom-sets)
       * [Atom Set Reducer](#atom-set-reducer)
     * [Atom Properties](#atom-properties)
# Langauge Primitives

## Types

### **bool**&nbsp;&nbsp;&nbsp;``primitive.type.bool :: (value) => bool``

-------------------

### **num**&nbsp;&nbsp;&nbsp;``primitive.type.num :: (value) => number``

-------------------

### **str**&nbsp;&nbsp;&nbsp;``primitive.type.str :: (value) => string``

-------------------

### **set**&nbsp;&nbsp;&nbsp;``primitive.type.set :: (value*) => set``

-------------------

### **map**&nbsp;&nbsp;&nbsp;``primitive.type.map :: (value*) => map``

*Create a map from a list of key value pairs, e.g. (map 1 "x" 2 "y").*

-------------------

### **regex**&nbsp;&nbsp;&nbsp;``primitive.type.regex :: (string, string) => regex``

*Creates a regular expression from a string using the ECMAscript syntax.*

-------------------

## Operators

## Logic

### **not**&nbsp;&nbsp;&nbsp;``primitive.operator.logic.not :: (bool) => bool``

-------------------

### **and**&nbsp;&nbsp;&nbsp;``primitive.operator.logic.and :: (bool*) => bool``

-------------------

### **or**&nbsp;&nbsp;&nbsp;``primitive.operator.logic.or :: (bool*) => bool``

-------------------

## Control Flow

### **if**&nbsp;&nbsp;&nbsp;``primitive.operator.control-flow.if :: (cond: bool, ifTrue: value, ifFalse: value) => value``

-------------------

## Arithmetic

### **add**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.add :: (number*) => number``

-------------------

### **sub**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.sub :: (number*) => number``

-------------------

### **mult**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.mult :: (number*) => number``

-------------------

### **div**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.div :: (number, number) => number``

-------------------

### **pow**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.pow :: (number, number) => number``

-------------------

### **min**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.min :: (number*) => number``

-------------------

### **max**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.max :: (number*) => number``

-------------------

### **floor**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.floor :: (number) => number``

-------------------

### **ceil**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.ceil :: (number) => number``

-------------------

### **round-int**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.round-int :: (number) => number``

-------------------

### **abs**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.abs :: (number) => number``

-------------------

### **sin**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.sin :: (number) => number``

-------------------

### **cos**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.cos :: (number) => number``

-------------------

### **tan**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.tan :: (number) => number``

-------------------

### **asin**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.asin :: (number) => number``

-------------------

### **acos**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.acos :: (number) => number``

-------------------

### **atan**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.atan :: (number) => number``

-------------------

### **atan2**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.atan2 :: (number, number) => number``

-------------------

### **sinh**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.sinh :: (number) => number``

-------------------

### **cosh**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.cosh :: (number) => number``

-------------------

### **tanh**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.tanh :: (number) => number``

-------------------

### **exp**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.exp :: (number) => number``

-------------------

### **log**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.log :: (number) => number``

-------------------

### **log10**&nbsp;&nbsp;&nbsp;``primitive.operator.arithmetic.log10 :: (number) => number``

-------------------

## Relational

### **eq**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.eq :: (value, value) => bool``

-------------------

### **neq**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.neq :: (value, value) => bool``

-------------------

### **lt**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.lt :: (number, number) => bool``

-------------------

### **lte**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.lte :: (number, number) => bool``

-------------------

### **gr**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.gr :: (number, number) => bool``

-------------------

### **gre**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.gre :: (number, number) => bool``

-------------------

### **in-range**&nbsp;&nbsp;&nbsp;``primitive.operator.relational.in-range :: (number, number, number) => bool``

-------------------

## Strings

### **concat**&nbsp;&nbsp;&nbsp;``primitive.operator.string.concat :: (string*) => string``

-------------------

### **match**&nbsp;&nbsp;&nbsp;``primitive.operator.string.match :: (regex, string) => bool``

-------------------

## Sets

### **has**&nbsp;&nbsp;&nbsp;``primitive.operator.set.has :: (set, value) => bool``

-------------------

## Maps

### **has**&nbsp;&nbsp;&nbsp;``primitive.operator.map.has :: (map, value) => bool``

-------------------

### **get**&nbsp;&nbsp;&nbsp;``primitive.operator.map.get :: (map, value, value) => value``

-------------------

## Types

### **element-symbol**&nbsp;&nbsp;&nbsp;``structure.type.element-symbol :: (string) => element-symbol``

-------------------

### **auth-residue-id**&nbsp;&nbsp;&nbsp;``structure.type.auth-residue-id :: (string, number, string) => element-symbol``

-------------------

### **label-residue-id**&nbsp;&nbsp;&nbsp;``structure.type.label-residue-id :: (string, string, number, string) => element-symbol``

-------------------

## Generators

### **atom-groups**&nbsp;&nbsp;&nbsp;``structure.generator.atom-groups :: (entity-test?: bool, chain-test?: bool, residue-test?: bool, atom-test?: bool, group-by?: value) => atom-selection``

-------------------

## Selection Modifications

### **include-surroundings**&nbsp;&nbsp;&nbsp;``structure.modifier.include-surroundings :: (selection: atom-selection, radius: number, wholeResidues?: bool) => atom-selection``

-------------------

### **query-each**&nbsp;&nbsp;&nbsp;``structure.modifier.query-each :: (selection: atom-selection, query: atom-selection, wholeResidues?: bool) => atom-selection``

-------------------

### **query-complement**&nbsp;&nbsp;&nbsp;``structure.modifier.query-complement :: (selection: atom-selection, query: atom-selection) => atom-selection``

*Execute the query in a complement induced by the selection.*

-------------------

### **intersect-by**&nbsp;&nbsp;&nbsp;``structure.modifier.intersect-by :: (selection: atom-selection, by: number, wholeResidues?: bool) => atom-selection``

*Intersect each atom set from the first sequence from atoms in the second one.*

-------------------

### **union-by**&nbsp;&nbsp;&nbsp;``structure.modifier.union-by :: (selection: atom-selection, by: number, wholeResidues?: bool) => atom-selection``

*For each atom set A in the orginal sequence, combine all atoms sets in the target selection that intersect with A.*

-------------------

### **except-by**&nbsp;&nbsp;&nbsp;``structure.modifier.except-by :: (selection: atom-selection, by: number) => atom-selection``

*Remove all atoms from 'selection' that occur in 'by'.*

-------------------

### **union**&nbsp;&nbsp;&nbsp;``structure.modifier.union :: (selection: atom-selection) => atom-selection``

*Collects all atom sets in the sequence into a single atom set.*

-------------------

### **cluster**&nbsp;&nbsp;&nbsp;``structure.modifier.cluster :: (selection: atom-selection, radius: number) => atom-selection``

*Combines are atom sets that are mutatually not further radius apart.*

-------------------

## Selection Filters

### **with-same-properties**&nbsp;&nbsp;&nbsp;``structure.filter.with-same-properties :: (selection: atom-selection, source: atom-selection, property: value) => atom-selection``

-------------------

### **within**&nbsp;&nbsp;&nbsp;``structure.filter.within :: (selection: atom-selection, target: atom-selection, radius: number) => atom-selection``

*All atom sets from section that are within the radius of any atom from target*

-------------------

### **pick**&nbsp;&nbsp;&nbsp;``structure.filter.pick :: (selection: atom-selection, test: bool) => atom-selection``

*Pick all atom sets that satisfy the test.*

-------------------

## Selection Combinators

### **intersect**&nbsp;&nbsp;&nbsp;``structure.combinator.intersect :: (atom-selection*) => atom-selection``

*Return all unique atom sets that appear in all of the source selections.*

-------------------

### **merge**&nbsp;&nbsp;&nbsp;``structure.combinator.merge :: (atom-selection*) => atom-selection``

*Merges multiple selections into a single one. Only unique atom sets are kept.*

-------------------

### **near**&nbsp;&nbsp;&nbsp;``structure.combinator.near :: (number, atom-selection*) => atom-selection``

*Pick combinations of atom sets from the source sequences that are mutually no more than radius apart.*

-------------------

## Atom Sets

### **atom-count**&nbsp;&nbsp;&nbsp;``structure.atom-set.atom-count :: () => number``

-------------------

### **count**&nbsp;&nbsp;&nbsp;``structure.atom-set.count :: (query: atom-selection) => number``

*Counts the number of occurences of a specific query inside the current atom set.*

-------------------

## Atom Set Reducer

### **accumulator**&nbsp;&nbsp;&nbsp;``structure.atom-set.reduce.accumulator :: (value, value) => value``

-------------------

### **value**&nbsp;&nbsp;&nbsp;``structure.atom-set.reduce.value :: () => value``

*Current value of the reducer.*

-------------------

## Atom Properties

### **group_PDB**&nbsp;&nbsp;&nbsp;``structure.atom-property.group_PDB :: () => string``

*Same as mmCIF*

-------------------

### **id**&nbsp;&nbsp;&nbsp;``structure.atom-property.id :: () => number``

*Same as mmCIF*

-------------------

### **type_symbol**&nbsp;&nbsp;&nbsp;``structure.atom-property.type_symbol :: () => element-symbol``

*Same as mmCIF*

-------------------

### **label_atom_id**&nbsp;&nbsp;&nbsp;``structure.atom-property.label_atom_id :: () => string``

*Same as mmCIF*

-------------------

### **label_alt_id**&nbsp;&nbsp;&nbsp;``structure.atom-property.label_alt_id :: () => string``

*Same as mmCIF*

-------------------

### **label_comp_id**&nbsp;&nbsp;&nbsp;``structure.atom-property.label_comp_id :: () => string``

*Same as mmCIF*

-------------------

### **label_asym_id**&nbsp;&nbsp;&nbsp;``structure.atom-property.label_asym_id :: () => string``

*Same as mmCIF*

-------------------

### **label_entity_id**&nbsp;&nbsp;&nbsp;``structure.atom-property.label_entity_id :: () => string``

*Same as mmCIF*

-------------------

### **label_seq_id**&nbsp;&nbsp;&nbsp;``structure.atom-property.label_seq_id :: () => number``

*Same as mmCIF*

-------------------

### **pdbx_PDB_ins_code**&nbsp;&nbsp;&nbsp;``structure.atom-property.pdbx_PDB_ins_code :: () => string``

*Same as mmCIF*

-------------------

### **pdbx_formal_charge**&nbsp;&nbsp;&nbsp;``structure.atom-property.pdbx_formal_charge :: () => string``

*Same as mmCIF*

-------------------

### **Cartn_x**&nbsp;&nbsp;&nbsp;``structure.atom-property.Cartn_x :: () => number``

*Same as mmCIF. Using this value, beacuse adding Frac_x, etc. might be an option in the future.*

-------------------

### **Cartn_y**&nbsp;&nbsp;&nbsp;``structure.atom-property.Cartn_y :: () => number``

*Same as mmCIF. Using this value, beacuse adding Frac_x, etc. might be an option in the future.*

-------------------

### **Cartn_z**&nbsp;&nbsp;&nbsp;``structure.atom-property.Cartn_z :: () => number``

*Same as mmCIF. Using this value, beacuse adding Frac_x, etc. might be an option in the future.*

-------------------

### **occupancy**&nbsp;&nbsp;&nbsp;``structure.atom-property.occupancy :: () => number``

*Same as mmCIF*

-------------------

### **B_iso_or_equiv**&nbsp;&nbsp;&nbsp;``structure.atom-property.B_iso_or_equiv :: () => number``

*Same as mmCIF*

-------------------

### **auth_atom_id**&nbsp;&nbsp;&nbsp;``structure.atom-property.auth_atom_id :: () => string``

*Same as mmCIF*

-------------------

### **auth_comp_id**&nbsp;&nbsp;&nbsp;``structure.atom-property.auth_comp_id :: () => string``

*Same as mmCIF*

-------------------

### **auth_asym_id**&nbsp;&nbsp;&nbsp;``structure.atom-property.auth_asym_id :: () => string``

*Same as mmCIF*

-------------------

### **auth_seq_id**&nbsp;&nbsp;&nbsp;``structure.atom-property.auth_seq_id :: () => number``

*Same as mmCIF*

-------------------

### **pdbx_PDB_model_num**&nbsp;&nbsp;&nbsp;``structure.atom-property.pdbx_PDB_model_num :: () => number``

*Same as mmCIF*

-------------------

### **atom-key**&nbsp;&nbsp;&nbsp;``structure.atom-property.atom-key :: () => value``

*Unique value for each atom. Main use case is grouping of atoms.*

-------------------

### **residue-key**&nbsp;&nbsp;&nbsp;``structure.atom-property.residue-key :: () => value``

*Unique value for each tuple ``(label_entity_id,auth_asym_id,auth_seq_id,pdbx_PDB_ins_code)``. Main use case is grouping of atoms.*

-------------------

### **chain-key**&nbsp;&nbsp;&nbsp;``structure.atom-property.chain-key :: () => value``

*Unique value for each tuple ``(label_entity_id,auth_asym_id)``. Main use case is grouping of atoms.*

-------------------

### **entity-key**&nbsp;&nbsp;&nbsp;``structure.atom-property.entity-key :: () => value``

*Unique value for each tuple ``label_entity_id``. Main use case is grouping of atoms.*

-------------------

### **residue-id**&nbsp;&nbsp;&nbsp;``structure.atom-property.residue-id :: () => residue-id``

*Corresponds to tuple (auth_asym_id, auth_seq_id, pdbx_PDB_ins_code)*

-------------------

### **label-residue-id**&nbsp;&nbsp;&nbsp;``structure.atom-property.label-residue-id :: () => residue-id``

*Corresponds to tuple (label_entity_id, label_asym_id, label_seq_id, pdbx_PDB_ins_code)*

-------------------

### **is-het**&nbsp;&nbsp;&nbsp;``structure.atom-property.is-het :: () => number``

*For mmCIF files, Same as group_PDB !== ATOM*

-------------------

