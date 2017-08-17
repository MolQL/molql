/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

interface BondAddress { atomA: number, atomB: number, flags: number, order: number }
function BondAddress(): BondAddress { return { atomA: 0, atomB: 0, flags: 0, order: 0 }; }

export default BondAddress;