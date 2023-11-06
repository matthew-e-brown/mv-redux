import type { VectorWithSizeof } from '../index.js';
import type { AnyVector } from '../vec.js';
import type { AnyMatrix } from '../mat.js';

import { vec2, vec3, vec4, isVector } from '../vec.js';
import { mat2, mat3, mat4, isMatrix } from '../mat.js';


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
 * @deprecated This function has been renamed to {@link sub `sub`}.
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
 * @param v The right-hand operand. Must be the same size as the matrix provided for {@link m `m`}.
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
 * @see {@link dot `dot`} For the dot product of two vectors.
 * @see {@link cross `cross`} For the cross product of two vectors.
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

    else if ((isMatrix(u) || isVector(u)) && typeof v === 'number' ||
        (isMatrix(v) || isVector(v)) && typeof u === 'number') {
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
                mat[3][0] * num, mat[3][1] * num, mat[3][2] * num, mat[3][3] * num
            );
            case 'mat3': return mat3(
                mat[0][0] * num, mat[0][1] * num, mat[0][2] * num,
                mat[1][0] * num, mat[1][1] * num, mat[1][2] * num,
                mat[2][0] * num, mat[2][1] * num, mat[2][2] * num
            );
            case 'mat2': return mat2(
                mat[0][0] * num, mat[0][1] * num,
                mat[1][0] * num, mat[1][1] * num
            );
        }
    }

    else if (isMatrix(u) && isVector(v)) {
        if (u.type === 'mat4' && v.type === 'vec4') {
            return vec4(
                (u[0][0] * v[0]) + (u[1][0] * v[1]) + (u[2][0] * v[2]) + (u[3][0] * v[3]),
                (u[0][1] * v[0]) + (u[1][1] * v[1]) + (u[2][1] * v[2]) + (u[3][1] * v[3]),
                (u[0][2] * v[0]) + (u[1][2] * v[1]) + (u[2][2] * v[2]) + (u[3][2] * v[3]),
                (u[0][3] * v[0]) + (u[1][3] * v[1]) + (u[2][3] * v[2]) + (u[3][3] * v[3])
            );
        }

        else if (u.type === 'mat3' && v.type === 'vec3') {
            return vec3(
                (u[0][0] * v[0]) + (u[1][0] * v[1]) + (u[2][0] * v[2]),
                (u[0][1] * v[0]) + (u[1][1] * v[1]) + (u[2][1] * v[2]),
                (u[0][2] * v[0]) + (u[1][2] * v[1]) + (u[2][2] * v[2])
            );
        }

        else if (u.type === 'mat2' && v.type === 'vec2') {
            return vec2(
                (u[0][0] * v[0]) + (u[1][0] * v[1]),
                (u[0][1] * v[0]) + (u[1][1] * v[1])
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
