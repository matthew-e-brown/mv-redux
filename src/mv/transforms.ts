import type { Mat3, Mat4 } from './mat.js';
import type { Vec3 } from './vec.js';

import { isVector, vec3 } from './vec.js';
import { isMatrix, mat3, mat4 } from './mat.js';
import { radians, sub, dot, cross, normalize, inverse, transpose  } from './ops.js';

// TODO: better doc comments for these.

// -------------------------------------------------------------------------------------------------

/**
 * Constructs a transformation matrix that will shift points along the three axes by the offsets
 * given as the components of a vector.
 */
export function translationMatrix(translation: Vec3): Mat4;

/**
 * Constructs a transformation matrix that will shift points along the three axes by the given
 * offsets.
 */
export function translationMatrix(x: number, y: number, z: number): Mat4;

export function translationMatrix(
    arg0: Vec3 | number,
    arg1?: number,
    arg2?: number,
): Mat4 {
    let x: number, y: number, z: number;

    if (isVector(arg0) && arg0.type === 'vec3' && arg1 === undefined && arg2 === undefined) {
        [x, y, z] = arg0;
    } else if (typeof arg0 === 'number' && typeof arg1 === 'number' && typeof arg2 === 'number') {
        x = arg0;
        y = arg1;
        z = arg2;
    } else {
        // Error case
        const type0: string = (arg0 as any)?.type ?? typeof arg0;
        const type1: string = (arg1 as any)?.type ?? typeof arg1;
        const type2: string = (arg2 as any)?.type ?? typeof arg2;
        const received = [type0, type1, type2].filter(s => s).join(', ');
        throw new Error(
            "Invalid arguments passed to 'translationMatrix':\n" +
            `Expected a 2D or 3D position, either as numbers or as a single vector; received (${received}).`
        );
    }

    return mat4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1,
    );
}

// -------------------------------------------------------------------------------------------------

/**
 * Constructs a transformation matrix that will rotate points around the given axis by some angle.
 * @param axis Which axis to rotate around.
 * @param angle How far (**in degrees**) to rotate around the axis.
 */
export function rotationMatrix(axis: 'x' | 'y' | 'z', angle: number): Mat4;

/**
 * Constructs a transformation matrix that will rotate points around an arbitrary axis.
 * @param axis A unit-vector that describes the direction of the axis to rotate around.
 * @param angle How far (**in degrees**) to rotate around the axis.
 */
export function rotationMatrix(axis: Vec3, angle: number): Mat4;

export function rotationMatrix(axis: 'x' | 'y' | 'z' | Vec3, angle: number): Mat4 {
    if (typeof angle !== 'number') {
        const thetaType = (angle as any)?.type ?? typeof angle;
        throw new Error(
            "Invalid argument passed to 'rotationMatrix':\n" +
            `Expected 'theta' to be a number, received (${thetaType}).`
        );
    }

    const sin = Math.sin(radians(angle));
    const cos = Math.cos(radians(angle));

    if (typeof axis === 'string') {
        switch (axis.toLowerCase()) {
            case 'x': return mat4(
                1.0, 0.0, 0.0, 0.0,
                0.0, cos, -sin, 0.0,
                0.0, sin, cos, 0.0,
                0.0, 0.0, 0.0, 1.0,
            );
            case 'y': return mat4(
                cos, 0.0, sin, 0.0,
                0.0, 1.0, 0.0, 0.0,
                -sin, 0.0, cos, 0.0,
                0.0, 0.0, 0.0, 1.0,
            );
            case 'z': return mat4(
                cos, -sin, 0.0, 0.0,
                sin, cos, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0,
            );
        }
    }

    else if (isVector(axis) && axis.type === 'vec3') {
        const [x, y, z] = normalize(axis);
        const omc = 1.0 - cos; // "one minus cosine"
        return mat4(
            (cos + x * x * omc), (y * x * omc + z * sin), (z * x * omc - y * sin), 0.0,
            (x * y * omc - z * sin), (cos + y * y * cos), (z * y * omc + x * sin), 0.0,
            (x * z * omc + y * sin), (y * z * omc - x * sin), (cos + z * z * omc), 0.0,
            0.0, 0.0, 0.0, 1.0,
        );
    }

    const axisType: string = (axis as any)?.type ?? typeof axis;
    const angleType: string = (angle as any)?.type ?? typeof angle;
    throw new Error(
        "Invalid arguments passed to 'rotationMatrix':\n" +
        `Expected an axis ('x', 'y', 'z', or a vec3) and an angle; received (${axisType}, ${angleType}).`
    );
}

// -------------------------------------------------------------------------------------------------

/**
 * Constructs a scale matrix that will resize an object by the same amount in all three dimensions.
 */
export function scaleMatrix(uniformScale: number): Mat4;

/**
 * Constructs a scale matrix that will resize an object along the X, Y, and Z axes.
 * @param xyzScales A vector describing how much object should squash or stretch on the X, Y, and Z
 * axes respectively.
 */
export function scaleMatrix(xyzScales: Vec3): Mat4;

/**
 * Constructs a scale matrix that will resize an object along the X, Y, and Z axes respectively.
 */
export function scaleMatrix(x: number, y: number, z: number): Mat4;

export function scaleMatrix(arg0: number | Vec3, arg1?: number, arg2?: number): Mat4 {
    let x: number, y: number, z: number;

    if (typeof arg0 === 'number' && arg1 === undefined && arg2 === undefined) {
        x = y = z = arg0;
    } else if (typeof arg0 === 'number' && typeof arg1 === 'number' && typeof arg2 === 'number') {
        x = arg0;
        y = arg1;
        z = arg2;
    } else if (isVector(arg0) && arg0.type === 'vec3') {
        [x, y, z] = arg0;
    } else {
        // Error case
        const type0: string = (arg0 as any)?.type ?? typeof arg0;
        const type1: string = (arg1 as any)?.type ?? typeof arg1;
        const type2: string = (arg2 as any)?.type ?? typeof arg2;
        const received = [type0, type1, type2].filter(s => s).join(', ');
        throw new Error(
            "Invalid arguments passed to 'scaleMatrix':\n" +
            `Expected a uniform or per-axis scale, either as numbers or as a single vector; received (${received}).`
        );
    }

    return mat4(
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1,
    );
}

// -------------------------------------------------------------------------------------------------

/**
 * Constructs a _look-at matrix;_ a model–view matrix that will reposition points in 3D space such
 * that the visible points mimic the viewport of a virtual camera.
 * @param eyePosition The position of the virtual camera.
 * @param target Where in space the virtual camera should point.
 * @param upVec A unit-vector which describes a direction. The virtual camera is oriented such that
 * "up" on the screen, from its perspective, aligns with this direction. Defaults to `(0, 1, 0)`;
 * upwards along the Y-axis.
 */
export function lookAtMatrix(eyePosition: Vec3, target: Vec3, upVec: Vec3 = vec3(0, 1, 0)): Mat4 {
    if (
        isVector(eyePosition) && eyePosition.type === 'vec3' &&
        isVector(target) && target.type === 'vec3' &&
        isVector(upVec) && upVec.type === 'vec3'
    ) {
        // Compute the new axes that our camera's coordinate space contains
        const zAxis = normalize(sub(target, eyePosition));
        const xAxis = normalize(cross(zAxis, upVec));
        const yAxis = cross(xAxis, zAxis); // norm × norm = norm

        // Negate Z to go from left-handed to right-handed coordinate system
        zAxis[0] = -zAxis[0];
        zAxis[1] = -zAxis[1];
        zAxis[2] = -zAxis[2];

        // Figure out how far away to move everything else
        const xTrans = -dot(xAxis, eyePosition);
        const zTrans = -dot(zAxis, eyePosition);
        const yTrans = -dot(yAxis, eyePosition);

        return mat4(
            xAxis[0], xAxis[1], xAxis[2], xTrans,
            yAxis[0], yAxis[1], yAxis[2], yTrans,
            zAxis[0], zAxis[1], zAxis[2], zTrans,
            0, 0, 0, 1,
        );
    }

    const cType: string = (eyePosition as any)?.type ?? typeof eyePosition;
    const tType: string = (target as any)?.type ?? typeof target;
    const uType: string = (upVec as any)?.type ?? typeof upVec;
    throw new Error(
        "Invalid arguments passed to 'lookAtMatrix':\n" +
        `Expected three 3D vectors, received (${cType}, ${tType}, ${uType}).`
    );
}

// -------------------------------------------------------------------------------------------------

/**
 * Constructs a _perspective projection matrix._
 * @param fovY The desired **vertical** field-of-view.
 * @param aspectRatio The ratio of the screen's width to its height.
 * @param near The near clipping-plane's distance from the camera. Anything closer than this
 * distance will be cut off.
 * @param far The far clipping-plane's distance from the camera. Anything further than this distance
 * will not be visible.
 *
 * @see {@link https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/projection-matrix-introduction.html}
 */
export function perspectiveMatrix(fovY: number, aspectRatio: number, near: number, far: number): Mat4 {
    if (
        typeof fovY !== 'number' ||
        typeof aspectRatio !== 'number' ||
        typeof near !== 'number' ||
        typeof far !== 'number'
    ) {
        const fovType: string = (fovY as any)?.type ?? typeof fovY;
        const aspectType: string = (aspectRatio as any)?.type ?? typeof aspectRatio;
        const nearType: string = (near as any)?.type ?? typeof near;
        const farType: string = (far as any)?.type ?? typeof far;
        throw new Error(
            "Invalid arguments passed to 'perspectiveMatrix':\nExpected four numbers, received " +
            `(${fovType}, ${aspectType}, ${nearType}, ${farType})`
        );
    }

    const fov = 1 / Math.tan(radians(fovY) / 2);
    const depth = far - near;

    const result = mat4();
    result[0][0] = fov / aspectRatio;
    result[1][1] = fov;
    result[2][2] = -(near + far) / depth;
    result[2][3] = -2 * near * far / depth;
    result[3][2] = -1;
    result[3][3] = 0;

    return result;
}

// -------------------------------------------------------------------------------------------------

/**
 * Constructs an _orthographic projection matrix_.
 *
 * @see {@link https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/orthographic-projection-matrix.html}.
 */
export function orthographicMatrix(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number,
): Mat4 {
    if (
        typeof left !== 'number' ||
        typeof right !== 'number' ||
        typeof bottom !== 'number' ||
        typeof top !== 'number' ||
        typeof near !== 'number' ||
        typeof far !== 'number'
    ) {
        const lType: string = (left as any)?.type ?? typeof left;
        const rType: string = (right as any)?.type ?? typeof right;
        const bType: string = (bottom as any)?.type ?? typeof bottom;
        const tType: string = (top as any)?.type ?? typeof top;
        const nType: string = (near as any)?.type ?? typeof near;
        const fType: string = (far as any)?.type ?? typeof far;
        throw new Error(
            "Invalid arguments passed to 'orthographicMatrix':\nExpected six numbers, received " +
            `(${lType}, ${rType}, ${bType}, ${bType}, ${tType}, ${nType}, ${fType}).`
        );
    }

    const width = right - left;
    const height = top - bottom;
    const depth = far - near;

    const result = mat4();
    result[0][0] = 2.0 / width;
    result[1][1] = 2.0 / height;
    result[2][2] = -2.0 / depth;

    result[0][3] = -(left + right) / width;
    result[1][3] = -(top + bottom) / height;
    result[2][3] = -(near + far) / depth;

    return result;
}

// -------------------------------------------------------------------------------------------------

/**
 * Constructs a normal matrix from a regular transformation matrix.
 * @param m The transformation matrix to create a normal matrix from.
 * @param asMat3 Whether or not the result should be trimmed down from a `Mat4` to a `Mat3`.
 * Defaults to `false`.
 */
export function normalMatrix(m: Mat4, asMat3?: false): Mat4;

/**
 * Constructs a normal matrix from a regular transformation matrix.
 * @param m The transformation matrix to create a normal matrix from.
 * @param asMat3 Whether or not the result should be trimmed down from a `Mat4` to a `Mat3`.
 * Defaults to `false`.
 */
export function normalMatrix(m: Mat4, asMat3: true): Mat3;

export function normalMatrix(m: Mat4, asMat3 = false): Mat4 | Mat3 {
    if (isMatrix(m) && m.type === 'mat4') {
        const n = inverse(transpose(m));

        if (asMat3) {
            return mat3(
                n[0][0], n[0][1], n[0][2],
                n[1][0], n[1][1], n[1][2],
                n[2][0], n[2][1], n[2][2],
            );
        } else {
            return n;
        }
    }

    const mType: string = (m as any)?.type ?? typeof m;
    throw new Error(
        "Invalid argument passed to 'normalMatrix':\n" +
        `Expected a 4D matrix, received ${mType}.`
    );
}

// -------------------------------------------------------------------------------------------------

// Backwards-compatible aliases

/**
 * Creates a translation matrix.
 *
 * @deprecated This function has been replaced with {@link translationMatrix}, which accepts more
 * versatile inputs.
 */
export function translate(x: number, y: number, z: number): Mat4 {
    return translationMatrix(x, y, z);
}

/**
 * Creates an axis-angle rotation matrix.
 *
 * @deprecated This function, as well as {@link rotateX}, {@link rotateY}, and {@link rotateZ}, have
 * all been replaced by {@link rotationMatrix}, which handles all rotation matrices.
 */
export function rotate(angle: number, axis: [number, number, number]): Mat4;

/**
 * Creates an axis-angle rotation matrix.
 *
 * @deprecated This function, as well as {@link rotateX}, {@link rotateY}, and {@link rotateZ}, have
 * all been replaced by {@link rotationMatrix}, which handles all rotation matrices.
 */
export function rotate(angle: number, axisX: number, axisY: number, axisZ: number): Mat4;

export function rotate(...args: (number | number[])[]): Mat4 {
    if (args.length === 2) {
        // We let this function do the error checking. Note that the old version takes angle first.
        return rotationMatrix(args[1] as Vec3, args[0] as number);
    } else if (args.length === 4) {
        const axis = vec3(args[1], args[2], args[3]);
        return rotationMatrix(axis, args[0] as number);
    } else {
        // @ts-ignore We just toss all their arguments into the main function and let it do
        // error-handling.
        return rotationMatrix(...args);
    }
}

/**
 * Constructs a rotation matrix that will rotate things around the X-axis.
 *
 * @deprecated This function has been replaced with {@link rotationMatrix}, which accepts more
 * versatile inputs.
 */
export function rotateX(theta: number): Mat4 {
    return rotationMatrix('x', theta);
}

/**
 * Constructs a rotation matrix that will rotate things around the Y-axis.
 *
 * @deprecated This function has been replaced with {@link rotationMatrix}, which accepts more
 * versatile inputs.
 */
export function rotateY(theta: number): Mat4 {
    return rotationMatrix('y', theta);
}

/**
 * Constructs a rotation matrix that will rotate things around the Z-axis.
 *
 * @deprecated This function has been replaced with {@link rotationMatrix}, which accepts more
 * versatile inputs.
 */
export function rotateZ(theta: number): Mat4 {
    return rotationMatrix('z', theta);
}

/**
 * Constructs a scale matrix.
 *
 * @deprecated This function has been replaced with {@link scaleMatrix}, which accepts more
 * versatile inputs.
 */
export function scale(x: number, y: number, z: number) {
    return scaleMatrix(x, y, z);
}

/**
 * @deprecated This function has been renamed to {@link lookAtMatrix} for consistency with the other
 * transformation matrix functions.
 */
export function lookAt(eye: Vec3, at: Vec3, up: Vec3): Mat4 {
    return lookAtMatrix(eye, at, up ?? null);
}

/**
 * @deprecated This function has been renamed to {@link orthographicMatrix} for consistency with the
 * other transformation matrix functions.
 */
export function ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
    return orthographicMatrix(left, right, bottom, top, near, far);
}

/**
 * @deprecated This function has been renamed to {@link perspectiveMatrix} for consistency with the
 * other transformation matrix functions.
 */
export function perspective(fovY: number, aspect: number, near: number, far: number) {
    return perspectiveMatrix(fovY, aspect, near, far);
}
