/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

const upperCaseCache: { [value: string]: string } = Object.create(null);
export default function toUpperCase(value: any): string {
    if (!value) return '';
    let upper = upperCaseCache[value];
    if (upper) return upper;
    upper = typeof value === 'string' ? value.toUpperCase() : `${value}`.toUpperCase();
    upperCaseCache[value] = upper;
    return upper;
}