// function _atomSetPropertySet(env: Environment, atomSet: AtomSet, prop: RuntimeExpression, set: FastSet<any>) {
//     const ctx = env.queryCtx;
//     const element = Environment.beginIterateElemement(env);
//     for (const a of AtomSet.atomIndices(atomSet)) {
//         ElementAddress.setAtom(ctx, element, a);
//         const p = prop(env);
//         if (p !== void 0) set.add(prop(env));
//     }
//     Environment.endIterateElement(env);

//     return set;
// }

// export function atomSetPropertySet(env: Environment, prop: RuntimeExpression, set: AtomSet) {
//     return _atomSetPropertySet(env, set, prop, FastSet.create());
// }

// export function selectionPropertySet(env: Environment, prop: RuntimeExpression, selection: AtomSelection) {
//     const set = FastSet.create<any>();
//     for (const atomSet of AtomSelection.atomSets(selection)) {
//         _atomSetPropertySet(env, atomSet, prop, set);
//     }
//     return set;
// }

// export function accumulateAtomSet(env: Environment, initial: RuntimeExpression, f: RuntimeExpression) {
//     // TODO: no nested accumulators
//     const ctx = env.queryCtx;
//     const slot = Slot.push(env.atomSetReducer, initial(env));
//     const element = Environment.beginIterateElemement(env);
//     for (const a of AtomSet.atomIndices(env.atomSet.value)) {
//         ElementAddress.setAtom(ctx, element, a);
//         slot.value = f(env);
//     }
//     Environment.endIterateElement(env);
//     return Slot.pop(slot);
// }