// cspell:words Bézier mult

type Vec2 = { type: 'vec2' } & [number, number];
type Vec3 = { type: 'vec3' } & [number, number, number];
type Vec4 = { type: 'vec4' } & [number, number, number, number];

type Mat2 = { type: 'mat2' } & [[number, number], [number, number]];
type Mat3 = { type: 'mat3' } & [[number, number, number], [number, number, number], [number, number, number]];
type Mat4 = { type: 'mat4' } & [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]];

type Curve = [number, number, number, number];
type Patch = [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]];

type AnyVector = Vec2 | Vec3 | Vec4;
type AnyMatrix = Mat2 | Mat3 | Mat4;


// =================================================================================================
// Helper functions
// =================================================================================================

/**
 * Wraps a `Float32Array` with an index and `push` method.
 *
 * @param {number} size How large of a buffer to create.
 *
 * @deprecated The `MV` library itself never uses this for anything. Prefer using a
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array `Float32Array`}
 * directly, which already has methods on it for setting ranges of numbers inside the buffers.
 */
function MVbuffer(size: number) {
    return {
        buf: new Float32Array(size),
        index: 0,
        push(x: number[]) {
            for (let i = 0; i < x.length; i++) {
                this.buf[this.index + i] = x[i];
            }
            this.index += x.length;
            delete (this as any)['type'];
        },
    };
}

/**
 * Determines whether or not the given object is a vector.
 */
function isVector(v: unknown): v is AnyVector {
    return v != undefined && Array.isArray(v) && (
        (v as AnyVector).type === 'vec2' ||
        (v as AnyVector).type === 'vec3' ||
        (v as AnyVector).type === 'vec4'
    );
}

/**
 * Determines whether or not the given object is a matrix.
 */
function isMatrix(v: unknown): v is AnyMatrix {
    return v != undefined && Array.isArray(v) && (
        (v as AnyMatrix).type === 'mat2' ||
        (v as AnyMatrix).type === 'mat3' ||
        (v as AnyMatrix).type === 'mat4'
    );
}

/**
 * Converts an angle from degrees to radians.
 * @param degrees The angle in degrees.
 * @returns The angle in radians.
 */
function radians(degrees: number): number {
    return degrees * Math.PI / 180;
}

/**
 * Converts an angle from radians to degrees.
 * @param radians The angle in radians.
 * @returns The angle in degrees.
 */
function degrees(radians: number): number {
    return radians * 180 / Math.PI;
}

// -------------------------------------------------------------------------------------------------

/**
 * Creates a new, all-zeroes Bézier patch.
 */
function patch(): Patch {
    const out = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];
    (out as any).type = 'patch';
    return out as Patch;
}

/**
 * Creates a new, all-zeroes Bézier curve.
 */
function curve(): Curve {
    const out = [0, 0, 0, 0];
    (out as any).type = 'curve';
    return out as Curve;
}

// =================================================================================================
// Vector constructors
// =================================================================================================

/**
 * Creates a two-dimensional vector.
 * @param x The `x`-component of the vector.
 * @param y The `y`-component of the vector.
 */
function vec2(x: number, y: number): Vec2;

/**
 * Creates a two-dimensional vector of all zeroes.
 */
function vec2(): Vec2;

/**
 * Creates a two-dimensional vector with the same value for both components.
 * @param value The value to use for both the `x` and `y` components.
 */
function vec2(value: number): Vec2;

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
function vec2(...values: (number | number[] | AnyVector)[]): Vec2

function vec2(...args: (number | number[] | AnyVector)[]): Vec2 {
    const out: Vec2 = [0, 0] as Vec2;
    out.type = 'vec2';

    const values = args.flat(1);
    if (!values.every(n => typeof n === 'number')) {
        throw new Error("Invalid arguments passed to 'vec2'. Expected all numbers.");
    }

    if (args.length == 0) {
        // Leave as zeroes
    } else if (args.length == 1 && values.length == 1) {
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
function vec3(x: number, y: number, z: number): Vec3;

/**
 * Creates a three-dimensional vector of all zeroes.
 */
function vec3(): Vec3;

/**
 * Creates a three-dimensional vector with the same value for all components.
 * @param value The value to use for the `x`, `y`, and `z` components.
 */
function vec3(value: number): Vec3;

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
function vec3(...values: (number | number[] | AnyVector)[]): Vec3;

function vec3(...args: (number | number[] | AnyVector)[]): Vec3 {
    const out: Vec3 = [0, 0, 0] as Vec3;
    out.type = 'vec3';

    const values = args.flat(1);
    if (!values.every(n => typeof n === 'number')) {
        throw new Error("Invalid arguments passed to 'vec3'. Expected all numbers.");
    }

    if (args.length == 0) {
        // Leave as zeroes
    } else if (args.length == 1 && values.length == 1) {
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
function vec4(x: number, y: number, z: number, w: number): Vec4;

/**
 * Creates a four-dimensional vector of all zeroes.
 */
function vec4(): Vec4;

/**
 * Creates a four-dimensional vector with the same value for all components.
 * @param value The value to use for `x`, `y`, `z`, and `w` components.
 */
function vec4(value: number): Vec4;

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
 * @throws An error will occur if fewer than 4 values are given across all given values.
 */
function vec4(...values: (number | number[] | AnyVector)[]): Vec4;

function vec4(...args: (number | number[] | AnyVector)[]): Vec4 {
    const out: Vec4 = [0, 0, 0, 0] as Vec4;
    out.type = 'vec4';

    const values = args.flat(1);
    if (!values.every(n => typeof n === 'number')) {
        throw new Error("Invalid arguments passed to 'vec4'. Expected all numbers.");
    }

    if (values.length == 0) {
        // Leave as zeroes
    } else if (args.length == 1 && values.length == 1) {
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

// =================================================================================================
// Matrix constructors
// =================================================================================================

/**
 * Creates a 2×2 matrix.
 *
 * Parameters are given in **column-major order.**
 *
 * @param {number} m00 The value for row 0, column 0.
 * @param {number} m10 The value for row 1, column 0.
 * @param {number} m01 The value for row 0, column 1.
 * @param {number} m11 The value for row 1, column 1.
 */
function mat2(
    m00: number, m10: number,
    m01: number, m11: number,
): Mat2;

/**
 * Creates a 2×2 identity matrix (all zeroes, with ones on the diagonal).
 */
function mat2(): Mat2;

/**
 * Creates a 2×2 matrix with the same value down its entire diagonal.
 * @param diagonal The value to repeat down the diagonal.
 */
function mat2(diagonal: number): Mat2;

/**
 * Creates a 2×2 matrix by copying another 2×2 matrix.
 * @param mat A matrix to copy entries from.
 */
function mat2(mat: Mat2): Mat2;

/**
 * Creates a 2×2 matrix out of two column vectors.
 * @param c0 A vector to copy into the first column.
 * @param c1 A vector to copy into the second column.
 */
function mat2(c0: Vec2, c1: Vec2): Mat2;

function mat2(...args: (number | Mat2 | Vec2)[]): Mat2 {
    const out: Mat2 = [
        [1, 0],
        [0, 1],
    ] as Mat2;
    out.type = 'mat2';

    if (args.length == 0) {
        // Leave as identity
    } else if (args.length == 4) {
        if (!args.every(n => typeof n === 'number')) {
            throw new Error("Invalid arguments passed to 'mat2'. Expected 4 numbers.");
        }

        out[0][0] = (args as number[])[0];
        out[0][1] = (args as number[])[1];

        out[1][0] = (args as number[])[2];
        out[1][1] = (args as number[])[3];
    } else if (args.length == 2) {
        const [c0, c1] = args;

        if (!isVector(c0) || !isVector(c1)) {
            throw new Error("Invalid arguments passed to 'mat2'. Expected 2 column vectors.");
        } else if (c0.length != 2 || c1.length != 2) {
            throw new Error("Invalid arguments passed to 'mat2'. Column vectors should be of size 2.");
        }

        out[0] = [...c0] as Vec2;
        out[1] = [...c1] as Vec2;
    } else if (args.length == 1) {
        const [m] = args;

        if (typeof m === 'number') {
            out[0][0] = m;
            out[1][1] = m;
        } else if (isMatrix(m) && m.length == 2) {
            // Copy columns
            out[0] = [...m[0]];
            out[1] = [...m[1]];
        } else {
            throw new Error("Invalid argument passed to 'mat2'. Expected a single scalar or a Mat2.");
        }
    } else {
        throw new Error("Invalid arguments passed to 'mat2'. Expected 0 numbers, 4 numbers, 1 Mat2, or 2 Vec2s.");
    }

    return out;
}

// -------------------------------------------------------------------------------------------------

/**
 * Creates a 3×3 matrix.
 *
 * Parameters are given in **column-major order.**
 *
 * @param m00 The value for row 0, column 0.
 * @param m10 The value for row 1, column 0.
 * @param m20 The value for row 2, column 0.
 * @param m01 The value for row 0, column 1.
 * @param m11 The value for row 1, column 1.
 * @param m21 The value for row 2, column 1.
 * @param m02 The value for row 0, column 2.
 * @param m12 The value for row 1, column 2.
 * @param m22 The value for row 2, column 2.
 */
function mat3(
    m00: number, m10: number, m20: number,
    m01: number, m11: number, m21: number,
    m02: number, m12: number, m22: number,
): Mat3;

/**
 * Creates a 3×3 identity matrix (all zeroes, with ones on the diagonal).
 */
function mat3(): Mat3;

/**
 * Creates a 3×3 matrix with the same value down its entire diagonal.
 * @param diagonal The value to repeat down the diagonal.
 */
function mat3(diagonal: number): Mat3;

/**
 * Creates a 3×3 matrix by copying another 3×3 matrix.
 * @param mat A matrix to copy entires from.
 */
function mat3(mat: Mat3): Mat3;

/**
 * Creates a 3×3 matrix out of three column vectors.
 * @param c0 A vector to copy into the first column.
 * @param c1 A vector to copy into the second column.
 * @param c2 A vector to copy into the third column.
 */
function mat3(c0: Vec3, c1: Vec3, c2: Vec3): Mat3;

function mat3(...args: (number | Mat3 | Vec3)[]): Mat3 {
    const out: Mat3 = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ] as Mat3;
    out.type = 'mat3';

    if (args.length == 0) {
        // Leave as identity
    } else if (args.length == 9) {
        if (!args.every(n => typeof n === 'number')) {
            throw new Error("Invalid arguments passed to 'mat3'. Expected 9 numbers.");
        }

        out[0][0] = (args as number[])[0];
        out[0][1] = (args as number[])[1];
        out[0][2] = (args as number[])[2];

        out[1][0] = (args as number[])[3];
        out[1][1] = (args as number[])[4];
        out[1][2] = (args as number[])[5];

        out[2][0] = (args as number[])[6];
        out[2][1] = (args as number[])[7];
        out[2][2] = (args as number[])[8];
    } else if (args.length == 3) {
        const [c0, c1, c2] = args;

        if (!isVector(c0) || !isVector(c1) || !isVector(c2)) {
            throw new Error("Invalid arguments passed to 'mat3'. Expected 3 column vectors.");
        } else if (c0.length != 3 || c1.length != 3 || c2.length != 3) {
            throw new Error("Invalid arguments passed to 'mat3'. Column vectors should be of size 3.");
        }

        out[0] = [...c0] as Vec3;
        out[1] = [...c1] as Vec3;
        out[2] = [...c2] as Vec3;
    } else if (args.length == 1) {
        const [m] = args;

        if (typeof m === 'number') {
            out[0][0] = m;
            out[1][1] = m;
            out[2][2] = m;
        } else if (isMatrix(m) && m.length == 3) {
            // Copy columns
            out[0] = [...m[0]];
            out[1] = [...m[1]];
            out[2] = [...m[2]];
        } else {
            throw new Error("Invalid argument passed to 'mat3'. Expected a single scalar or a Mat3.");
        }
    } else {
        throw new Error("Invalid arguments passed to 'mat3'. Expected 0 numbers, 9 numbers, 1 Mat3, or 3 Vec3s.");
    }

    return out;
}

// -------------------------------------------------------------------------------------------------

/**
 * Creates a 4×4 matrix.
 *
 * Entries are given in **column-major order.**
 *
 * @param m00 The value for row 0, column 0.
 * @param m10 The value for row 1, column 0.
 * @param m20 The value for row 2, column 0.
 * @param m30 The value for row 3, column 0.
 * @param m01 The value for row 0, column 1.
 * @param m11 The value for row 1, column 1.
 * @param m21 The value for row 2, column 1.
 * @param m31 The value for row 3, column 1.
 * @param m02 The value for row 0, column 2.
 * @param m12 The value for row 1, column 2.
 * @param m22 The value for row 2, column 2.
 * @param m32 The value for row 3, column 2.
 * @param m03 The value for row 0, column 3.
 * @param m13 The value for row 1, column 3.
 * @param m23 The value for row 2, column 3.
 * @param m33 The value for row 3, column 3.
 */
function mat4(
    m00: number, m10: number, m20: number, m30: number,
    m01: number, m11: number, m21: number, m31: number,
    m02: number, m12: number, m22: number, m32: number,
    m03: number, m13: number, m23: number, m33: number,
): Mat4;

/**
 * Creates a 4×4 identity matrix (all zeroes, with ones on the diagonal).
 */
function mat4(): Mat4;

/**
 * Creates a 4×4 matrix with the same value down its entire diagonal.
 * @param diagonal The value to repeat down the diagonal.
 */
function mat4(diagonal: number): Mat4;

/**
 * Creates a 4×4 matrix by copying another 4×4 matrix.
 * @param mat A matrix to copy entires from.
 */
function mat4(mat: Mat4): Mat4;

/**
 * Creates a 4×4 matrix out of four column vectors.
 * @param c0 A vector to copy into the first column.
 * @param c1 A vector to copy into the second column.
 * @param c2 A vector to copy into the third column.
 * @param c3 A vector to copy into the fourth column.
 */
function mat4(c0: Vec4, c1: Vec4, c2: Vec4, c3: Vec4): Mat4;

function mat4(...args: (number | Mat4 | Vec4)[]): Mat4 {
    const out: Mat4 = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ] as Mat4;
    out.type = 'mat4';

    if (args.length == 0) {
        // Leave as identity
    } else if (args.length == 16) {
        if (!args.every(n => typeof n === 'number')) {
            throw new Error("Invalid arguments passed to 'mat4'. Expected 16 numbers.");
        }

        out[0][0] = (args as number[])[0];
        out[0][1] = (args as number[])[1];
        out[0][2] = (args as number[])[2];

        out[1][0] = (args as number[])[3];
        out[1][1] = (args as number[])[4];
        out[1][2] = (args as number[])[5];

        out[2][0] = (args as number[])[6];
        out[2][1] = (args as number[])[7];
        out[2][2] = (args as number[])[8];
    } else if (args.length == 4) {
        const [c0, c1, c2, c3] = args;

        if (!isVector(c0) || !isVector(c1) || !isVector(c2) || !isVector(c3)) {
            throw new Error("Invalid arguments passed to 'mat4'. Expected 4 column vectors.");
        } else if (c0.length != 4 || c1.length != 4 || c2.length != 4 || c3.length != 4) {
            throw new Error("Invalid arguments passed to 'mat4'. Column vectors should be of size 4.");
        }

        out[0] = [...c0] as Vec4;
        out[1] = [...c1] as Vec4;
        out[2] = [...c2] as Vec4;
        out[3] = [...c3] as Vec4;
    } else if (args.length == 1) {
        const [m] = args;

        if (typeof m === 'number') {
            out[0][0] = m;
            out[1][1] = m;
            out[2][2] = m;
            out[3][3] = m;
        } else if (isMatrix(m) && m.length == 4) {
            // Copy columns
            out[0] = [...m[0]];
            out[1] = [...m[1]];
            out[2] = [...m[2]];
            out[3] = [...m[3]];
        } else {
            throw new Error("Invalid argument passed to 'mat2'. Expected a single scalar or a Mat2.");
        }
    } else {
        throw new Error("Invalid arguments passed to 'mat4'. Expected 0 numbers, 16 numbers, 1 Mat4, or 4 Vec4s.");
    }

    return out;
}
