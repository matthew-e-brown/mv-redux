export type Vec2 = [number, number] & {
    type: 'vec2',
    get x(): number, set x(n: number),
    get y(): number, set y(n: number),
};

export type Vec3 = [number, number, number] & {
    type: 'vec3',
    get x(): number, set x(n: number),
    get y(): number, set y(n: number),
    get z(): number, set z(n: number),
};

export type Vec4 = [number, number, number, number] & {
    type: 'vec4',
    get x(): number, set x(n: number),
    get y(): number, set y(n: number),
    get z(): number, set z(n: number),
    get w(): number, set w(n: number),
};

export type AnyVector = Vec2 | Vec3 | Vec4;

// Re-export
export { isVector } from './index.js';

// =================================================================================================
// Vector constructors
// =================================================================================================

/**
 * Creates a two-dimensional vector.
 * @param x The `x`-component of the vector.
 * @param y The `y`-component of the vector.
 */
export function vec2(x: number, y: number): Vec2;

/**
 * Creates a two-dimensional vector of all zeroes.
 */
export function vec2(): Vec2;

/**
 * Creates a two-dimensional vector with the same value for both components.
 * @param value The value to use for both the `x` and `y` components.
 */
export function vec2(value: number): Vec2;

/**
 * Creates a two-dimensional vector using values from all of the given arguments.
 *
 * @param values Any combination of number, number array, or vector arguments. Values are copied
 * one-by-one from each until all this vector has both `x`, `y` components.
 *
 * ## Example
 *
 * ```js
 * const u = vec2(3, 2);
 * const v = vec3(9, 1, 7);
 * const w = [10, 11, 12, 13];
 *
 * const a = vec2(u);   // -> vec2(3, 2)
 * const b = vec2(v);   // -> vec2(9, 1)
 * const c = vec2(w);   // -> vec2(10, 11)
 * ```
 */
export function vec2(...values: (number | number[] | AnyVector)[]): Vec2

export function vec2(...args: (number | number[] | AnyVector)[]): Vec2 {
    const out = Object.defineProperties([0, 0], {
        type: { value: 'vec2', writable: false, enumerable: false },
        x: { get() { return this[0]; }, set(n: number) { this[0] = n; }, enumerable: false },
        y: { get() { return this[1]; }, set(n: number) { this[1] = n; }, enumerable: false },
    }) as Vec2;

    const values = args.flat(1);
    if (!values.every(n => typeof n === 'number')) {
        throw new Error("Invalid arguments passed to 'vec2'. Expected all numbers.");
    }

    if (args.length == 0) {
        // Leave as zeroes
    } else if (args.length == 1 && typeof args[0] === 'number') {
        out[0] = values[0];
        out[1] = values[0];
    } else if (values.length >= 2) {
        out[0] = values[0];
        out[1] = values[1];
    } else {
        throw new Error("Unreachable: array lengths must fall within range [0, INF).");
    }

    return out;
}

// -------------------------------------------------------------------------------------------------

/**
 * Creates a three-dimensional vector.
 * @param x The `x`-component of the vector.
 * @param y The `y`-component of the vector.
 * @param z The `z`-component of the vector.
 */
export function vec3(x: number, y: number, z: number): Vec3;

/**
 * Creates a three-dimensional vector of all zeroes.
 */
export function vec3(): Vec3;

/**
 * Creates a three-dimensional vector with the same value for all components.
 * @param value The value to use for the `x`, `y`, and `z` components.
 */
export function vec3(value: number): Vec3;

/**
 * Creates a three-dimensional vector using values from all of the given arguments.
 *
 * @param values Any combination of number, number array, or vector arguments. Values are copied
 * one-by-one from each until all this vector has all `x`, `y`, and `z` components.
 *
 * ## Example
 *
 * ```js
 * const u = vec2(1, 2);
 * const v = vec2(8, 9);
 * const w = [-1, 3];
 *
 * const a = vec3(u, v);    // -> vec3(1, 2, 8)
 * const b = vec3(6, u);    // -> vec3(6, 1, 2)
 * const c = vec3(1, w);    // -> vec3(1, -1, 3)
 * ```
 *
 * @throws An error will occur if fewer than 3 values are given across all arguments.
 */
export function vec3(...values: (number | number[] | AnyVector)[]): Vec3;

export function vec3(...args: (number | number[] | AnyVector)[]): Vec3 {
    const out = Object.defineProperties([0, 0, 0], {
        type: { value: 'vec3', writable: false, enumerable: false },
        x: { get() { return this[0]; }, set(n: number) { this[0] = n; }, enumerable: false },
        y: { get() { return this[1]; }, set(n: number) { this[1] = n; }, enumerable: false },
        z: { get() { return this[2]; }, set(n: number) { this[2] = n; }, enumerable: false },
    }) as Vec3;

    const values = args.flat(1);
    if (!values.every(n => typeof n === 'number')) {
        throw new Error("Invalid arguments passed to 'vec3'. Expected all numbers.");
    }

    if (args.length == 0) {
        // Leave as zeroes
    } else if (args.length == 1 && typeof args[0] === 'number') {
        out[0] = values[0];
        out[1] = values[0];
        out[2] = values[0];
    } else if (values.length >= 3) {
        out[0] = values[0];
        out[1] = values[1];
        out[2] = values[2];
    } else {
        throw new Error(
            "Invalid arguments passed to 'vec3'. Expected 0 numbers, 1 number, or a sequence of " +
            "arguments with 3 or more total numbers between them."
        );
    }

    return out;
}

// -------------------------------------------------------------------------------------------------

/**
 * Creates a four-dimensional vector.
 * @param x The `x`-component of the vector.
 * @param y The `y`-component of the vector.
 * @param z The `z`-component of the vector.
 * @param w The `w`-component of the vector.
 */
export function vec4(x: number, y: number, z: number, w: number): Vec4;

/**
 * Creates a four-dimensional vector of all zeroes.
 */
export function vec4(): Vec4;

/**
 * Creates a four-dimensional vector with the same value for all components.
 * @param value The value to use for `x`, `y`, `z`, and `w` components.
 */
export function vec4(value: number): Vec4;

/**
 * Creates a four-dimensional vector using all of the given components and scalars.
 *
 * @param values Any combination of number, number array, or vector arguments. Values are copied
 * one-by-one from each until all this vector has all `x`, `y`, `z`, and `w` components.
 *
 * ## Example
 *
 * ```js
 * const u = vec2(2, 1);
 * const v = [-1, 3];
 * const w = vec3(8, 7, 9);
 *
 * const a = vec4(u, v);    // -> vec4(2, 1, -1, 3)
 * const c = vec4(w, 1);    // -> vec4(8, 7, 9, 1)
 * const c = vec4(w, u);    // -> vec4(8, 7, 9, 2)
 * const b = vec4(6, v);    // -> Error: too few values passed
 * ```
 *
 * @throws An error will occur if fewer than 4 values are given across all arguments.
 */
export function vec4(...values: (number | number[] | AnyVector)[]): Vec4;

export function vec4(...args: (number | number[] | AnyVector)[]): Vec4 {
    const out = Object.defineProperties([0, 0, 0, 0], {
        type: { value: 'vec4', writable: false, enumerable: false, },
        x: { get() { return this[0]; }, set(n: number) { this[0] = n; }, enumerable: false },
        y: { get() { return this[1]; }, set(n: number) { this[1] = n; }, enumerable: false },
        z: { get() { return this[2]; }, set(n: number) { this[2] = n; }, enumerable: false },
        w: { get() { return this[3]; }, set(n: number) { this[3] = n; }, enumerable: false },
    }) as Vec4;

    const values = args.flat(1);
    if (!values.every(n => typeof n === 'number')) {
        throw new Error("Invalid arguments passed to 'vec4'. Expected all numbers.");
    }

    if (values.length == 0) {
        // Leave as zeroes
    } else if (args.length == 1 && typeof args[0] === 'number') {
        out[0] = values[0];
        out[1] = values[0];
        out[2] = values[0];
        out[3] = values[0];
    } else if (values.length >= 4) {
        out[0] = values[0];
        out[1] = values[1];
        out[2] = values[2];
        out[3] = values[3];
    } else {
        throw new Error(
            "Invalid arguments passed to 'vec4'. Expected 0 numbers, 1 number, or a sequence of " +
            "arguments with 4 or more total numbers between them."
        );
    }

    return out;
}
