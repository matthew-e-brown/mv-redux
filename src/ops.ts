import type { AnyVector, Vec4, Vec3, Vec2 } from './vec.js';
import type { AnyMatrix, Mat4, Mat3, Mat2 } from './mat.js';

import { vec2, vec3, vec4, isVector } from './vec.js';
import { mat2, mat3, mat4, isMatrix } from './mat.js';

export type VectorWithSizeof<M extends AnyMatrix> =
    M extends Mat4 ? Vec4 :
    M extends Mat3 ? Vec3 :
    M extends Mat2 ? Vec2 :
    never;

export type MatrixWithSizeof<V extends AnyVector> =
    V extends Vec4 ? Mat4 :
    V extends Vec3 ? Mat3 :
    V extends Vec2 ? Mat2 :
    never;


// =================================================================================================
// Common operations
// =================================================================================================

/**
 * Checks if two matrices or vectors have all equal components.
 *
 * @throws An error will occur when attempting to compare mismatching types, including comparisons
 * between vectors and matrices of different lengths/sizes.
 */
export function equal<T extends AnyVector | AnyMatrix>(u: T, v: T): boolean {
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
 * 180 over π. Multiplying an angle represented in radians by this number will convert it to
 * degrees.
 */
export const RADIANS_TO_DEGREES = 180 / Math.PI;

/**
 * π over 180. Multiplying an angle represented in degrees by this number will convert it to
 * radians.
 */
export const DEGREES_TO_RADIANS = Math.PI / 180;


/**
 * Converts an angle from degrees to radians.
 */
export function radians(degrees: number): number;

/**
 * Converts a vector of angles from degrees to radians.
 */
export function radians<T extends AnyVector>(degAngles: T): T;

export function radians<T extends AnyVector>(d: number | T): number | T {
    if (isVector(d))
        return mult(d, DEGREES_TO_RADIANS);
    else if (typeof d === 'number')
        return d * DEGREES_TO_RADIANS;

    const dType: string = (d as any)?.type ?? typeof d;
    throw new Error(`Invalid argument passed to 'radians':\nExpected number or vector, received ${dType}.`);
}


/**
 * Converts an angle from radians to degrees.
 */
export function degrees(radians: number): number;

/**
 * Converts a vector of angles from radians to degrees.
 */
export function degrees<T extends AnyVector>(radAngles: T): T;

export function degrees<T extends AnyVector>(r: number | T): number | T {
    if (isVector(r))
        return mult(r, RADIANS_TO_DEGREES);
    else if (typeof r === 'number')
        return r * RADIANS_TO_DEGREES;

    const rType: string = (r as any)?.type ?? typeof r;
    throw new Error(`Invalid argument passed to 'degrees':\nExpected number or vector, received ${rType}.`);
}

// -------------------------------------------------------------------------------------------------

/**
 * Computes the sum of two vectors.
 * @param u The left-hand operand.
 * @param v The right-hand operand.
 * @throws An error will occur when attempting to add two non-vector types, or two vector types of
 * different length.
 */
export function add<T extends AnyVector>(u: T, v: T): T;

/**
 * Computes the sum of two matrices.
 * @param a The left-hand operand.
 * @param b The right-hand operand.
 * @throws An error will occur when attempting to add two non-matrix types, or two matrix types of
 * different size.
 */
export function add<T extends AnyMatrix>(a: T, b: T): T;

export function add(u: AnyVector | AnyMatrix, v: AnyVector | AnyMatrix): AnyVector | AnyMatrix {
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
export function sub<T extends AnyVector>(u: T, v: T): T;

/**
 * Computes the difference of two matrices.
 * @param a The left-hand operand.
 * @param b The right-hand operand.
 * @throws An error will occur when attempting to subtract two non-matrix types, or two matrix types
 * of different size.
 */
export function sub<T extends AnyMatrix>(a: T, b: T): T;

export function sub(u: AnyVector | AnyMatrix, v: AnyVector | AnyMatrix): AnyVector | AnyMatrix {
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
 * @deprecated This function has been renamed to {@linkcode sub}.
 */
export function subtract<T extends AnyVector | AnyMatrix>(u: T, v: T): T {
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
export function mult<T extends AnyMatrix>(a: T, b: T): T;

/**
 * Computes the scalar multiple of a vector or matrix.
 * @param u The matrix or vector.
 * @param scalar A scalar multiplier.
 * @throws An error will occur when attempting to multiply two non-matrix or non-vector types (aside
 * from a matrix or vector with a number), or two matrix/vector types of different size.
 */
export function mult<T extends AnyVector | AnyMatrix>(u: T, scalar: number): T;

/**
 * Computes the scalar multiple of a vector or matrix.
 * @param scalar A scalar multiplier.
 * @param u The matrix or vector.
 * @throws An error will occur when attempting to multiply two non-matrix or non-vector types (aside
 * from a matrix or vector with a number), or two matrix/vector types of different size.
 */
export function mult<T extends AnyVector | AnyMatrix>(scalar: number, u: T): T;

/**
 * Computes the matrix product between a matrix and vector.
 * @param m The left-hand operand.
 * @param v The right-hand operand. Must be the same size as the matrix provided for {@linkcode m}.
 * @throws An error will occur when attempting to multiply two non-matrix or non-vector types (aside
 * from a matrix or vector with a number), or two matrix/vector types of different size.
 */
export function mult<M extends AnyMatrix, V extends VectorWithSizeof<M>>(m: M, v: V): V;

/**
 * Computes the element-wise product of two vectors, also known as the
 * {@link https://en.wikipedia.org/wiki/Hadamard_product_%28matrices%29 _Hadamard product_}.
 *
 * @param u
 * @param v
 *
 * @see {@linkcode dot} For the dot product of two vectors.
 * @see {@linkcode cross} For the cross product of two vectors.
 *
 * @throws An error will occur when attempting to multiply two non-matrix or non-vector types (aside
 * from a matrix or vector with a number), or two matrix/vector types of different size.
 */
export function mult<T extends AnyVector>(u: T, v: T): T;

export function mult(u: AnyVector | AnyMatrix | number, v: AnyVector | AnyMatrix | number): AnyVector | AnyMatrix {
    if (isMatrix(u) && isMatrix(v)) {
        if (u.type === 'mat4' && v.type === 'mat4') {
            return mat4(
            /* col 0 ----------------------------------------------------------------------------------------- */
                /* row 0 */(u[0][0] * v[0][0]) + (u[0][1] * v[1][0]) + (u[0][2] * v[2][0]) + (u[0][3] * v[3][0]),
                /* row 1 */(u[0][0] * v[0][1]) + (u[0][1] * v[1][1]) + (u[0][2] * v[2][1]) + (u[0][3] * v[3][1]),
                /* row 2 */(u[0][0] * v[0][2]) + (u[0][1] * v[1][2]) + (u[0][2] * v[2][2]) + (u[0][3] * v[3][2]),
                /* row 3 */(u[0][0] * v[0][3]) + (u[0][1] * v[1][3]) + (u[0][2] * v[2][3]) + (u[0][3] * v[3][3]),
            /* col 1 ----------------------------------------------------------------------------------------- */
                /* row 0 */(u[1][0] * v[0][0]) + (u[1][1] * v[1][0]) + (u[1][2] * v[2][0]) + (u[1][3] * v[3][0]),
                /* row 1 */(u[1][0] * v[0][1]) + (u[1][1] * v[1][1]) + (u[1][2] * v[2][1]) + (u[1][3] * v[3][1]),
                /* row 2 */(u[1][0] * v[0][2]) + (u[1][1] * v[1][2]) + (u[1][2] * v[2][2]) + (u[1][3] * v[3][2]),
                /* row 3 */(u[1][0] * v[0][3]) + (u[1][1] * v[1][3]) + (u[1][2] * v[2][3]) + (u[1][3] * v[3][3]),
            /* col 2 ----------------------------------------------------------------------------------------- */
                /* row 0 */(u[2][0] * v[0][0]) + (u[2][1] * v[1][0]) + (u[2][2] * v[2][0]) + (u[2][3] * v[3][0]),
                /* row 1 */(u[2][0] * v[0][1]) + (u[2][1] * v[1][1]) + (u[2][2] * v[2][1]) + (u[2][3] * v[3][1]),
                /* row 2 */(u[2][0] * v[0][2]) + (u[2][1] * v[1][2]) + (u[2][2] * v[2][2]) + (u[2][3] * v[3][2]),
                /* row 3 */(u[2][0] * v[0][3]) + (u[2][1] * v[1][3]) + (u[2][2] * v[2][3]) + (u[2][3] * v[3][3]),
            /* col 3 ----------------------------------------------------------------------------------------- */
                /* row 0 */(u[3][0] * v[0][0]) + (u[3][1] * v[1][0]) + (u[3][2] * v[2][0]) + (u[3][3] * v[3][0]),
                /* row 1 */(u[3][0] * v[0][1]) + (u[3][1] * v[1][1]) + (u[3][2] * v[2][1]) + (u[3][3] * v[3][1]),
                /* row 2 */(u[3][0] * v[0][2]) + (u[3][1] * v[1][2]) + (u[3][2] * v[2][2]) + (u[3][3] * v[3][2]),
                /* row 3 */(u[3][0] * v[0][3]) + (u[3][1] * v[1][3]) + (u[3][2] * v[2][3]) + (u[3][3] * v[3][3]),
            );
        }

        else if (u.type === 'mat3' && v.type === 'mat3') {
            return mat3(
            /* col 0 ------------------------------------------------------------------- */
                /* row 0 */(u[0][0] * v[0][0]) + (u[0][1] * v[1][0]) + (u[0][2] * v[2][0]),
                /* row 1 */(u[0][0] * v[0][1]) + (u[0][1] * v[1][1]) + (u[0][2] * v[2][1]),
                /* row 2 */(u[0][0] * v[0][2]) + (u[0][1] * v[1][2]) + (u[0][2] * v[2][2]),
            /* col 1 ------------------------------------------------------------------- */
                /* row 0 */(u[1][0] * v[0][0]) + (u[1][1] * v[1][0]) + (u[1][2] * v[2][0]),
                /* row 1 */(u[1][0] * v[0][1]) + (u[1][1] * v[1][1]) + (u[1][2] * v[2][1]),
                /* row 2 */(u[1][0] * v[0][2]) + (u[1][1] * v[1][2]) + (u[1][2] * v[2][2]),
            /* col 2 ------------------------------------------------------------------- */
                /* row 0 */(u[2][0] * v[0][0]) + (u[2][1] * v[1][0]) + (u[2][2] * v[2][0]),
                /* row 1 */(u[2][0] * v[0][1]) + (u[2][1] * v[1][1]) + (u[2][2] * v[2][1]),
                /* row 2 */(u[2][0] * v[0][2]) + (u[2][1] * v[1][2]) + (u[2][2] * v[2][2]),
            );
        }

        else if (u.type === 'mat2' && v.type === 'mat2') {
            return mat2(
            /* col 0 --------------------------------------------- */
                /* row 0 */(u[0][0] * v[0][0]) + (u[0][1] * v[1][0]),
                /* row 1 */(u[0][0] * v[0][1]) + (u[0][1] * v[1][1]),
            /* col 1 --------------------------------------------- */
                /* row 0 */(u[1][0] * v[0][0]) + (u[1][1] * v[1][0]),
                /* row 1 */(u[1][0] * v[0][1]) + (u[1][1] * v[1][1]),
            );
        }
    }

    let uMat = false; // track which one is the matrix when we do the following xor:
    if (
        (uMat = ((isMatrix(u) || isVector(u)) && typeof v === 'number')) ||
        typeof u === 'number' && (isMatrix(v) || isVector(v))
    ) {
        let mat, num;
        if (uMat) {
            mat = u as unknown as AnyVector | AnyMatrix;
            num = v as unknown as number;
        } else {
            mat = v as unknown as AnyVector | AnyMatrix;
            num = u as unknown as number;
        }

        switch (mat.type) {
            case 'vec4': return vec4(mat[0] * num, mat[1] * num, mat[2] * num, mat[3] * num);
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
                (u[0][0] * v[0]) + (u[0][1] * v[1]) + (u[0][2] * v[2]) + (u[0][3] * v[3]),
                (u[1][0] * v[0]) + (u[1][1] * v[1]) + (u[1][2] * v[2]) + (u[1][3] * v[3]),
                (u[2][0] * v[0]) + (u[2][1] * v[1]) + (u[2][2] * v[2]) + (u[2][3] * v[3]),
                (u[3][0] * v[0]) + (u[3][1] * v[1]) + (u[3][2] * v[2]) + (u[3][3] * v[3]),
            );
        }

        else if (u.type === 'mat3' && v.type === 'vec3') {
            return vec3(
                (u[0][0] * v[0]) + (u[0][1] * v[1]) + (u[0][2] * v[2]),
                (u[1][0] * v[0]) + (u[1][1] * v[1]) + (u[1][2] * v[2]),
                (u[2][0] * v[0]) + (u[2][1] * v[1]) + (u[2][2] * v[2]),
            );
        }

        else if (u.type === 'mat2' && v.type === 'vec2') {
            return vec2(
                (u[0][0] * v[0]) + (u[0][1] * v[1]),
                (u[1][0] * v[0]) + (u[1][1] * v[1]),
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
    const msg = "Invalid arguments passed to 'mult':\n";

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

// =================================================================================================
// Vector operations
// =================================================================================================

/**
 * Computes the dot product of two vectors.
 */
export function dot<T extends AnyVector>(u: T, v: T): number {
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
export function cross(u: Vec3, v: Vec3): Vec3 {
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
export function magnitude(v: AnyVector): number {
    if (isVector(v)) {
        // Inlined call to `dot(v, v)`:
        switch (v.type) {
            case 'vec4': return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2] + v[3] * v[3]);
            case 'vec3': return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            case 'vec2': return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        }
    }

    const vType: string = (v as any)?.type ?? typeof v;
    throw new Error(`Invalid argument passed to 'magnitude':\nExpected a vector, received ${vType}.`);
}

/**
 * Computes the length (magnitude) of a vector.
 *
 * This function is an alias for {@linkcode magnitude}.
 */
export function length(v: AnyVector): number {
    return magnitude(v);
};

/**
 * Computes a normalized version of the given vector.
 */
export function normalize<T extends AnyVector>(v: T): T {
    if (isVector(v)) {
        // Inlined calls to `magnitude` and `mult`, plus a check for zero magnitude
        let m: number;
        switch (v.type) {
            case 'vec4':
                m = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2] + v[3] * v[3]);
                return ((m == 0) ? vec4(0) : vec4(v[0] / m, v[1] / m, v[2] / m, v[3] / m)) as T;
            case 'vec3':
                m = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
                return ((m == 0) ? vec3(0) : vec3(v[0] / m, v[1] / m, v[2] / m)) as T;
            case 'vec2':
                m = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
                return ((m == 0) ? vec2(0) : vec2(v[0] / m, v[1] / m)) as T;
        }
    }

    const vType: string = (v as any)?.type ?? typeof v;
    throw new Error(`Invalid argument passed to 'normalize':\nExpected a vector, received ${vType}.`);
}

/**
 * Negates the given vector (i.e., multiplies it by -1).
 */
export function negate<T extends AnyVector>(v: T): T {
    if (isVector(v)) {
        switch (v.type) {
            case 'vec4': return vec4(-v[0], -v[1], -v[2], -v[3]) as T;
            case 'vec3': return vec3(-v[0], -v[1], -v[2]) as T;
            case 'vec2': return vec2(-v[0], -v[1]) as T;
        }
    }

    const vType: string = (v as any)?.type ?? typeof v;
    throw new Error(`Invalid argument passed to 'negate':\nExpected a vector, received ${vType}.`);
}

/**
 * Mixes two vectors or two numbers together with ratio `s`.
 *
 * `u` is multiplied by `1 - s` before being added to `s * v`.
 * @param u The first vector or number.
 * @param v The second vector or number.
 * @param s A number from 0 to 1; the ratio of `u` to `v`.
 */
export function mix<T extends AnyVector | number>(u: T, v: T, s: number): T {
    if (typeof s !== 'number') {
        const sType: string = (s as any)?.type ?? typeof s;
        throw new Error(`Invalid argument passed to 'mix':\nExpected 's' to be a number; received ${sType}.`);
    }

    // Clamp to [0, 1]
    s = Math.min(1, Math.max(s, 0));
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
// Matrix operations
// =================================================================================================

/**
 * Computes the determinant of a matrix.
 */
export function det(m: AnyMatrix): number {
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
            const u = sub(mult(y, a), mult(x, b));
            const v = sub(mult(w, c), mult(z, d));

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
export function inverse<T extends AnyMatrix>(m: T): T {
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
            let t = cross(c, d);
            let u = sub(mult(y, a), mult(x, b));
            let v = sub(mult(w, c), mult(z, d));

            const invDet = 1.0 / (dot(s, v) + dot(t, u));
            s = mult(s, invDet);
            t = mult(t, invDet);
            u = mult(u, invDet);
            v = mult(v, invDet);

            const r0 = add(cross(b, v), mult(y, t));
            const r1 = sub(cross(v, a), mult(x, t));
            const r2 = add(cross(d, u), mult(w, s));
            const r3 = sub(cross(u, c), mult(z, s));

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
export function transpose<T extends AnyMatrix>(m: T): T {
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
