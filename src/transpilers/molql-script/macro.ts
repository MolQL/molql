/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

export function getPositionalArgs(args: any) {
    return Object.keys(args)
        .filter(k => !isNaN(k as any))
        .map(k => +k)
        .sort((a, b) => a - b)
        .map(k => args[k]);
}

export function tryGetArg(args: any, name: string | number, defaultValue: any) {
    return (args && args[name] !== void 0) ? args[name] : defaultValue;
}

export function pickArgs(args: any, ...names: string[]) {
    const ret = Object.create(null);
    let count = 0;
    for (let k of Object.keys(args)) {
        if (names.indexOf(k) >= 0) {
            ret[k] = args[k];
            count++;
        }
    }
    return count ? ret : void 0;
}
