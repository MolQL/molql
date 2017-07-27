/*
 * Copyright (c) 2017 David Sehnal, licensed under MIT, See LICENSE file for more info.
 */

 const elementSymbolCache: { [value: string]: string } = Object.create(null);

export function normalizeElementSymbol(symbol: any): string {
    let val = elementSymbolCache[symbol];
    if (val) return val;
    val = typeof symbol === 'string' ? symbol.toUpperCase() : `${symbol}`.toUpperCase();
    elementSymbolCache[symbol] = val;
    return val;
}