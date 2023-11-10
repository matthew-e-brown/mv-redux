import type { AnyVector, Vec3 } from '../vec.js';

import { vec2, vec3, vec4 } from '../vec.js';
import { isVector } from '../index.js';

import { mult } from './common.js';


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
    /** @todo: inline this call to dot to avoid successive type-checking */
    if (isVector(v))
        return Math.sqrt(dot(v, v));

    const vType: string = (v as any)?.type ?? typeof v;
    throw new Error(`Invalid argument passed to 'magnitude':\nExpected a vector, received ${vType}.`);
}

/**
 * Computes the length (magnitude) of a vector.
 *
 * This function is an alias for {@link magnitude `magnitude`}.
 */
export function length(v: AnyVector): number {
    return magnitude(v);
};

/**
 * Computes a normalized version of the given vector.
 */
export function normalize<T extends AnyVector>(v: T): T {
    /** @todo: inline these calls to magnitude and mult to avoid successive type-checking */
    if (isVector(v))
        return mult(v, 1 / magnitude(v));

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
