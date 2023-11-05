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

type VectorWithSizeof<M extends AnyMatrix> =
    M extends Mat4 ? Vec4 :
    M extends Mat3 ? Vec3 :
    M extends Mat2 ? Vec2 :
    never;

type MatrixWithSizeof<V extends AnyVector> =
    V extends Vec4 ? Mat4 :
    V extends Vec3 ? Mat3 :
    V extends Vec2 ? Mat2 :
    never;


// =================================================================================================
// Helper functions
// =================================================================================================

/**
 * Wraps a `Float32Array` with an index and `push` method.
 *
 * @param size How large of a buffer to create.
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
 */
function radians(degrees: number): number {
    return degrees * Math.PI / 180;
}

/**
 * Converts an angle from radians to degrees.
 */
function degrees(radians: number): number {
    return radians * 180 / Math.PI;
}

// -------------------------------------------------------------------------------------------------

/**
 * Creates a new Bézier patch of all zeroes.
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
 * Creates a new Bézier curve of all zeroes.
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
 * @throws An error will occur if fewer than 4 values are given across all arguments.
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

// =================================================================================================
// Matrix constructors
// =================================================================================================

/**
 * Creates a 2×2 matrix.
 *
 * @note Arguments are given in **column-major order.**
 *
 * @param m00 The value for row 1, column 1.
 * @param m10 The value for row 2, column 1.
 * @param m01 The value for row 1, column 2.
 * @param m11 The value for row 2, column 2.
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
 * @note Arguments are given in **column-major order.**
 *
 * @param m00 The value for row 1, column 1.
 * @param m10 The value for row 2, column 1.
 * @param m20 The value for row 3, column 1.
 * @param m01 The value for row 1, column 2.
 * @param m11 The value for row 2, column 2.
 * @param m21 The value for row 3, column 2.
 * @param m02 The value for row 1, column 3.
 * @param m12 The value for row 2, column 3.
 * @param m22 The value for row 3, column 3.
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
 */
function mat3(diagonal: number): Mat3;

/**
 * Creates a 3×3 matrix by copying another 3×3 matrix.
 */
function mat3(mat: Mat3): Mat3;

/**
 * Creates a 3×3 matrix out of three column vectors.
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
 * @note Arguments are given in **column-major order.**
 *
 * @param m00 The value for row 1, column 1.
 * @param m10 The value for row 2, column 1.
 * @param m20 The value for row 3, column 1.
 * @param m30 The value for row 4, column 1.
 * @param m01 The value for row 1, column 2.
 * @param m11 The value for row 2, column 2.
 * @param m21 The value for row 3, column 2.
 * @param m31 The value for row 4, column 2.
 * @param m02 The value for row 1, column 3.
 * @param m12 The value for row 2, column 3.
 * @param m22 The value for row 3, column 3.
 * @param m32 The value for row 4, column 3.
 * @param m03 The value for row 1, column 4.
 * @param m13 The value for row 2, column 4.
 * @param m23 The value for row 3, column 4.
 * @param m33 The value for row 4, column 4.
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
 */
function mat4(diagonal: number): Mat4;

/**
 * Creates a 4×4 matrix by copying another 4×4 matrix.
 */
function mat4(mat: Mat4): Mat4;

/**
 * Creates a 4×4 matrix out of four column vectors.
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

// =================================================================================================
// Operations
// =================================================================================================

/**
 * Checks if two matrices or vectors have all equal components.
 *
 * @throws An error will occur when attempting to compare mismatching types, including comparisons
 * between vectors and matrices of different lengths/sizes.
 */
function equal<T extends AnyVector | AnyMatrix>(u: T, v: T): boolean {
    if (isVector(u) && isVector(v) && u.length === v.length) {
        for (let i = 0; i < u.length; i++)
            if (u[i] !== v[i])
                return false;
        return true;
    } else if (isMatrix(u) && isMatrix(v) && u.length === v.length) {
        for (let i = 0; i < u.length; i++)
            for (let j = 0; j < u.length; j++)
                if (u[i][j] !== v[i][j])
                    return false;
        return true;
    } else {
        throw new Error(
            "Invalid arguments passed to 'equal':\n" +
            `Expected 2 vectors or 2 matrices of the same size; received (${u.type}, ${v.type})`
        );
    }
}

// -------------------------------------------------------------------------------------------------

/**
 * Computes the sum of two vectors.
 * @param u The left-hand operand.
 * @param v The right-hand operand.
 * @throws An error will occur when attempting to add two non-vector types, or two vector types of
 * different length.
 */
function add<T extends AnyVector>(u: T, v: T): T;

/**
 * Computes the sum of two matrices.
 * @param a The left-hand operand.
 * @param b The right-hand operand.
 * @throws An error will occur when attempting to add two non-matrix types, or two matrix types of
 * different size.
 */
function add<T extends AnyMatrix>(a: T, b: T): T;

function add(u: AnyVector | AnyMatrix, v: AnyVector | AnyMatrix): AnyVector | AnyMatrix {
    if (isVector(u) && isVector(v)) {
        if (u.type === 'vec4' && v.type === 'vec4')
            return vec4(u[0] + v[0], u[1] + v[1], u[2] + v[2], u[3] + v[3]);

        else if (u.type === 'vec3' && v.type === 'vec3')
            return vec3(u[0] + v[0], u[1] + v[1], u[2] + v[2]);

        else if (u.type === 'vec2' && v.type === 'vec2')
            return vec2(u[0] + v[0], u[1] + v[1]);
    }

    else if (isMatrix(u) && isMatrix(v)) {
        if (u.type === 'mat4' && v.type === 'mat4') {
            return mat4(
                u[0][0] + v[0][0], u[0][1] + v[0][1], u[0][2] + v[0][2], u[0][3] + v[0][3],
                u[1][0] + v[1][0], u[1][1] + v[1][1], u[1][2] + v[1][2], u[1][3] + v[1][3],
                u[2][0] + v[2][0], u[2][1] + v[2][1], u[2][2] + v[2][2], u[2][3] + v[2][3],
                u[3][0] + v[3][0], u[3][1] + v[3][1], u[3][2] + v[3][2], u[3][3] + v[3][3],
            );
        }

        else if (u.type === 'mat3' && v.type === 'mat3') {
            return mat3(
                u[0][0] + v[0][0], u[0][1] + v[0][1], u[0][2] + v[0][2],
                u[1][0] + v[1][0], u[1][1] + v[1][1], u[1][2] + v[1][2],
                u[2][0] + v[2][0], u[2][1] + v[2][1], u[2][2] + v[2][2],
            );
        }

        else if (u.type === 'mat2' && v.type === 'mat2') {
            return mat2(
                u[0][0] + v[0][0], u[0][1] + v[0][1],
                u[1][0] + v[1][0], u[1][1] + v[1][1],
            );
        }
    }

    const uType: string = (u as any)?.type ?? typeof u;
    const vType: string = (v as any)?.type ?? typeof v;
    const msg = "Invalid arguments passed to 'add':\n";

    if (uType.startsWith('vec') && vType.startsWith('vec'))
        throw new Error(msg + `Vectors must be the same length; received (${uType} + ${vType}).`);
    else if (uType.startsWith('mat') && vType.startsWith('mat'))
        throw new Error(msg + `Matrices must be the same size; received (${uType} + ${vType}).`);
    else
        throw new Error(msg + `Expected two matrices or vectors, received (${uType} + ${vType}).`);
}

// -------------------------------------------------------------------------------------------------

/**
 * Computes the difference of two vectors.
 * @param u The left-hand operand.
 * @param v The right-hand operand.
 * @throws An error will occur when attempting to subtract two non-vector types, or two vector types
 * of different length.
 */
function sub<T extends AnyVector>(u: T, v: T): T;

/**
 * Computes the difference of two matrices.
 * @param a The left-hand operand.
 * @param b The right-hand operand.
 * @throws An error will occur when attempting to subtract two non-matrix types, or two matrix types
 * of different size.
 */
function sub<T extends AnyMatrix>(a: T, b: T): T;

function sub(u: AnyVector | AnyMatrix, v: AnyVector | AnyMatrix): AnyVector | AnyMatrix {
    if (isVector(u) && isVector(v)) {
        if (u.type === 'vec4' && v.type === 'vec4')
            return vec4(u[0] - v[0], u[1] - v[1], u[2] - v[2], u[3] - v[3]);

        else if (u.type === 'vec3' && v.type === 'vec3')
            return vec3(u[0] - v[0], u[1] - v[1], u[2] - v[2]);

        else if (u.type === 'vec2' && v.type === 'vec2')
            return vec2(u[0] - v[0], u[1] - v[1]);
    }

    else if (isMatrix(u) && isMatrix(v)) {
        if (u.type === 'mat4' && v.type === 'mat4') {
            return mat4(
                u[0][0] - v[0][0], u[0][1] - v[0][1], u[0][2] - v[0][2], u[0][3] - v[0][3],
                u[1][0] - v[1][0], u[1][1] - v[1][1], u[1][2] - v[1][2], u[1][3] - v[1][3],
                u[2][0] - v[2][0], u[2][1] - v[2][1], u[2][2] - v[2][2], u[2][3] - v[2][3],
                u[3][0] - v[3][0], u[3][1] - v[3][1], u[3][2] - v[3][2], u[3][3] - v[3][3],
            );
        }

        else if (u.type === 'mat3' && v.type === 'mat3') {
            return mat3(
                u[0][0] - v[0][0], u[0][1] - v[0][1], u[0][2] - v[0][2],
                u[1][0] - v[1][0], u[1][1] - v[1][1], u[1][2] - v[1][2],
                u[2][0] - v[2][0], u[2][1] - v[2][1], u[2][2] - v[2][2],
            );
        }

        else if (u.type === 'mat2' && v.type === 'mat2') {
            return mat2(
                u[0][0] - v[0][0], u[0][1] - v[0][1],
                u[1][0] - v[1][0], u[1][1] - v[1][1],
            );
        }
    }

    const uType: string = (u as any)?.type ?? typeof u;
    const vType: string = (v as any)?.type ?? typeof v;
    const msg = "Invalid arguments passed to 'sub':\n";

    if (uType.startsWith('vec') && vType.startsWith('vec'))
        throw new Error(msg + `Vectors must be the same length; received (${uType} - ${vType}).`);
    else if (uType.startsWith('mat') && vType.startsWith('mat'))
        throw new Error(msg + `Matrices must be the same size; received (${uType} - ${vType}).`);
    else
        throw new Error(msg + `Expected two matrices or vectors, received (${uType} - ${vType}).`);
}

/**
 * Computes the difference of two vectors or two matrices.
 * @deprecated This function has been renamed to {@link sub `sub`}.
 */
function subtract<T extends AnyVector | AnyMatrix>(u: T, v: T): T {
    return sub(u as any, v as any) as T;
}

// -------------------------------------------------------------------------------------------------

/**
 * Computes the matrix product of two matrices.
 * @param a The left-hand operand.
 * @param b The right-hand operand.
 * @note Don't forget that matrices are stored in column-major order, which can affect the order
 * that operands need to be written.
 * @throws An error will occur when attempting to multiply two non-matrix or non-vector types (aside
 * from a matrix or vector with a number), or two matrix/vector types of different size.
 */
function mul<T extends AnyMatrix>(a: T, b: T): T;

/**
 * Computes the scalar multiple of a vector or matrix.
 * @param u The matrix or vector.
 * @param scalar A scalar multiplier.
 * @throws An error will occur when attempting to multiply two non-matrix or non-vector types (aside
 * from a matrix or vector with a number), or two matrix/vector types of different size.
 */
function mul<T extends AnyVector | AnyMatrix>(u: T, scalar: number): T;

/**
 * Computes the scalar multiple of a vector or matrix.
 * @param scalar A scalar multiplier.
 * @param u The matrix or vector.
 * @throws An error will occur when attempting to multiply two non-matrix or non-vector types (aside
 * from a matrix or vector with a number), or two matrix/vector types of different size.
 */
function mul<T extends AnyVector | AnyMatrix>(scalar: number, u: T): T;

/**
 * Computes the matrix product between a matrix and vector.
 * @param m The left-hand operand.
 * @param v The right-hand operand. Must be the same size as the matrix provided for {@link m `m`}.
 * @throws An error will occur when attempting to multiply two non-matrix or non-vector types (aside
 * from a matrix or vector with a number), or two matrix/vector types of different size.
 */
function mul<M extends AnyMatrix, V extends VectorWithSizeof<M>>(m: M, v: V): V;

/**
 * Computes the element-wise product of two vectors, also known as the
 * {@link https://en.wikipedia.org/wiki/Hadamard_product_%28matrices%29 _Hadamard product_}.
 *
 * @param u
 * @param v
 *
 * @see {@link dot `dot`} For the dot product of two vectors.
 * @see {@link cross `cross`} For the cross product of two vectors.
 *
 * @throws An error will occur when attempting to multiply two non-matrix or non-vector types (aside
 * from a matrix or vector with a number), or two matrix/vector types of different size.
 */
function mul<T extends AnyVector>(u: T, v: T): T;

function mul(u: AnyVector | AnyMatrix | number, v: AnyVector | AnyMatrix | number): AnyVector | AnyMatrix {
    if (isMatrix(u) && isMatrix(v)) {
        if (u.type === 'mat4' && v.type === 'mat4') {
            return mat4(
                /* col 0 ----------------------------------------------------------------------------------------- */
                    /* row 0 */(u[0][0] * v[0][0]) + (u[1][0] * v[0][1]) + (u[2][0] * v[0][2]) + (u[3][0] * v[0][3]),
                    /* row 1 */(u[0][0] * v[1][0]) + (u[1][0] * v[1][1]) + (u[2][0] * v[1][2]) + (u[3][0] * v[1][3]),
                    /* row 2 */(u[0][0] * v[2][0]) + (u[1][0] * v[2][1]) + (u[2][0] * v[2][2]) + (u[3][0] * v[2][3]),
                    /* row 3 */(u[0][0] * v[3][0]) + (u[1][0] * v[3][1]) + (u[2][0] * v[3][2]) + (u[3][0] * v[3][3]),
                /* col 1 ----------------------------------------------------------------------------------------- */
                    /* row 0 */(u[0][1] * v[0][0]) + (u[1][1] * v[0][1]) + (u[2][1] * v[0][2]) + (u[3][1] * v[0][3]),
                    /* row 1 */(u[0][1] * v[1][0]) + (u[1][1] * v[1][1]) + (u[2][1] * v[1][2]) + (u[3][1] * v[1][3]),
                    /* row 2 */(u[0][1] * v[2][0]) + (u[1][1] * v[2][1]) + (u[2][1] * v[2][2]) + (u[3][1] * v[2][3]),
                    /* row 3 */(u[0][1] * v[3][0]) + (u[1][1] * v[3][1]) + (u[2][1] * v[3][2]) + (u[3][1] * v[3][3]),
                /* col 2 ----------------------------------------------------------------------------------------- */
                    /* row 0 */(u[0][2] * v[0][0]) + (u[1][2] * v[0][1]) + (u[2][2] * v[0][2]) + (u[3][2] * v[0][3]),
                    /* row 1 */(u[0][2] * v[1][0]) + (u[1][2] * v[1][1]) + (u[2][2] * v[1][2]) + (u[3][2] * v[1][3]),
                    /* row 2 */(u[0][2] * v[2][0]) + (u[1][2] * v[2][1]) + (u[2][2] * v[2][2]) + (u[3][2] * v[2][3]),
                    /* row 3 */(u[0][2] * v[3][0]) + (u[1][2] * v[3][1]) + (u[2][2] * v[3][2]) + (u[3][2] * v[3][3]),
                /* col 3 ----------------------------------------------------------------------------------------- */
                    /* row 0 */(u[0][3] * v[0][0]) + (u[1][3] * v[0][1]) + (u[2][3] * v[0][2]) + (u[3][3] * v[0][3]),
                    /* row 1 */(u[0][3] * v[1][0]) + (u[1][3] * v[1][1]) + (u[2][3] * v[1][2]) + (u[3][3] * v[1][3]),
                    /* row 2 */(u[0][3] * v[2][0]) + (u[1][3] * v[2][1]) + (u[2][3] * v[2][2]) + (u[3][3] * v[2][3]),
                    /* row 3 */(u[0][3] * v[3][0]) + (u[1][3] * v[3][1]) + (u[2][3] * v[3][2]) + (u[3][3] * v[3][3]),
            );
        }

        else if (u.type === 'mat3' && v.type === 'mat3') {
            return mat3(
                /* col 0 ------------------------------------------------------------------- */
                    /* row 0 */(u[0][0] * v[0][0]) + (u[1][0] * v[0][1]) + (u[2][0] * v[0][2]),
                    /* row 1 */(u[0][0] * v[1][0]) + (u[1][0] * v[1][1]) + (u[2][0] * v[1][2]),
                    /* row 2 */(u[0][0] * v[2][0]) + (u[1][0] * v[2][1]) + (u[2][0] * v[2][2]),
                /* col 1 ------------------------------------------------------------------- */
                    /* row 0 */(u[0][1] * v[0][0]) + (u[1][1] * v[0][1]) + (u[2][1] * v[0][2]),
                    /* row 1 */(u[0][1] * v[1][0]) + (u[1][1] * v[1][1]) + (u[2][1] * v[1][2]),
                    /* row 2 */(u[0][1] * v[2][0]) + (u[1][1] * v[2][1]) + (u[2][1] * v[2][2]),
                /* col 2 ------------------------------------------------------------------- */
                    /* row 0 */(u[0][2] * v[0][0]) + (u[1][2] * v[0][1]) + (u[2][2] * v[0][2]),
                    /* row 1 */(u[0][2] * v[1][0]) + (u[1][2] * v[1][1]) + (u[2][2] * v[1][2]),
                    /* row 2 */(u[0][2] * v[2][0]) + (u[1][2] * v[2][1]) + (u[2][2] * v[2][2]),
            );
        }

        else if (u.type === 'mat2' && v.type === 'mat2') {
            return mat2(
                /* col 0 --------------------------------------------- */
                    /* row 0 */(u[0][0] * v[0][0]) + (u[1][0] * v[0][1]),
                    /* row 1 */(u[0][0] * v[1][0]) + (u[1][0] * v[1][1]),
                /* col 1 --------------------------------------------- */
                    /* row 0 */(u[0][1] * v[0][0]) + (u[1][1] * v[0][1]),
                    /* row 1 */(u[0][1] * v[1][0]) + (u[1][1] * v[1][1]),
            );
        }
    }

    else if (
        (isMatrix(u) || isVector(u)) && typeof v === 'number' ||
        (isMatrix(v) || isVector(v)) && typeof u === 'number'
    ) {
        let mat: AnyVector | AnyMatrix;
        let num: number;
        if (typeof v === 'number') {
            mat = u as unknown as AnyVector | AnyMatrix;
            num = v;
        } else {
            mat = v;
            num = u as unknown as number;
        }

        switch (mat.type) {
            case 'vec4': return vec4(mat[0] * num, mat[1] * num, mat[2] * num, mat[4] * num);
            case 'vec3': return vec3(mat[0] * num, mat[1] * num, mat[2] * num);
            case 'vec2': return vec2(mat[0] * num, mat[1] * num);
            case 'mat4': return mat4(
                mat[0][0] * num, mat[0][1] * num, mat[0][2] * num, mat[0][3] * num,
                mat[1][0] * num, mat[1][1] * num, mat[1][2] * num, mat[1][3] * num,
                mat[2][0] * num, mat[2][1] * num, mat[2][2] * num, mat[2][3] * num,
                mat[3][0] * num, mat[3][1] * num, mat[3][2] * num, mat[3][3] * num,
            );
            case 'mat3': return mat3(
                mat[0][0] * num, mat[0][1] * num, mat[0][2] * num,
                mat[1][0] * num, mat[1][1] * num, mat[1][2] * num,
                mat[2][0] * num, mat[2][1] * num, mat[2][2] * num,
            );
            case 'mat2': return mat2(
                mat[0][0] * num, mat[0][1] * num,
                mat[1][0] * num, mat[1][1] * num,
            );
        }
    }

    else if (isMatrix(u) && isVector(v)) {
        if (u.type === 'mat4' && v.type === 'vec4') {
            return vec4(
                (u[0][0] * v[0]) + (u[1][0] * v[1]) + (u[2][0] * v[2]) + (u[3][0] * v[3]),
                (u[0][1] * v[0]) + (u[1][1] * v[1]) + (u[2][1] * v[2]) + (u[3][1] * v[3]),
                (u[0][2] * v[0]) + (u[1][2] * v[1]) + (u[2][2] * v[2]) + (u[3][2] * v[3]),
                (u[0][3] * v[0]) + (u[1][3] * v[1]) + (u[2][3] * v[2]) + (u[3][3] * v[3]),
            );
        }

        else if (u.type === 'mat3' && v.type === 'vec3') {
            return vec3(
                (u[0][0] * v[0]) + (u[1][0] * v[1]) + (u[2][0] * v[2]),
                (u[0][1] * v[0]) + (u[1][1] * v[1]) + (u[2][1] * v[2]),
                (u[0][2] * v[0]) + (u[1][2] * v[1]) + (u[2][2] * v[2]),
            );
        }

        else if (u.type === 'mat2' && v.type === 'vec4') {
            return vec2(
                (u[0][0] * v[0]) + (u[1][0] * v[1]),
                (u[0][1] * v[0]) + (u[1][1] * v[1]),
            );
        }
    }

    else if (isVector(u) && isVector(v)) {
        if (u.type === 'vec4' && v.type === 'vec4')
            return vec4(u[0] * v[0], u[1] * v[1], u[2] * v[2], u[3] * v[3]);

        else if (u.type === 'vec3' && v.type === 'vec3')
            return vec3(u[0] * v[0], u[1] * v[1], u[2] * v[2]);

        else if (u.type === 'vec2' && v.type === 'vec2')
            return vec2(u[0] * v[0], u[1] * v[1]);
    }

    const uType: string = (u as any)?.type ?? typeof u;
    const vType: string = (v as any)?.type ?? typeof v;
    const msg = "Invalid arguments passed to 'mul':\n";

    if (uType.startsWith('vec') && vType.startsWith('mat'))
        throw new Error(msg + `Received (${uType} * ${vType}); matrix must be the left-hand operand.`);
    else if (uType.startsWith('mat') && vType.startsWith('vec'))
        throw new Error(msg + `Received (${uType} * ${vType}); matrix and vector operands must be the same size.`);
    else
        throw new Error(msg + "Expected one of:\n" +
            "    (Matrix * Matrix) or (Matrix * Vector),\n" +
            "    (scalar * Matrix) or (Matrix * scalar), (scalar * Vector) or (Vector * scalar),\n" +
            "    or (Vector * Vector);\n" +
            `received (${uType} * ${vType}).`
        );
}

/**
 * Multiplies one vector or matrix with another vector or matrix, or with a scalar.
 *
 * @deprecated This function has been renamed to {@link mul `mul`}. Use that function for better
 * type inference.
 */
function mult(
    u: AnyVector | AnyMatrix | number,
    v: AnyVector | AnyMatrix | number,
): AnyVector | AnyMatrix {
    return mul(u as any, v as any);
}

// =================================================================================================
// Vector functions
// =================================================================================================


/**
 * Computes the dot product of two vectors.
 */
function dot<T extends AnyVector>(u: T, v: T): number {
    if (isVector(u) && isVector(v)) {
        if (u.type === 'vec4' && v.type === 'vec4')
            return u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3];

        else if (u.type === 'vec3' && v.type === 'vec3')
            return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];

        else if (u.type === 'vec2' && v.type === 'vec2')
            return u[0] * v[0] + u[1] * v[1];
    }

    const uType: string = (u as any)?.type ?? typeof u;
    const vType: string = (v as any)?.type ?? typeof v;
    const msg = "Invalid arguments passed to 'dot':\n";

    if (uType.startsWith('vec') && vType.startsWith('vec'))
        throw new Error(msg + `Vectors must be the same length; received (${uType} \u22C5 ${vType}).`);
    else
        throw new Error(msg + `Expected two vectors, received (${uType} \u22C5 ${vType}).`);
}

/**
 * Computes the cross product of two 3-dimensional vectors.
 */
function cross(u: Vec3, v: Vec3): Vec3 {
    if (isVector(u) && isVector(v) && u.type === 'vec3' && v.type === 'vec3') {
        return vec3(
            u[1] * v[2] - u[2] * v[1],
            u[2] * v[0] - u[0] * v[2],
            u[0] * v[1] - u[1] * v[0],
        );
    }

    const uType: string = (u as any)?.type ?? typeof u;
    const vType: string = (v as any)?.type ?? typeof v;
    const msg = "Invalid arguments passed to 'cross':\n";

    if (uType.startsWith('vec') && vType.startsWith('vec'))
        throw new Error(msg + `Received (${uType} \u00D7 ${vType}); cross product is only valid for (vec3 \u00D7 vec3).`);
    else
        throw new Error(msg + `Expected two 3D vectors, received (${uType} \u00D7 ${vType})`);
}

/**
 * Computes the magnitude of a vector.
 */
function magnitude(v: AnyVector): number {
    if (isVector(v))
        return Math.sqrt(dot(v, v));

    const vType: string = (v as any)?.type ?? typeof v;
    throw new Error(`Invalid argument passed to 'magnitude':\nExpected a vector, received ${vType}.`);
}

/**
 * Computes the length (magnitude) of a vector.
 * @deprecated This function has been renamed to {@link magnitude `magnitude`}.
 */
(window as any).length = function(v: AnyVector): number {
    // Because we include `lib.dom.ts`, we can't even define a function called `length`, since
    // `length` is a global property on the window object... some ancient thing for use with
    // iFrames. Won't be a problem once this function is removed entirely.
    return magnitude(v);
}

/**
 * Computes a normalized version of the given vector.
 */
function normalize<T extends AnyVector>(v: T): T {
    if (isVector(v))
        return mul(v, 1 / magnitude(v));

    const vType: string = (v as any)?.type ?? typeof v;
    throw new Error(`Invalid argument passed to 'normalize':\n Expected a vector, received ${vType}.`);
}

/**
 * Mixes two vectors or two numbers together with ratio `s`.
 *
 * `u` is multiplied by `1 - s` before being added to `s * v`.
 * @param u The first vector or number.
 * @param v The second vector or number.
 * @param s A number from 0 to 1; the ratio of `u` to `v`.
 */
function mix<T extends AnyVector | number>(u: T, v: T, s: number): T {
    if (typeof s !== 'number') {
        const sType: string = (s as any)?.type ?? typeof s;
        throw new Error(`Invalid argument passed to 'mix':\nExpected 's' to be a number; received ${sType}.`);
    }

    // Clamp to [0, 1]
    s = Math.min(1.0, Math.max(s, 0.0));
    const r = 1 - s;

    if (typeof u === 'number' && typeof v === 'number') {
        return (r * u + s * v) as T;
    } else if (isVector(u) && isVector(v)) {
        if (u.type == 'vec2' && v.type == 'vec2')
            return vec2(r * u[0] + s * v[0], r * u[1] + s * v[1]) as T;

        else if (u.type == 'vec3' && v.type == 'vec3')
            return vec3(r * u[0] + s * v[0], r * u[1] + s * v[1], r * u[2] + s * v[2]) as T;

        else if (u.type == 'vec4' && v.type == 'vec4')
            return vec4(r * u[0] + s * v[0], r * u[1] + s * v[1], r * u[2] + s * v[2], r * u[3] + s * v[3]) as T;
    }

    const uType: string = (u as any)?.type ?? typeof u;
    const vType: string = (v as any)?.type ?? typeof v;
    const msg = "Invalid arguments passed to 'mix':\n";

    if (uType.startsWith('vec') && vType.startsWith('vec'))
        throw new Error(msg + `Vectors must be the same length; received (${uType}, ${vType}).`);
    else
        throw new Error(msg + `Expected either three numbers or two vectors and a number; received (${uType}, ${vType}, number).`);
}

// =================================================================================================
// Matrix functions
// =================================================================================================

/**
 * Computes the determinant of a matrix.
 */
function det(m: AnyMatrix): number {
    if (isMatrix(m)) {
        if (m.type === 'mat4') {
            /* Using four intermediate vectors (eq. 1.97) computed using the column vectors that
             * span the top three rows, and the four values in the bottom row (eq. 1.96), we can
             * compute the determinant of a 4D matrix without the need to find all 16 cofactors.
             * Each of those cofactors is a 3×3 determinant, so this method greatly reduces
             * overhead. Equations referenced from Foundations of Game Dev, vol. 1. */

            // Get four column vectors, but only top 3 rows of them
            const a = vec3(m[0]);
            const b = vec3(m[1]);
            const c = vec3(m[2]);
            const d = vec3(m[3]);

            // Get the bottom row
            const x = m[0][3];
            const y = m[1][3];
            const z = m[2][3];
            const w = m[3][3];

            // Compute intermediate vectors
            const s = cross(a, b);
            const t = cross(c, b);
            const u = sub(mul(y, a), mul(x, b));
            const v = sub(mul(w, c), mul(z, d));

            // Determinant
            return dot(s, v) + dot(t, u);
        }

        else if (m.type === 'mat3') {
            /* The determinant of a 3D matrix is equal to the scalar triple product of its 3 column
             * vectors. See equations 1.94 and 1.95 (pg. 47-48) in Foundations of Game Dev, vol. 1.
             * */
            const a = vec3(m[0]);
            const b = vec3(m[1]);
            const c = vec3(m[2]);
            return dot(cross(a, b), c);
        }

        else if (m.type === 'mat2') {
            return m[0][0] * m[1][1] - m[1][0] * m[0][1];
        }
    }

    const mType: string = (m as any)?.type ?? typeof m;
    throw new Error(`Invalid argument passed to 'det':\nExpected a matrix, received ${mType}.`);
}

/**
 * Computes the inverse of a matrix.
 *
 * @note Since it doesn't really come up that often in computer graphics, this function doesn't
 * bother to check if the matrix is invertible (i.e. if its determinant is zero). It would probably
 * be undesired if such a commonly used function threw an error mid-runtime because of an edge-case
 * like that.
 */
function inverse<T extends AnyMatrix>(m: T): T {
    if (isMatrix(m)) {
        if (m.type === 'mat4') {
            /* We can make use of the same strategy employed by `det` above to efficiently compute
             * the matrix's inverse. See that function and the equations it references, as well as
             * equation 1.99 in Foundations of Game Dev, vol. 1. This implementation is modelled
             * specifically after listing 1.11. */

            // Get four column vectors, but only top 3 rows of them
            const a = vec3(m[0]);
            const b = vec3(m[1]);
            const c = vec3(m[2]);
            const d = vec3(m[3]);

            // Get the bottom row
            const x = m[0][3];
            const y = m[1][3];
            const z = m[2][3];
            const w = m[3][3];

            // Compute intermediate vectors
            let s = cross(a, b);
            let t = cross(c, b);
            let u = sub(mul(y, a), mul(x, b));
            let v = sub(mul(w, c), mul(z, d));
            const invDet = 1.0 / (dot(s, t) + dot(t, u));

            s = mul(s, invDet);
            t = mul(t, invDet);
            u = mul(u, invDet);
            v = mul(v, invDet);

            const r0 = mul(add(cross(b, v), t), y);
            const r1 = mul(sub(cross(v, a), t), x);
            const r2 = mul(add(cross(d, u), s), w);
            const r3 = mul(sub(cross(u, c), s), z);

            return mat4(
                r0[0], r1[0], r2[0], r3[0],
                r0[1], r1[1], r2[1], r3[1],
                r0[2], r1[2], r2[2], r3[2],
                -dot(b, t), dot(a, t), -dot(d, s), dot(c, s),
            ) as T;
        }

        else if (m.type === 'mat3') {
            /* The inverse of a 3D matrix is the cross product of its three column vectors, laid out
             * row-by-row, multiplied by its determinant's reciprocal. See equations 1.94 and 1.95,
             * listing 1.10 in Foundations of Game Dev, vol. 1. */

            const a = vec3(m[0]);
            const b = vec3(m[1]);
            const c = vec3(m[2]);

            const r0 = cross(b, c);
            const r1 = cross(c, a);
            const r2 = cross(a, b);

            const invDet = 1.0 / dot(r2, c);
            return mat3(
                r0[0] * invDet, r1[0] * invDet, r2[0] * invDet,
                r0[1] * invDet, r1[1] * invDet, r2[1] * invDet,
                r0[2] * invDet, r1[2] * invDet, r2[2] * invDet,
            ) as T;
        }

        else if (m.type === 'mat2') {
            const invDet = 1.0 / det(m);
            const invNeg = -invDet;
            return mat2(
                invDet * m[1][1], invNeg * m[0][1],
                invNeg * m[1][0], invDet * m[0][0],
            ) as T;
        }
    }

    const mType: string = (m as any)?.type ?? typeof m;
    throw new Error(`Invalid argument passed to 'inverse':\nExpected a matrix, received ${mType}.`);
}

/**
 * Computes the transpose of a matrix.
 */
function transpose<T extends AnyMatrix>(m: T): T {
    if (isMatrix(m)) {
        if (m.type == 'mat4') {
            return mat4(
                m[0][0], m[1][0], m[2][0], m[3][0],
                m[0][1], m[1][1], m[2][1], m[3][1],
                m[0][2], m[1][2], m[2][2], m[3][2],
                m[0][3], m[1][3], m[2][3], m[3][3],
            ) as T;
        }

        else if (m.type == 'mat3') {
            return mat3(
                m[0][0], m[1][0], m[2][0],
                m[0][1], m[1][1], m[2][1],
                m[0][2], m[1][2], m[2][2],
            ) as T;
        }

        else if (m.type == 'mat2') {
            return mat2(
                m[0][0], m[1][0],
                m[0][1], m[1][1],
            ) as T;
        }
    }

    const mType: string = (m as any)?.type ?? typeof m;
    throw new Error(`Invalid argument passed to 'transpose':\nExpected a matrix, received ${mType}.`);
}
