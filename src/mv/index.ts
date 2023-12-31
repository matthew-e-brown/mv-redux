import type { Vec2, Vec3, Vec4, AnyVector } from './vec.js';
import type { Mat2, Mat3, Mat4, AnyMatrix } from './mat.js';


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


export * from './vec.js';
export * from './mat.js';
export * from './ops.js';
export * from './transforms.js';


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
export function MVbuffer(size: number) {
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
export function isVector(v: unknown): v is AnyVector {
    return v != undefined && Array.isArray(v) && (
        (v as AnyVector).type === 'vec2' ||
        (v as AnyVector).type === 'vec3' ||
        (v as AnyVector).type === 'vec4'
    );
}

/**
 * Determines whether or not the given object is a matrix.
 */
export function isMatrix(v: unknown): v is AnyMatrix {
    return v != undefined && Array.isArray(v) && (
        (v as AnyMatrix).type === 'mat2' ||
        (v as AnyMatrix).type === 'mat3' ||
        (v as AnyMatrix).type === 'mat4'
    );
}

// -------------------------------------------------------------------------------------------------

// cspell:words Bézier

export type Curve = { type: 'curve' } & [number, number, number, number];
export type Patch = { type: 'patch' } & [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]];

/**
 * Creates a new Bézier patch of all zeroes.
 */
export function patch(): Patch {
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
export function curve(): Curve {
    const out = [0, 0, 0, 0];
    (out as any).type = 'curve';
    return out as Curve;
}
