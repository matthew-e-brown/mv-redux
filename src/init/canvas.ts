import { throttle } from '../helpers/index.js';

/**
 * Options for {@linkcode initCanvas}.
 */
export interface CanvasOptions {
    /**
     * Overrides the canvas's width, in CSS pixels. Does nothing if {@linkcode fullscreen} is
     * enabled.
     *
     * Defaults to 512px, or the canvas's `width` attribute if it has one.
     */
    width?: number;

    /**
     * Overrides the canvas's height, in CSS pixels. Does nothing if {@linkcode fullscreen} is
     * enabled.
     *
     * Defaults to 512px, or the canvas's `height` attribute if it has one.
     */
    height?: number;

    /**
     * Updates the canvas's internal resolution so that it appears crisp/less blurry on high
     * resolution displays or when zooming the screen in and out.
     *
     * Defaults to `false`.
     *
     * @note This will cause the canvas's internal width and height to differ from its original
     * `width` and `height` attributes. This shouldn't be a problem for most users, but if you're
     * using this option you should be careful not to hard-code your values to WebGL calls the
     * depend on a width/height, like
     * {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport gl.viewport}.
     * Use the
     * {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/width canvas.width}
     * and
     * {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/height canvas.height}
     * properties directly instead of using hard-coded numbers.
     *
     * For example, on a MacBook with a Retina display (AKA all MacBooks), or on a 4K Windows laptop
     * with default scaling, the browser's
     * {@linkcode https://developer.mozilla.org/docs/Web/API/Window/devicePixelRatio devicePixelRatio}
     * will most likely be 2.0. That means that a 512×512 canvas will have its resolution increased
     * to 1024×1024.
     *
     * ```html
     * <!-- This canvas: -->
     * <canvas width="512" height="512">
     *
     * <!-- Will turn into this: -->
     * <canvas style="width: 512px; height: 512px;" width="1024" height="1024">
     * ```
     *
     * @see {@linkcode onResize} to update any WebGL viewports whenever DPI changes.
     */
    retina?: boolean;

    /**
     * Overrides the width and height of the canvas to the viewport size. Also adds an event
     * listener to `window.onresize`.
     */
    fullscreen?: boolean;

    /**
     * A custom event handler to be called whenever the canvas is resized. This callback is not
     * invoked by default:
     *
     * - If the {@linkcode retina} option is enabled, this callback is invoked whenever the window's
     *   DPI changes (e.g., when zooming the page in or out).
     * - If the {@linkcode fullscreen} is enabled, this callback is invoked whenever the window is
     *   resized.
     *
     * The `newWidth` and `newHeight` this callback receives are from the canvas's **internal
     * resolution,** as opposed to its size in CSS pixels.
     */
    onResize?: (newWidth: number, newHeight: number) => void;
}


/**
 * Retrieves the WebGL2 rendering context from an HTML `<canvas>` element. Also configures the
 * canvas's width and height according to the provided settings.
 *
 * @param canvas The canvas element to initialize.
 *
 * @param options Configuration for the canvas.
 *
 * @returns The WebGL 2 rendering context for the provided canvas.
 */
export function initCanvas(canvas: HTMLCanvasElement | null, options?: CanvasOptions): WebGL2RenderingContext {
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        window.alert("Failed to initialize canvas. Check the console for details.");
        console.error("Object %o is not a canvas.", canvas);
        throw new Error("`initCanvas` was called on a non-canvas object.");
    }

    const gl = canvas.getContext('webgl2');

    if (!gl) {
        window.alert("Failed to initialize canvas. Check the console for details.");
        throw new Error("Failed to get a `webgl2` context from HTML canvas. WebGL 2 may not be supported by this browser.");
    }

    let baseWidth: number;  // The width of the canvas in CSS pixels, before scaling for DPI.
    let baseHeight: number; // The canvas's height in CSS pixels.
    let dpi: number;        // The ratio to multiply the base width/height by.

    // Figure out how large the canvas is in plain CSS pixels, and set its inline-style to keep it
    // at that size even once we increase its actual resolution.
    if (options?.fullscreen) {
        baseWidth = window.innerWidth;
        baseHeight = window.innerHeight;

        canvas.style.width = '100vw';
        canvas.style.height = '100vh';

        document.body.style.overflow = 'hidden';    // remove scrollbars
        canvas.classList.add('fullscreen');         // so other CSS can do stuff if it wants
    } else {
        // Use the overridden sizes if provided.
        baseWidth = options?.width || canvas.clientWidth || 512;
        baseHeight = options?.height || canvas.clientHeight || 512;

        canvas.style.width = baseWidth + 'px';
        canvas.style.height = baseHeight + 'px';
    }

    if (options?.retina) {
        // Listen for changes to the screen's DPI.
        function onDPIChange() {
            dpi = window.devicePixelRatio || 1;

            // For some reason, TS can't see the `if !canvas` check we did earlier, so it thinks
            // `canvas` might be null inside this function.
            canvas!.width = baseWidth * dpi;
            canvas!.height = baseHeight * dpi;
            options?.onResize?.(canvas!.width, canvas!.height);

            // Re-add this function as a listener for the next time the display ratio changes.
            window
                .matchMedia(`(resolution: ${dpi}dppx)`)
                .addEventListener('change', onDPIChange, { once: true })
        }

        onDPIChange();
    } else {
        dpi = 1;
        canvas.width = baseWidth;
        canvas.height = baseHeight;
    }

    if (options?.fullscreen) {
        canvas.classList.add('fullscreen');
        window.addEventListener('resize', throttle(() => {
            // DPI hasn't changed, but the window size has: re-scale the canvas's resolution.
            canvas.width = window.innerWidth * dpi;
            canvas.height = window.innerHeight * dpi;
            options?.onResize?.(canvas.width, canvas.height);
        }, 100));
    }

    return gl;
}
