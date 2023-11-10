import { isVector, isMatrix } from './index.js';
import type { Vec2, Vec3, Vec4 } from './vec.js';

export type Mat2 = { type: 'mat2' } & [[number, number], [number, number]];
export type Mat3 = { type: 'mat3' } & [[number, number, number], [number, number, number], [number, number, number]];
export type Mat4 = { type: 'mat4' } & [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]];

export type AnyMatrix = Mat2 | Mat3 | Mat4;


export { isMatrix } from './index.js';


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
export function mat2(
    m00: number, m10: number,
    m01: number, m11: number,
): Mat2;

/**
 * Creates a 2×2 identity matrix (all zeroes, with ones on the diagonal).
 */
export function mat2(): Mat2;

/**
 * Creates a 2×2 matrix with the same value down its entire diagonal.
 */
export function mat2(diagonal: number): Mat2;

/**
 * Creates a 2×2 matrix by copying another 2×2 matrix.
 */
export function mat2(mat: Mat2): Mat2;

/**
 * Creates a 2×2 matrix out of two column vectors.
 */
export function mat2(c0: Vec2, c1: Vec2): Mat2;

export function mat2(...args: (number | Mat2 | Vec2)[]): Mat2 {
    const out: Mat2 = [
        [1, 0],
        [0, 1],
    ] as Mat2;
    out.type = 'mat2';

    if (args.length == 0) {
        // Leave as identity
    } else if (args.length == 4) {
        for (const n of args) {
            if (typeof n !== 'number')
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
export function mat3(
    m00: number, m10: number, m20: number,
    m01: number, m11: number, m21: number,
    m02: number, m12: number, m22: number,
): Mat3;

/**
 * Creates a 3×3 identity matrix (all zeroes, with ones on the diagonal).
 */
export function mat3(): Mat3;

/**
 * Creates a 3×3 matrix with the same value down its entire diagonal.
 */
export function mat3(diagonal: number): Mat3;

/**
 * Creates a 3×3 matrix by copying another 3×3 matrix.
 */
export function mat3(mat: Mat3): Mat3;

/**
 * Creates a 3×3 matrix out of three column vectors.
 */
export function mat3(c0: Vec3, c1: Vec3, c2: Vec3): Mat3;

export function mat3(...args: (number | Mat3 | Vec3)[]): Mat3 {
    const out: Mat3 = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ] as Mat3;
    out.type = 'mat3';

    if (args.length == 0) {
        // Leave as identity
    } else if (args.length == 9) {
        for (const n of args) {
            if (typeof n !== 'number')
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
export function mat4(
    m00: number, m10: number, m20: number, m30: number,
    m01: number, m11: number, m21: number, m31: number,
    m02: number, m12: number, m22: number, m32: number,
    m03: number, m13: number, m23: number, m33: number,
): Mat4;

/**
 * Creates a 4×4 identity matrix (all zeroes, with ones on the diagonal).
 */
export function mat4(): Mat4;

/**
 * Creates a 4×4 matrix with the same value down its entire diagonal.
 */
export function mat4(diagonal: number): Mat4;

/**
 * Creates a 4×4 matrix by copying another 4×4 matrix.
 */
export function mat4(mat: Mat4): Mat4;

/**
 * Creates a 4×4 matrix out of four column vectors.
 */
export function mat4(c0: Vec4, c1: Vec4, c2: Vec4, c3: Vec4): Mat4;

export function mat4(...args: (number | Mat4 | Vec4)[]): Mat4 {
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
        for (const n of args) {
            if (typeof n !== 'number')
                throw new Error("Invalid arguments passed to 'mat4'. Expected 16 numbers.");
        }

        out[0][0] = (args as number[])[0];
        out[0][1] = (args as number[])[1];
        out[0][2] = (args as number[])[2];
        out[0][3] = (args as number[])[3];

        out[1][0] = (args as number[])[4];
        out[1][1] = (args as number[])[5];
        out[1][2] = (args as number[])[6];
        out[1][3] = (args as number[])[7];

        out[2][0] = (args as number[])[6];
        out[2][1] = (args as number[])[7];
        out[2][2] = (args as number[])[8];
        out[2][3] = (args as number[])[9];

        out[2][0] = (args as number[])[6];
        out[2][1] = (args as number[])[7];
        out[2][2] = (args as number[])[8];
        out[2][3] = (args as number[])[9];
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
