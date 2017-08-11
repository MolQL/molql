/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

export interface UniqueArrayBuilder<T> { _keys: any, array: T[] }
export function UniqueArrayBuilder<T>(): UniqueArrayBuilder<T> { return { _keys: Object.create(null), array: [] } }

export namespace UniqueArrayBuilder {
    export function add<T>({ _keys, array }: UniqueArrayBuilder<T>, key: string | number, value: any) {
        if (_keys[key] === 1) return false;
        _keys[key] = 1;
        array.push(value);
        return true;
    }
}

function _ascSort(a: number, b: number) {
    return a - b;
}

export function sortAsc<T extends ArrayLike<number>>(array: T): T {
    Array.prototype.sort.call(array, _ascSort);
    return array;
}

/**
 * An "object" based implementation of map that supports string and numeric keys
 * which should be ok for most use cases in LiteMol.
 *
 * The type limitation is on purpose to prevent using the type in places that are
 * not appropriate.
 */
export interface FastMap<K extends string | number, V> {
    readonly size: number;
    set(key: K, v: V): void;
    get(key: K): V | undefined;
    delete(key: K): boolean;
    has(key: K): boolean;
    clear(): void;
    /**
     * Iterate over the collection.
     * Optional "context" object can be supplied that is passed to the callback.
     *
     * Enumerates only values that are not undefined.
     */
    forEach<Context>(f: (value: V, key: K, ctx?: Context) => void, ctx?: Context): void;
}

/**
 * An "object" based implementation of set that supports string and numeric values
 * which should be ok for most use cases in LiteMol.
 *
 * The type limitation is on purpose to prevent using the type in places that are
 * not appropriate.
 */
export interface FastSet<T extends string | number> {
    readonly size: number;
    add(key: T): boolean;
    delete(key: T): boolean;
    has(key: T): boolean;
    clear(): void;
    /**
     * Iterate over the collection.
     * Optional "context" object can be supplied that is passed to the callback.
     */
    forEach<Context>(f: (key: T, ctx?: Context) => boolean | any, ctx?: Context): void;
}

function createMapObject() {
    const map = Object.create(null);
    // to cause deoptimization as we don't want to create hidden classes
    map['__'] = void 0;
    delete map['__'];
    return map;
}

type MapData = { data: any, size: number }

export namespace FastMap {
    function forEach(data: any, f: (value: any, key: any, ctx: any) => void, ctx: any) {
        for (const key of Object.keys(data)) {
            const v = data[key];
            if (v === void 0) continue;
            f(v, key, ctx);
        }
    }

    const fastMap = {
        set(this: MapData, key: string | number, v: any) {
            if (this.data[key] === void 0 && v !== void 0) {
                this.size++;
            }
            this.data[key] = v;
        },
        get(this: MapData, key: string | number) {
            return this.data[key];
        },
        delete(this: MapData, key: string | number) {
            if (this.data[key] === void 0) return false;
            delete this.data[key];
            this.size--;
            return true;
        },
        has(this: MapData, key: string | number) {
            return this.data[key] !== void 0;
        },
        clear(this: MapData) {
            this.data = createMapObject();
            this.size = 0;
        },
        forEach(this: MapData, f: (k: string | number, v: number, ctx?: any) => void, ctx?: any) {
            forEach(this.data, f, ctx !== void 0 ? ctx : void 0);
        }
    };

    /**
     * Creates an empty map.
     */
    export function create<K extends string | number, V>(): FastMap<K, V> {
        const ret = Object.create(fastMap) as any;
        ret.data = createMapObject();
        ret.size = 0;
        return ret;
    }

    /**
     * Create a map from an array of the form [[key, value], ...]
     */
    export function ofArray<K extends string | number, V>(data: [K, V][]) {
        const ret = create<K, V>();
        for (const xs of data) {
            ret.set(xs[0] as K, xs[1] as V);
        }
        return ret;
    }

    /**
     * Create a map from an object of the form { key: value, ... }
     */
    export function ofObject<V>(data: { [key: string]: V }) {
        const ret = create<string, V>();
        for (const key of Object.keys(data)) {
            const v = data[key];
            ret.set(key, v);
        }
        return ret;
    }
}

export namespace FastSet {
    function forEach(data: any, f: (k: string | number, ctx: any) => boolean | void, ctx: any) {
        for (const p of Object.keys(data)) {
            if (data[p] !== null) continue;
            if (f(p, ctx) === false) break;
        }
    }


    /**
     * Uses null for present values.
     */
    const fastSet = {
        add(this: MapData, key: string | number) {
            if (this.data[key] === null) return false;
            this.data[key] = null;
            this.size++;
            return true;
        },
        delete(this: MapData, key: string | number) {
            if (this.data[key] !== null) return false;
            delete this.data[key];
            this.size--;
            return true;
        },
        has(this: MapData, key: string | number) {
            return this.data[key] === null;
        },
        clear(this: MapData) {
            this.data = createMapObject();
            this.size = 0;
        },
        forEach(this: MapData, f: (k: string | number, ctx: any) => void, ctx?: any) {
            forEach(this.data, f, ctx !== void 0 ? ctx : void 0);
        }
    };

    /**
     * Create an empty set.
     */
    export function create<T extends string | number>(): FastSet<T> {
        const ret = Object.create(fastSet) as any;
        ret.data = createMapObject();
        ret.size = 0;
        return ret;
    }

    /**
     * Create a set of an "array like" sequence.
     */
    export function ofArray<T extends string | number>(xs: ArrayLike<T>) {
        const ret = create<T>();
        for (let i = 0, l = xs.length; i < l; i++) {
            ret.add(xs[i]);
        }
        return ret;
    }
}
