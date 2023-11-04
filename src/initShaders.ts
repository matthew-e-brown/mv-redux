/**
 * One of the possible shader types that WebGL2 supports. Must be one of either `gl.VERTEX_SHADER`
 * or `gl.FRAGMENT_SHADER`.
 */
type ShaderType = WebGL2RenderingContext['FRAGMENT_SHADER'] | WebGL2RenderingContext['VERTEX_SHADER'];


/**
 * Initializes a shader program from two GLSL files.
 * @param gl Your WebGL context object.
 * @param vertShaderFilepath The path to your vertex shader file.
 * @param fragShaderFilepath The path to your fragment shader file.
 * @returns A compiled program.
 */
async function initShaders(
    gl: WebGL2RenderingContext,
    vertShaderFilepath: string,
    fragShaderFilepath: string,
): Promise<WebGLProgram> {
    // Check that we're not on `file://` or some other unsupported protocol
    if (!/^http/.test(window.location.protocol)) {
        window.alert('You need to host a web server to be able to fetch shaders as file.');
        throw new Error('Cannot execute `fetch` on non-HTTP protocols!');
    }

    const [vertShader, fragShader] = await Promise.all([
        initSingleShader(gl, vertShaderFilepath, gl.VERTEX_SHADER),
        initSingleShader(gl, fragShaderFilepath, gl.FRAGMENT_SHADER),
    ]);

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
 * Creates a single shader object of the given type by loading the given file with an AJAX request.
 *
 * Unless you're doing some optimization with your own shader compilation, you probably don't want
 * to call this function from your own code. You probably want {@link initShaders `initShaders`}.
 * @param gl Your WebGL context object.
 * @param filepath The path from which to `fetch` the given shader from.
 * @param shaderType Which type of shader to create.
 * @returns A single compiled shader.
 */
async function initSingleShader(
    gl: WebGL2RenderingContext,
    filepath: string,
    shaderType: ShaderType,
): Promise<WebGLShader> {
    const typeName = shaderType == gl.VERTEX_SHADER ? 'vertex' : 'fragment';

    const shader = gl.createShader(shaderType);
    if (!shader) {
        window.alert('Failed to create WebGL shader. See devtools console for details.');
        throw new Error(`Failed to create WebGL ${typeName} shader altogether. GLHF.`);
    }

    const shaderSrc = await fetch(filepath, {
        method: 'GET',
        headers: {
            'Accept': 'text/plain, x-shader/x-fragment, x-shader/x-vertex',
        },
    }).then(response => {
        if (!response.ok) {
            window.alert(`Unable to fetch ${typeName} shader file. See devtools console or network tab for details.`);
            return Promise.reject(response);
        } else {
            return response.text();
        }
    });

    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        window.alert(`Failed to compile ${typeName} shader. See devtools console for details.`);
        throw new Error('Shader info log:\n' + formatInfoLog(gl.getShaderInfoLog(shader)));
    }

    return shader;
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
