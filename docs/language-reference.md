
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

### **bool**
``primitive.type.bool :: (value) => bool``

-------------------

### **num**
``primitive.type.num :: (value) => number``

-------------------

### **str**
``primitive.type.str :: (value) => string``

-------------------

### **set**
``primitive.type.set :: (value*) => set``

-------------------

### **map**
``primitive.type.map :: (value*) => map``

*Create a map from a list of key value pairs, e.g. (map 1 "x" 2 "y").*

-------------------

### **regex**
``primitive.type.regex :: (string, string) => regex``

*Creates a regular expression from a string using the ECMAscript syntax.*

-------------------

## Operators

## Logic

### **not**
``primitive.operator.logic.not :: (bool) => bool``

-------------------

### **and**
``primitive.operator.logic.and :: (bool*) => bool``

-------------------

### **or**
``primitive.operator.logic.or :: (bool*) => bool``

-------------------

## Control Flow

### **if**
``primitive.operator.control-flow.if :: (cond: bool, if-true: value, if-false: value) => value``

-------------------

## Arithmetic

### **add**
``primitive.operator.arithmetic.add :: (number*) => number``

-------------------

### **sub**
``primitive.operator.arithmetic.sub :: (number*) => number``

-------------------

### **mult**
``primitive.operator.arithmetic.mult :: (number*) => number``

-------------------

### **div**
``primitive.operator.arithmetic.div :: (number, number) => number``

-------------------

### **pow**
``primitive.operator.arithmetic.pow :: (number, number) => number``

-------------------

### **min**
``primitive.operator.arithmetic.min :: (number*) => number``

-------------------

### **max**
``primitive.operator.arithmetic.max :: (number*) => number``

-------------------

### **floor**
``primitive.operator.arithmetic.floor :: (number) => number``

-------------------

### **ceil**
``primitive.operator.arithmetic.ceil :: (number) => number``

-------------------

### **round-int**
``primitive.operator.arithmetic.round-int :: (number) => number``

-------------------

### **abs**
``primitive.operator.arithmetic.abs :: (number) => number``

-------------------

### **sqrt**
``primitive.operator.arithmetic.sqrt :: (number) => number``

-------------------

### **sin**
``primitive.operator.arithmetic.sin :: (number) => number``

-------------------

### **cos**
``primitive.operator.arithmetic.cos :: (number) => number``

-------------------

### **tan**
``primitive.operator.arithmetic.tan :: (number) => number``

-------------------

### **asin**
``primitive.operator.arithmetic.asin :: (number) => number``

-------------------

### **acos**
``primitive.operator.arithmetic.acos :: (number) => number``

-------------------

### **atan**
``primitive.operator.arithmetic.atan :: (number) => number``

-------------------

### **sinh**
``primitive.operator.arithmetic.sinh :: (number) => number``

-------------------

### **cosh**
``primitive.operator.arithmetic.cosh :: (number) => number``

-------------------

### **tanh**
``primitive.operator.arithmetic.tanh :: (number) => number``

-------------------

### **exp**
``primitive.operator.arithmetic.exp :: (number) => number``

-------------------

### **log**
``primitive.operator.arithmetic.log :: (number) => number``

-------------------

### **log10**
``primitive.operator.arithmetic.log10 :: (number) => number``

-------------------

### **atan2**
``primitive.operator.arithmetic.atan2 :: (number, number) => number``

-------------------

## Relational

### **eq**
``primitive.operator.relational.eq :: (value, value) => bool``

-------------------

### **neq**
``primitive.operator.relational.neq :: (value, value) => bool``

-------------------

### **lt**
``primitive.operator.relational.lt :: (number, number) => bool``

-------------------

### **lte**
``primitive.operator.relational.lte :: (number, number) => bool``

-------------------

### **gr**
``primitive.operator.relational.gr :: (number, number) => bool``

-------------------

### **gre**
``primitive.operator.relational.gre :: (number, number) => bool``

-------------------

### **in-range**
``primitive.operator.relational.in-range :: (number, number, number) => bool``

-------------------

## Strings

### **concat**
``primitive.operator.string.concat :: (string*) => string``

-------------------

### **match**
``primitive.operator.string.match :: (regex, string) => bool``

-------------------

## Sets

### **has**
``primitive.operator.set.has :: (set, value) => bool``

-------------------

## Maps

### **has**
``primitive.operator.map.has :: (map, value) => bool``

-------------------

### **get**
``primitive.operator.map.get :: (map, value, value) => value``

-------------------

## Types

### **element-symbol**
``structure.type.element-symbol :: (string) => element-symbol``

-------------------

### **auth-residue-id**
``structure.type.auth-residue-id :: (string, number, string) => element-symbol``

-------------------

## Generators

### **atom-groups**
``structure.generator.atom-groups :: (entity-test?: bool, chain-test?: bool, residue-test?: bool, atom-test?: bool, group-by?: value) => atom-selection``

-------------------

## Selection Modifications

### **query-each**
``structure.modifier.query-each :: (selection: atom-selection, query: atom-selection, whole-residues?: bool) => atom-selection``

-------------------

### **query-complement**
``structure.modifier.query-complement :: (selection: atom-selection, query: atom-selection) => atom-selection``

*Execute the query in a complement induced by the selection.*

-------------------

### **intersect-by**
``structure.modifier.intersect-by :: (selection: atom-selection, by: atom-selection) => atom-selection``

*Intersect each atom set from the first sequence from atoms in the second one.*

-------------------

### **except-by**
``structure.modifier.except-by :: (selection: atom-selection, by: atom-selection) => atom-selection``

*Remove all atoms from 'selection' that occur in 'by'.*

-------------------

### **union-by**
``structure.modifier.union-by :: (selection: atom-selection, by: atom-selection) => atom-selection``

*For each atom set A in the orginal sequence, combine all atoms sets in the target selection that intersect with A.*

-------------------

### **union**
``structure.modifier.union :: (selection: atom-selection) => atom-selection``

*Collects all atom sets in the sequence into a single atom set.*

-------------------

### **cluster**
``structure.modifier.cluster :: (selection: atom-selection, radius: number) => atom-selection``

*Combines are atom sets that are mutatually not further radius apart.*

-------------------

### **include-surroundings**
``structure.modifier.include-surroundings :: (selection: atom-selection, radius: number, as-whole-residues?: bool) => atom-selection``

-------------------

## Selection Filters

### **pick**
``structure.filter.pick :: (selection: atom-selection, test: bool) => atom-selection``

*Pick all atom sets that satisfy the test.*

-------------------

### **with-same-properties**
``structure.filter.with-same-properties :: (selection: atom-selection, source: atom-selection, property: value) => atom-selection``

-------------------

### **within**
``structure.filter.within :: (selection: atom-selection, target: atom-selection, radius: number) => atom-selection``

*All atom sets from section that are within the radius of any atom from target*

-------------------

## Selection Combinators

### **intersect**
``structure.combinator.intersect :: (atom-selection*) => atom-selection``

*Return all unique atom sets that appear in all of the source selections.*

-------------------

### **merge**
``structure.combinator.merge :: (atom-selection*) => atom-selection``

*Merges multiple selections into a single one. Only unique atom sets are kept.*

-------------------

### **near**
``structure.combinator.near :: (number, atom-selection*) => atom-selection``

*Pick combinations of atom sets from the source sequences that are mutually no more than radius apart.*

-------------------

## Atom Sets

### **atom-count**
``structure.atom-set.atom-count :: () => number``

-------------------

### **count**
``structure.atom-set.count :: (query: atom-selection) => number``

*Counts the number of occurences of a specific query inside the current atom set.*

-------------------

## Atom Set Reducer

### **accumulator**
``structure.atom-set.reduce.accumulator :: (value, value) => value``

-------------------

### **value**
``structure.atom-set.reduce.value :: () => value``

*Current value of the reducer.*

-------------------

## Atom Properties

### **group_PDB**
``structure.atom-property.group_PDB :: () => string``

*Same as mmCIF*

-------------------

### **id**
``structure.atom-property.id :: () => number``

*Same as mmCIF*

-------------------

### **type_symbol**
``structure.atom-property.type_symbol :: () => element-symbol``

*Same as mmCIF*

-------------------

### **label_atom_id**
``structure.atom-property.label_atom_id :: () => string``

*Same as mmCIF*

-------------------

### **label_alt_id**
``structure.atom-property.label_alt_id :: () => string``

*Same as mmCIF*

-------------------

### **label_comp_id**
``structure.atom-property.label_comp_id :: () => string``

*Same as mmCIF*

-------------------

### **label_asym_id**
``structure.atom-property.label_asym_id :: () => string``

*Same as mmCIF*

-------------------

### **label_entity_id**
``structure.atom-property.label_entity_id :: () => string``

*Same as mmCIF*

-------------------

### **label_seq_id**
``structure.atom-property.label_seq_id :: () => number``

*Same as mmCIF*

-------------------

### **pdbx_PDB_ins_code**
``structure.atom-property.pdbx_PDB_ins_code :: () => string``

*Same as mmCIF*

-------------------

### **pdbx_formal_charge**
``structure.atom-property.pdbx_formal_charge :: () => number``

*Same as mmCIF*

-------------------

### **Cartn_x**
``structure.atom-property.Cartn_x :: () => number``

*Same as mmCIF. Using this value, beacuse adding Frac_x, etc. might be an option in the future.*

-------------------

### **Cartn_y**
``structure.atom-property.Cartn_y :: () => number``

*Same as mmCIF. Using this value, beacuse adding Frac_x, etc. might be an option in the future.*

-------------------

### **Cartn_z**
``structure.atom-property.Cartn_z :: () => number``

*Same as mmCIF. Using this value, beacuse adding Frac_x, etc. might be an option in the future.*

-------------------

### **occupancy**
``structure.atom-property.occupancy :: () => number``

*Same as mmCIF*

-------------------

### **B_iso_or_equiv**
``structure.atom-property.B_iso_or_equiv :: () => number``

*Same as mmCIF*

-------------------

### **auth_atom_id**
``structure.atom-property.auth_atom_id :: () => string``

*Same as mmCIF*

-------------------

### **auth_comp_id**
``structure.atom-property.auth_comp_id :: () => string``

*Same as mmCIF*

-------------------

### **auth_asym_id**
``structure.atom-property.auth_asym_id :: () => string``

*Same as mmCIF*

-------------------

### **auth_seq_id**
``structure.atom-property.auth_seq_id :: () => number``

*Same as mmCIF*

-------------------

### **pdbx_PDB_model_num**
``structure.atom-property.pdbx_PDB_model_num :: () => number``

*Same as mmCIF*

-------------------

### **atom-key**
``structure.atom-property.atom-key :: () => value``

*Unique value for each atom. Main use case is grouping of atoms.*

-------------------

### **residue-key**
``structure.atom-property.residue-key :: () => value``

*Unique value for each tuple ``(label_entity_id,auth_asym_id,auth_seq_id,pdbx_PDB_ins_code)``. Main use case is grouping of atoms.*

-------------------

### **chain-key**
``structure.atom-property.chain-key :: () => value``

*Unique value for each tuple ``(label_entity_id,auth_asym_id)``. Main use case is grouping of atoms.*

-------------------

### **entity-key**
``structure.atom-property.entity-key :: () => value``

*Unique value for each tuple ``label_entity_id``. Main use case is grouping of atoms.*

-------------------

### **residue-id**
``structure.atom-property.residue-id :: () => residue-id``

*Corresponds to tuple (auth_asym_id, auth_seq_id, pdbx_PDB_ins_code)*

-------------------

### **is-het**
``structure.atom-property.is-het :: () => number``

*For mmCIF files, Same as group_PDB !== ATOM*

-------------------

