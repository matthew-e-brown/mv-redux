import { isVector } from './vec.js';
import type { Vec2, Vec3, Vec4 } from './vec.js';

export type Mat2 = [[number, number], [number, number]] & {
    type: 'mat2'
};

export type Mat3 = [[number, number, number], [number, number, number], [number, number, number]] & {
    type: 'mat3'
};

export type Mat4 = [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]] & {
    type: 'mat4'
};


export type AnyMatrix = Mat2 | Mat3 | Mat4;

/**
 * Determines whether or not the given object is a matrix.
 */
export function isMatrix(v: unknown): v is AnyMatrix {
    return Array.isArray(v) && (
        (v as AnyMatrix).type === 'mat4' ||
        (v as AnyMatrix).type === 'mat3' ||
        (v as AnyMatrix).type === 'mat2'
    );
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
 * Creates a 2×2 matrix by copying another matrix.
 *
 * If the source matrix is larger than 2×2, then only the top-left corner will be copied,
 * effectively truncating it.
 */
export function mat2(mat: AnyMatrix): Mat2;

/**
 * Creates a 2×2 matrix out of two column vectors.
 */
export function mat2(c0: Vec2, c1: Vec2): Mat2;

export function mat2(...args: (number | AnyMatrix | Vec2)[]): Mat2 {
    const out = [
        [1, 0],
        [0, 1],
    ];
    Object.defineProperty(out, 'type', { value: 'mat2', writable: false, enumerable: false });

    const argError = () => new Error(
        "Invalid arguments passed to 'mat2':\n" +
        "Expected either:\n" +
        "    0 arguments,\n" +
        "    4 numbers,\n" +
        "    1 number,\n" +
        "    1 matrix,\n" +
        "    2 vec2s;\n" +
        `received: (${args.map(x => (x as any).type ?? typeof x).join(', ')})`
    );

    if (args.length == 0) {
        // Leave as identity
    } else if (args.length == 4) {
        for (let i = 0; i < 4; i++) {
            if (typeof args[i] !== 'number')
                throw argError();
        }

        out[0][0] = (args as number[])[0];
        out[0][1] = (args as number[])[1];

        out[1][0] = (args as number[])[2];
        out[1][1] = (args as number[])[3];
    } else if (args.length == 2) {
        const [c0, c1] = args;

        if (!isVector(c0) || !isVector(c1)) {
            throw argError();
        } else if (c0.length != 2 || c1.length != 2) {
            throw argError();
        }

        out[0][0] = c0[0];
        out[0][1] = c0[1];

        out[1][0] = c1[0];
        out[1][1] = c1[1];
    } else if (args.length == 1) {
        const [m] = args;

        if (typeof m === 'number') {
            out[0][0] = m;
            out[1][1] = m;
        } else if (isMatrix(m)) {
            out[0][0] = m[0][0]; out[0][1] = m[0][1];
            out[1][0] = m[1][0]; out[1][1] = m[1][1];
        } else {
            throw argError();
        }
    } else {
        throw argError();
    }

    return out as Mat2;
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
 * Creates a 3×3 matrix by copying another matrix.
 *
 * If the source matrix is smaller than 3×3, its entries will fill the top-left corner of the
 * resulting matrix. If it is _larger_ than 3×3, then only the top-left corner will be copied,
 * effectively truncating the source matrix.
 */
export function mat3(mat: AnyMatrix): Mat3;

/**
 * Creates a 3×3 matrix out of three column vectors.
 */
export function mat3(c0: Vec3, c1: Vec3, c2: Vec3): Mat3;

export function mat3(...args: (number | AnyMatrix | Vec3)[]): Mat3 {
    const out = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ];
    Object.defineProperty(out, 'type', { value: 'mat3', writable: false, enumerable: false });

    const argError = () => new Error(
        "Invalid arguments passed to 'mat3':\n" +
        "Expected either:\n" +
        "    0 arguments,\n" +
        "    9 numbers,\n" +
        "    1 number,\n" +
        "    1 matrix, or\n" +
        "    3 vec3s;\n" +
        `received: (${args.map(x => (x as any).type ?? typeof x).join(', ')})`
    );

    if (args.length == 0) {
        // Leave as identity
    } else if (args.length == 9) {
        for (let i = 0; i < 9; i++) {
            if (typeof args[i] !== 'number')
                throw argError();
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
            throw argError();
        } else if (c0.length != 3 || c1.length != 3 || c2.length != 3) {
            throw argError();
        }

        out[0][0] = c0[0];
        out[0][1] = c0[1];
        out[0][2] = c0[2];

        out[1][0] = c1[0];
        out[1][1] = c1[1];
        out[1][2] = c1[2];

        out[2][0] = c2[0];
        out[2][1] = c2[1];
        out[2][2] = c2[2];
    } else if (args.length == 1) {
        const [m] = args;

        if (typeof m === 'number') {
            out[0][0] = m;
            out[1][1] = m;
            out[2][2] = m;
        } else if (isMatrix(m)) {
            if (m.type === 'mat4' || m.type == 'mat3') {
                out[0][0] = m[0][0]; out[0][1] = m[0][1]; out[0][2] = m[0][2];
                out[1][0] = m[1][0]; out[1][1] = m[1][1]; out[1][2] = m[1][2];
                out[2][0] = m[2][0]; out[2][1] = m[2][1]; out[2][2] = m[2][2];
            } else if (m.type === 'mat2') {
                out[0][0] = m[0][0]; out[0][1] = m[0][1];
                out[1][0] = m[1][0]; out[1][1] = m[1][1];
            } else {
                throw argError();
            }
        } else {
            throw argError();
        }
    } else {
        throw argError();
    }

    return out as Mat3;
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
 * Creates a 4×4 matrix by copying another matrix.
 *
 * If the source matrix is smaller than 4×4, its entries will fill the top-left corner of the
 * resulting matrix.
 */
export function mat4(mat: AnyMatrix): Mat4;

/**
 * Creates a 4×4 matrix out of four column vectors.
 */
export function mat4(c0: Vec4, c1: Vec4, c2: Vec4, c3: Vec4): Mat4;

export function mat4(...args: (number | AnyMatrix | Vec4)[]): Mat4 {
    const out = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];
    Object.defineProperty(out, 'type', { value: 'mat4', writable: false, enumerable: false });

    const argError = () => new Error(
        "Invalid arguments passed to 'mat4':\n" +
        "Expected either:\n" +
        "    0 arguments,\n" +
        "    16 numbers,\n" +
        "    1 number,\n" +
        "    1 matrix, or\n" +
        "    4 vec4s;\n" +
        `received: (${args.map(x => (x as any).type ?? typeof x).join(', ')})`
    );

    if (args.length === 0) {
        // Leave as identity
    } else if (args.length === 16) {
        for (let i = 0; i < 16; i++) {
            if (typeof args[i] !== 'number')
                throw argError();
        }

        out[0][0] = (args as number[])[0];
        out[0][1] = (args as number[])[1];
        out[0][2] = (args as number[])[2];
        out[0][3] = (args as number[])[3];

        out[1][0] = (args as number[])[4];
        out[1][1] = (args as number[])[5];
        out[1][2] = (args as number[])[6];
        out[1][3] = (args as number[])[7];

        out[2][0] = (args as number[])[8];
        out[2][1] = (args as number[])[9];
        out[2][2] = (args as number[])[10];
        out[2][3] = (args as number[])[11];

        out[3][0] = (args as number[])[12];
        out[3][1] = (args as number[])[13];
        out[3][2] = (args as number[])[14];
        out[3][3] = (args as number[])[15];
    } else if (args.length === 4) {
        const [c0, c1, c2, c3] = args;

        if (!isVector(c0) || !isVector(c1) || !isVector(c2) || !isVector(c3)) {
            throw argError();
        } else if (c0.length != 4 || c1.length != 4 || c2.length != 4 || c3.length != 4) {
            throw argError();
        }

        out[0][0] = c0[0];
        out[0][1] = c0[1];
        out[0][2] = c0[2];
        out[0][3] = c0[3];

        out[1][0] = c1[0];
        out[1][1] = c1[1];
        out[1][2] = c1[2];
        out[1][3] = c1[3];

        out[2][0] = c2[0];
        out[2][1] = c2[1];
        out[2][2] = c2[2];
        out[2][3] = c2[3];

        out[3][0] = c3[0];
        out[3][1] = c3[1];
        out[3][2] = c3[2];
        out[3][3] = c3[3];
    } else if (args.length === 1) {
        const [m] = args;

        if (typeof m === 'number') {
            out[0][0] = m;
            out[1][1] = m;
            out[2][2] = m;
            out[3][3] = m;
        } else if (isMatrix(m)) {
            if (m.type === 'mat4') {
                out[0][0] = m[0][0]; out[0][1] = m[0][1]; out[0][2] = m[0][2]; out[0][3] = m[0][3];
                out[1][0] = m[1][0]; out[1][1] = m[1][1]; out[1][2] = m[1][2]; out[1][3] = m[1][3];
                out[2][0] = m[2][0]; out[2][1] = m[2][1]; out[2][2] = m[2][2]; out[2][3] = m[2][3];
                out[3][0] = m[3][0]; out[3][1] = m[3][1]; out[3][2] = m[3][2]; out[3][3] = m[3][3];
            } else if (m.type === 'mat3') {
                out[0][0] = m[0][0]; out[0][1] = m[0][1]; out[0][2] = m[0][2];
                out[1][0] = m[1][0]; out[1][1] = m[1][1]; out[1][2] = m[1][2];
                out[2][0] = m[2][0]; out[2][1] = m[2][1]; out[2][2] = m[2][2];
            } else if (m.type === 'mat2') {
                out[0][0] = m[0][0]; out[0][1] = m[0][1];
                out[1][0] = m[1][0]; out[1][1] = m[1][1];
            } else {
                throw argError();
            }
        } else {
            throw argError();
        }
    } else {
        throw argError();
    }

    return out as Mat4;
}
