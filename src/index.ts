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
