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
 * @deprecated The old MV library itself never uses this for anything. You should prefer using a
 * {@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array Float32Array}
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
 *
 * @note The {@linkcode Patch} type is not used by anything in this library. This function is
 * provided for backwards compatibility with the old MV library.
 */
export function patch(): Patch {
    const out = Object.defineProperties([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ], {
        type: { value: 'patch', writable: false, enumerable: false },
    }) as Patch;

    return out;
}

/**
 * Creates a new Bézier curve of all zeroes.
 *
 * @note The {@linkcode Curve} type is not used by anything in this library. This function is
 * provided for backwards compatibility with the old MV library.
 */
export function curve(): Curve {
    const out = Object.defineProperties([0, 0, 0, 0], {
        type: { value: 'curve', writable: false, enumerable: false },
    }) as Curve;

    return out;
}
