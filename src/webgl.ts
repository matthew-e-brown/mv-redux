/**
 * Creates a single shader object of the given type by loading a `.glsl` file with an AJAX request.
 *
 * ## Example
 *
 * ```js
 * const vShader = await compileShaderFromURL(gl, gl.VERTEX_SHADER, './shaders/vert.glsl');
 * const fShader = await compileShaderFromURL(gl, gl.FRAGMENT_SHADER, './shaders/frag.glsl');
 * const program = linkProgram(gl, vShader, fShader);
 * ```
 *
 * You could also use `Promise.all` to compile both in parallel:
 *
 * ```js
 * const [vShader, fShader] = await Promise.all([
 *      compileShaderFromURL(gl, gl.VERTEX_SHADER, './shaders/vert.glsl'),
 *      compileShaderFromURL(gl, gl.FRAGMENT_SHADER, './shaders/frag.glsl'),
 * ]);
 * const program = linkProgram(gl, vShader, fShader);
 * ```
 *
 * @note This function will **not** work on the `file://` protocol. You **must** be using an actual
 * server to use `fetch` (be it a local server or an actual deployment).
 *
 * @param gl Your WebGL context object.
 *
 * @param shaderType Which type of shader to create. One of `gl.VERTEX_SHADER` or
 * `gl.FRAGMENT_SHADER`.
 *
 * @param shaderURL The path/URL from which to `fetch` the given shader from.
 *
 * @returns A single compiled shader.
 *
 */
export async function compileShaderFromURL(
    gl: WebGL2RenderingContext,
    shaderType: WebGL2RenderingContext['FRAGMENT_SHADER'] | WebGL2RenderingContext['VERTEX_SHADER'],
    shaderURL: string,
): Promise<WebGLShader> {
    // For printing.
    const typeName = shaderType == gl.VERTEX_SHADER ? 'vertex' : 'fragment';

    // Check that we're not on `file://` or some other unsupported protocol
    if (!/^http/.test(window.location.protocol)) {
        throw new Error(
            'Cannot execute `fetch` on non-HTTP protocols!\n' +
            'You need to host a web server to be able to fetch shaders as file.'
        );
    }

    const shader = gl.createShader(shaderType);
    if (!shader) {
        throw new Error(`Failed to create WebGL ${typeName} shader altogether. GLHF.`);
    }

    const shaderSrc = await fetch(shaderURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain, x-shader/x-fragment, x-shader/x-vertex',
        },
    }).then(response => response.ok ? response.text() : Promise.reject(response));

    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        throw new Error('Shader info log:\n' + formatInfoLog(log));
    }

    return shader;
}


/**
 * Creates a single shader object by pulling its source code and type from the current HTML
 * document.
 *
 * ## Example
 *
 * This shader:
 *
 * ```html
 * <script type="x-shader/x-fragment" id="frag-shader1">
 * #version 300 es
 * <!-- .... -->
 * </script>
 * ```
 *
 * Could be compiled with:
 *
 * ```js
 * // using an ID:
 * const fShader = compileShaderFromDocument(gl, 'frag-shader1');
 * // or using the element:
 * const script = document.querySelector('script[type="x-shader/x-fragment"]');
 * const fShader = compileShaderFromDocument(gl, script);
 * ```
 *
 * @param gl Your WebGL context object.
 *
 * @param scriptElem The script tag to pull the shader's source code from.
 *
 * This argument may either be a string—in which case it used as an ID to select a `<script>`
 * element from the DOM—or a `<script>` element that you have already grabbed from the DOM.
 *
 * @param shaderType Which type of shader to create. One of `gl.FRAGMENT_SHADER` or
 * `gl.VERTEX_SHADER`. If omitted, this function attempts to find one of `x-shader/x-vertex` or
 * `x-shader/x-fragment` in the script tag's `type` attribute.
 */
export function compileShaderFromDocument(
    gl: WebGL2RenderingContext,
    scriptElem: string | HTMLScriptElement,
    shaderType?: WebGL2RenderingContext['VERTEX_SHADER'] | WebGL2RenderingContext['FRAGMENT_SHADER'],
): WebGLShader {
    // Get script tag
    if (typeof scriptElem === 'string') {
        const tag = document.getElementById(scriptElem);
        if (!tag) {
            throw new Error(`There is no element with an ID of '${scriptElem}'!`);
        } else if (!(tag instanceof HTMLScriptElement)) {
            throw new Error(`Element with ID '${scriptElem}' is not a <script> tag!`);
        } else {
            scriptElem = tag;
        }
    }

    // Determine which shader we're making
    if (shaderType === undefined) {
        switch (scriptElem.type) {
            case 'x-shader/x-vertex': shaderType = gl.VERTEX_SHADER; break;
            case 'x-shader/x-fragment': shaderType = gl.FRAGMENT_SHADER; break;
            default:
                throw new Error(
                    "Shader's script tag has unknown type!\n" +
                    "Add `type=\"x-shader/x-vertex\" or \"x-shader/x-fragment\" to the element, " +
                    "or pass `gl.VERTEX_SHADER`/`gl.FRAGMENT_SHADER` directly."
                );
        }
    }

    // For printing.
    const typeName = shaderType == gl.VERTEX_SHADER ? 'vertex' : 'fragment';

    // Get the tag's contents and finally compile
    const shaderSrc = scriptElem.textContent!.trim(); // only null if el is a document/doctype
    const shader = gl.createShader(shaderType);

    if (!shader) {
        throw new Error(`Failed to create WebGL ${typeName} shader altogether. GLHF.`);
    }

    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        throw new Error('Shader info log:\n' + formatInfoLog(log));
    }

    return shader;
}


/**
 * Initializes a shader program from two already-compiled GLSL shaders.
 *
 * This allows you to compile your shaders however you'd like (say if you wanted to construct their
 * source-code out of smaller strings before compiling them yourself) or to make your own
 * optimizations. For the most part, you'll be using {@link compileShaderFromDocument} or
 * {@link compileShaderFromURL} and feeding their return values into this function.
 * @param gl Your WebGL context object.
 * @param vertShaderFilepath The path to your vertex shader file.
 * @param fragShaderFilepath The path to your fragment shader file.
 * @returns A linked program made from the two provided shaders.
 */
export function linkProgram(
    gl: WebGL2RenderingContext,
    vertShader: WebGLShader,
    fragShader: WebGLShader,
): WebGLProgram {
    const program = gl.createProgram();
    if (!program) {
        window.alert('Failed to create WebGL program. See devtools console for details.');
        throw new Error('Failed to create WebGL program altogether. GLHF.');
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        window.alert('Failed to link program. See devtools console for details.');
        throw new Error('Program info log:\n' + formatInfoLog(gl.getProgramInfoLog(program)));
    }

    // Once both shaders have been linked into a program, we don't need to keep them around.
    gl.detachShader(program, vertShader);
    gl.detachShader(program, fragShader);
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

    return program;
}


/**
 * A wrapper function for calling {@link compileShaderFromDocument} and {@link linkProgram} all in
 * one step.
 *
 * This function corresponds to the old `initShaders` function from the original MV library.
 * @param gl Your WebGL context object.
 * @param vertShader The ID of the vertex shader's `<script>` element, or the element itself.
 * @param fragShader The ID of the fragment shader's `<script>` element, or the element itself.
 * @returns A compiled and linked program.
 */
export function initShaders(
    gl: WebGL2RenderingContext,
    vertShader: string | HTMLScriptElement,
    fragShader: string | HTMLScriptElement,
): WebGLProgram {
    const vsCompiled = compileShaderFromDocument(gl, vertShader, gl.VERTEX_SHADER);
    const fsCompiled = compileShaderFromDocument(gl, fragShader, gl.FRAGMENT_SHADER);
    return linkProgram(gl, vsCompiled, fsCompiled);
}


/**
 * Strips an info log and wraps it with \```backticks\```. A tiny bit of extra processing is needed
 * to get it to print nice since WebGL returns a string with a NUL byte it in.
 * @param infoLog The info log, directly as returned by WebGL.
 */
function formatInfoLog(infoLog: string | null): string {
    if (infoLog === null) {
        return '[INFO LOG MISSING?]';
    } else {
        return '```\n' + infoLog.replace(/\u0000/g, '').trim() + '\n```';
    }
}
