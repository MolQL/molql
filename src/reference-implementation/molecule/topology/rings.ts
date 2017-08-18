/*
 * Copyright (c) 2017 MolQL contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import { Model, Bonds } from '../data'

export function computeRings(model: Model) {
    const size = largestResidue(model);
    const state = State(model, size);

    for (let i = 0, _i = model.residues.count; i < _i; i++) {
        processResidue(state, i);
    }

    return state.rings;
}

const enum Constants {
    MaxDepth = 4
}

interface State {
    startVertex: number,
    endVertex: number,
    count: number,
    visited: Int32Array,
    queue: Int32Array,
    color: Int32Array,
    pred: Int32Array,

    left: Int32Array,
    right: Int32Array,

    currentColor: number,

    rings: number[][],
    bonds: Bonds,
    model: Model
}

function State(model: Model, capacity: number): State {
    return {
        startVertex: 0,
        endVertex: 0,
        count: 0,
        visited: new Int32Array(capacity),
        queue: new Int32Array(capacity),
        pred: new Int32Array(capacity),
        left: new Int32Array(Constants.MaxDepth),
        right: new Int32Array(Constants.MaxDepth),
        color: new Int32Array(capacity),
        currentColor: 0,
        rings: [],
        model,
        bonds: Model.bonds(model)
    };
}

function resetState(state: State) {
    state.count = state.endVertex - state.startVertex;
    const { visited, pred, color } = state;
    for (let i = 0; i < state.count; i++) {
        visited[i] = -1;
        pred[i] = -1;
        color[i] = 0;
    }
    state.currentColor = 0;
}

function largestResidue({ residues }: Model) {
    const { atomStartIndex, atomEndIndex, count } = residues;
    let size = 0;
    for (let i = 0; i < count; i++) size = Math.max(size, atomEndIndex[i] - atomStartIndex[i]);
    return size;
}

function processResidue(state: State, rI: number) {
    const { atomStartIndex, atomEndIndex } = state.model.residues;
    const { visited } = state;
    state.startVertex = atomStartIndex[rI];
    state.endVertex = atomEndIndex[rI];

    // no two atom rings
    if (state.endVertex - state.startVertex < 3) return;

    resetState(state);

    for (let i = 0; i < state.count; i++) {
        if (visited[i] >= 0) continue;
        findRings(state, i);
    }
}

function addRing(state: State, a: number, b: number) {
    // only "monotonous" rings
    if (b < a) return;

    const { pred, color, left, right } = state;
    const nc = ++state.currentColor;

    let current = a;

    for (let t = 0; t < Constants.MaxDepth; t++) {
        color[current] = nc;
        current = pred[current];
        if (current < 0) break;
    }

    let leftOffset = 0, rightOffset = 0;

    let found = false, target = 0;
    current = b;
    for (let t = 0; t < Constants.MaxDepth; t++) {
        if (color[current] === nc) {
            target = current;
            found = true;
            break;
        }
        right[rightOffset++] = current;
        current = pred[current];
        if (current < 0) break;
    }
    if (!found) return;

    current = a;
    for (let t = 0; t < Constants.MaxDepth; t++) {
        left[leftOffset++] = current;
        if (target === current) break;
        current = pred[current];
        if (current < 0) break;
    }

    const ring = new Int32Array(leftOffset + rightOffset);
    let ringOffset = 0;
    for (let t = 0; t < leftOffset; t++) ring[ringOffset++] = state.startVertex + left[t];
    for (let t = rightOffset - 1; t >= 0; t--) ring[ringOffset++] = state.startVertex + right[t];

    state.rings.push(ring as any as number[]);
}

function findRings(state: State, from: number) {
    const { bonds, startVertex, endVertex, visited, queue, pred } = state;
    const { neighbor, flags: bondFlags, offset } = bonds;
    visited[from] = 1;
    queue[0] = from;
    let head = 0, size = 1;

    while (head < size) {
        const top = queue[head++];
        const a = startVertex + top;
        const start = offset[a], end = offset[a + 1];

        //const _depth = visited[top];

        for (let i = start; i < end; i++) {
            const b = neighbor[i];
            if (b < startVertex || b >= endVertex || !Bonds.isCovalent(bondFlags[i])) continue;

            const other = b - startVertex;

            if (visited[other] > 0) {
                if (pred[other] !== top && pred[top] !== other) addRing(state, top, other);
                continue;
            }

            visited[other] = 1;
            queue[size++] = other;
            pred[other] = top;
        }
    }
}