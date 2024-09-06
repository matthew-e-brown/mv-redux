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


/**
 * Compiles a WebGL shader object from source.
 *
 * @param gl The WebGL rendering context from your canvas.
 *
 * @param shaderType The type of shader to compile. Must be one of
 * {@link WebGL2RenderingContext.VERTEX_SHADER `gl.VERTEX_SHADER`} or
 * {@link WebGL2RenderingContext.VERTEX_SHADER `gl.FRAGMENT_SHADER`}.
 *
 * @param shaderSrc The source code of the shader as a string.
 *
 * @returns The compiled shader object.
 */
export function compileShader(
    gl: WebGL2RenderingContext,
    shaderType: GLenum,
    shaderSrc: string,
): WebGLShader {
    let typeName: string; // Used for printing errors
    switch (shaderType) {
        case gl.VERTEX_SHADER: typeName = 'vertex'; break;
        case gl.FRAGMENT_SHADER: typeName = 'fragment'; break;
        default:
            throw new Error(
                "Invalid `shaderType`!\n" +
                "Should be one of `gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`."
            );
    }

    const shader = gl.createShader(shaderType);

    if (!shader) {
        throw new Error("Failed to initialize WebGL shader object.");
    }

    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = formatInfoLog(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error(`Failed to compile ${typeName} shader. Info log:\n${log}`);
    }

    return shader;
}


/**
 * Creates a single shader object of the given type by loading a source file with an AJAX request.
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
 * @param gl The WebGL rendering context from your canvas.
 *
 * @param shaderType The type of shader to compile. Must one of
 * {@link WebGL2RenderingContext.VERTEX_SHADER `gl.VERTEX_SHADER`} or
 * {@link WebGL2RenderingContext.VERTEX_SHADER `gl.FRAGMENT_SHADER`}.
 *
 * @param shaderURL The path/URL from which to `fetch` the given shader from.
 *
 * @returns The compiled shader object.
 */
export async function compileShaderFromURL(
    gl: WebGL2RenderingContext,
    shaderType: GLenum,
    shaderURL: string,
): Promise<WebGLShader> {
    // Check that we're not on `file://` or some other unsupported protocol
    if (!/^http/.test(window.location.protocol)) {
        throw new Error(
            'Cannot execute `fetch` on non-HTTP protocols!\n' +
            'You need to host a web server to be able to fetch shaders as file.'
        );
    }

    const shaderSrc = await fetch(shaderURL, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain, x-shader/x-fragment, x-shader/x-vertex',
        },
    }).then(response => response.ok ? response.text() : Promise.reject(response));

    return compileShader(gl, shaderType, shaderSrc);
}


/**
 * Creates a single shader object by pulling its source code and type from the current HTML
 * document.
 *
 * This is a niche use-case. For the most part, you should prefer using {@linkcode compileShader} to
 * compile an imported source-code string or {@linkcode compileShaderFromURL} to fetch it from a
 * file on your server.
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
 * const fShader = compileShaderFromScriptTag(gl, 'frag-shader1');
 * // or using the element:
 * const script = document.querySelector('script[type="x-shader/x-fragment"]');
 * const fShader = compileShaderFromScriptTag(gl, script);
 * ```
 *
 * @param gl Your WebGL context object.
 *
 * @param scriptElem The script tag to pull the shader's source code from.
 *
 * This argument may either be a string—in which case it used as an ID to select a `<script>`
 * element from the DOM—or a `<script>` element that you have already grabbed from the DOM.
 *
 * @returns The compiled shader object.
 */
export function compileShaderFromScriptTag(
    gl: WebGL2RenderingContext,
    scriptElem: string | HTMLScriptElement,
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
    let shaderType: GLenum | null = null;
    switch (scriptElem.type) {
        case 'x-shader/x-vertex': shaderType = gl.VERTEX_SHADER; break;
        case 'x-shader/x-fragment': shaderType = gl.FRAGMENT_SHADER; break;
        default:
            throw new Error(
                "Shader's script tag has unknown type!\n" +
                "Add `type=\"x-shader/x-vertex\" or \"x-shader/x-fragment\" to the element, " +
                "or pass a `shaderType` parameter directly."
            );
    }

    // Get the tag's contents and finally compile
    const shaderSrc = scriptElem.textContent!.trim(); // only null if el is a document/doctype
    return compileShader(gl, shaderType, shaderSrc);
}


/**
 * Initializes a shader program from two already-compiled GLSL shaders.
 *
 * This allows you to compile your shaders however you'd like (say if you wanted to construct their
 * source-code out of smaller strings before compiling them yourself) or to make your own
 * optimizations. For the most part, you'll be using {@linkcode compileShader} or
 * {@linkcode compileShaderFromURL} and feeding their return values into this function.
 *
 * @param gl Your WebGL context object.
 *
 * @param vertShader An already-compiled vertex shader object.
 *
 * @param fragShader An already-compiled fragment shader object.
 *
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
        const log = formatInfoLog(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error(`Failed to link shader program. Info log:\n ${log}`);
    }

    gl.detachShader(program, vertShader);
    gl.detachShader(program, fragShader);

    return program;
}


/**
 * A wrapper function for calling {@linkcode compileShaderFromScriptTag} and {@linkcode linkProgram}
 * all in one step.
 *
 * @deprecated This function is provided for backwards compatibility with the old MV library from
 * the textbook code, which requires having your shaders available as `<script>` tags. You should
 * prefer using {@linkcode compileShader} or {@linkcode compileShaderFromURL} to compile your own
 * shader objects, in conjunction with {@linkcode linkProgram} to link them together.
 *
 * @param gl Your WebGL context object.
 *
 * @param vertShader The ID of the vertex shader's `<script>` element, or the element itself.
 *
 * @param fragShader The ID of the fragment shader's `<script>` element, or the element itself.
 *
 * @returns A compiled and linked program.
 */
export function initShaders(
    gl: WebGL2RenderingContext,
    vertShader: string | HTMLScriptElement,
    fragShader: string | HTMLScriptElement,
): WebGLProgram {
    const vsCompiled = compileShaderFromScriptTag(gl, vertShader);
    const fsCompiled = compileShaderFromScriptTag(gl, fragShader);
    return linkProgram(gl, vsCompiled, fsCompiled);
}
