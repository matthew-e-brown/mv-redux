import type { AnyMatrix } from '../mat.js';

import { mat2, mat3, mat4, isMatrix } from '../mat.js';
import { vec3 } from '../vec.js';

import { mult, sub, add } from './common.js';
import { cross, dot } from './vec.js';


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
            let t = cross(c, b);
            let u = sub(mult(y, a), mult(x, b));
            let v = sub(mult(w, c), mult(z, d));

            const invDet = 1.0 / (dot(s, t) + dot(t, u));
            s = mult(s, invDet);
            t = mult(t, invDet);
            u = mult(u, invDet);
            v = mult(v, invDet);

            const r0 = mult(add(cross(b, v), t), y);
            const r1 = mult(sub(cross(v, a), t), x);
            const r2 = mult(add(cross(d, u), s), w);
            const r3 = mult(sub(cross(u, c), s), z);

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
