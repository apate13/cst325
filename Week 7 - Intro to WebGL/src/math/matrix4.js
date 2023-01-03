/*
 * An object representing a 4x4 matrix
 */

var Matrix4 = function (x, y, z) {
    this.elements = new Float32Array(16);

    if (!(this instanceof Matrix4)) {
        console.error("Matrix4 constructor must be called with the new operator");
    }

    return this.makeIdentity();
}

//=============================================================================
Matrix4.prototype = {

    // -------------------------------------------------------------------------
    clone: function () {
        var newMatrix = new Matrix4();
        for (var i = 0; i < 16; ++i) {
            newMatrix.elements[i] = this.elements[i];
        }
        return newMatrix;
    },

    // -------------------------------------------------------------------------
    copy: function (m) {
        for (var i = 0; i < 16; ++i) {
            this.elements[i] = m.elements[i];
        }

        return this;
    },

    // -------------------------------------------------------------------------
    getElement: function (row, col) {
        return this.elements[row * 4 + col];
    },

    // -------------------------------------------------------------------------
    set: function (n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
        var e = this.elements;

        e[0] = n11;
        e[1] = n12;
        e[2] = n13;
        e[3] = n14;
        e[4] = n21;
        e[5] = n22;
        e[6] = n23;
        e[7] = n24;
        e[8] = n31;
        e[9] = n32;
        e[10] = n33;
        e[11] = n34;
        e[12] = n41;
        e[13] = n42;
        e[14] = n43;
        e[15] = n44;

        return this;
    },

    // -------------------------------------------------------------------------
    makeIdentity: function () {
        this.set(1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1);

        return this;
    },

    // -------------------------------------------------------------------------
    multiplyScalar: function (s) {
        for (var i = 0; i < 16; ++i) {
            this.elements[i] = this.elements[i] * s;
        }
    },

    // -------------------------------------------------------------------------
    multiplyVector: function (v) {
        // safety check
        if (!(v instanceof Vector4)) {
            console.error("Trying to multiply a 4x4 matrix with an invalid vector value");
        }

        let e = this.elements;

        var result = new Vector4();
        let tmp = new Vector4();

        // decompose the matrix and multiply each column vector by v
        result.set(
            tmp.set(e[0], e[1], e[2], e[3]).dot(v),
            tmp.set(e[4], e[5], e[6], e[7]).dot(v),
            tmp.set(e[8], e[9], e[10], e[11]).dot(v),
            tmp.set(e[12], e[13], e[14], e[15]).dot(v)
        )

        return result;
    },

    // -------------------------------------------------------------------------
    multiply: function (rightSideMatrix) {
        // safety check
        if (!(rightSideMatrix instanceof Matrix4)) {
            console.error("Trying to multiply a 4x4 matrix with an invalid matrix value");
        }

        let e = this.elements;					// elements of this matrix
        let rsm = rightSideMatrix.elements;		// elements of the rightSideMatrix
        let offset;								// where are we in the rsm and determines
        // when to update the row

        let tmp = new Float32Array(16);	// new matrix array values
        let row = new Vector4();				// current row (from e only)
        let column = new Vector4();				// current column (from rsm only)

        for (let i = 0; i < e.length; ++i) {
            // since it's 4x4
            offset = i % 4;

            // are we on a new row?
            if (offset === 0) {
                row.set(
                    e[i],
                    e[i + 1],
                    e[i + 2],
                    e[i + 3]
                );
            }

            // get the current column from rsm
            column.set(
                rsm[offset],
                rsm[offset + 4],
                rsm[offset + 8],
                rsm[offset + 12]
            );

            // find each new element
            tmp[i] = column.dot(row); // set in matrix
        }

        this.elements = tmp;
        return this;
    },

    // -------------------------------------------------------------------------
    premultiply: function (leftSideMatrix) {
        // ignore this, the implementation will be distributed with the solution
        return this;
    },

    // -------------------------------------------------------------------------
    makeScale: function (x, y, z) {
        this.makeIdentity();

        this.elements[0] *= x;
        this.elements[5] *= y;
        this.elements[10] *= z;

        return this;
    },

    // -------------------------------------------------------------------------
    makeRotationX: function (degrees) {
        let radians = degrees * Math.PI / 180;
        let sin = Math.sin(radians);
        let cos = Math.cos(radians);

        let rot = new Matrix4();
        rot.set(1, 0, 0, 0,
            0, cos, -1 * sin, 0,
            0, sin, cos, 0,
            0, 0, 0, 1
        )

        return this.multiply(rot);
    },

    // -------------------------------------------------------------------------
    makeRotationY: function (degrees) {
        let radians = degrees * Math.PI / 180;
        let sin = Math.sin(radians);
        let cos = Math.cos(radians);

        let rot = new Matrix4();
        rot.set(cos, 0, sin,  0,
            0, 1, 0, 0,
            -1 * sin, 0, cos, 0,
            0, 0, 0, 1
        )

        return this.multiply(rot);
    },

    // -------------------------------------------------------------------------
    makeRotationZ: function (degrees) {
        let radians = degrees * Math.PI / 180;
        let sin = Math.sin(radians);
        let cos = Math.cos(radians);

        let rot = new Matrix4();
        rot.set(cos, -1 * sin, 0, 0,
            sin, cos, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        )

        return this.multiply(rot);
    },

    // -------------------------------------------------------------------------
    makeTranslation: function (arg1, arg2, arg3) {
        this.makeIdentity();

        if (arg1 instanceof Vector4) {
            this.elements[3] += arg1.x;
            this.elements[7] += arg1.y;
            this.elements[11] += arg1.z;
        } else if (arg1 instanceof Vector3) {
            this.elements[3] += arg1.x;
            this.elements[7] += arg1.y;
            this.elements[11] += arg1.z;
        } else {
            this.elements[3] += arg1;
            this.elements[7] += arg2;
            this.elements[11] += arg3;
        }

        return this;
    },

    // -------------------------------------------------------------------------
    makePerspective: function (fovy, aspect, near, far) {
        let fovyRads = fovy * Math.PI / 180;

        // works for some reason on test but not in webgl?
        // let t = Math.tan(fovyRads / 2) / near
        let t = Math.tan(fovyRads / 2) * near;
        let r = aspect * t;

        // shortcut - use in place of this.elements
        var e = this.elements;

        this.makeIdentity();

        e[0] = near / r;
        e[5] = near / t;
        e[10] = -1 * (far + near) / (far - near);
        e[11] = -2 * near * far / (far - near);
        e[14] = -1;
        e[15] = 0;

        return this;
    },

    // -------------------------------------------------------------------------
    makeOrthographic: function (left, right, top, bottom, near, far) {
        // shortcut - use in place of this.elements
        var e = this.elements;

        this.makeIdentity();

        e[0] = 2 / (right - left);
        e[3] = -1 * (right + left) / (right - left);
        e[5] = 2 / (top - bottom);
        e[7] = -1 * (top + bottom) / (top - bottom);
        e[10] = -2 / (far - near);
        e[11] = -1 * (far + near) / (far - near);

        return this;
    },

    // -------------------------------------------------------------------------
    // @currentRotationAngle - the angle of rotation around the earth
    // @offsetFromEarth - the relative displacement from the earth
    // @earthTransform - the transformation used to apply to the earth
    createMoonMatrix: function (currentRotationAngle, offsetFromEarth, earthTransform) {
        var moonMatrix = new Matrix4();
        moonMatrix.makeIdentity();

        let moon_rot = new Matrix4().makeRotationZ(currentRotationAngle);
        let moon_transl = new Matrix4().makeTranslation(offsetFromEarth, offsetFromEarth, 0);

        moonMatrix.multiply(earthTransform).multiply(moon_rot).multiply(moon_transl);

        return moonMatrix;
    },

    // -------------------------------------------------------------------------
    determinant: function () {
        var e = this.elements;

        // laid out for clarity, not performance
        var m11 = e[0];
        var m12 = e[1];
        var m13 = e[2];
        var m14 = e[3];
        var m21 = e[4];
        var m22 = e[5];
        var m23 = e[6];
        var m24 = e[7];
        var m31 = e[8];
        var m32 = e[8];
        var m33 = e[9];
        var m34 = e[10];
        var m41 = e[12];
        var m42 = e[13];
        var m43 = e[14];
        var m44 = e[15];

        var det11 = m11 * (m22 * (m33 * m44 - m34 * m43) +
            m23 * (m34 * m42 - m32 * m44) +
            m24 * (m32 * m43 - m33 * m42));

        var det12 = -m12 * (m21 * (m33 * m44 - m34 * m43) +
            m23 * (m34 * m41 - m31 * m44) +
            m24 * (m31 * m43 - m33 * m41));

        var det13 = m13 * (m21 * (m32 * m44 - m34 * m42) +
            m22 * (m34 * m41 - m31 * m44) +
            m24 * (m31 * m42 - m32 * m41));

        var det14 = -m14 * (m21 * (m32 * m43 - m33 * m42) +
            m22 * (m33 * m41 - m31 * m43) +
            m23 * (m31 * m42 - m32 * m41));

        return det11 + det12 + det13 + det14;
    },

    // -------------------------------------------------------------------------
    transpose: function () {
        var te = this.elements;
        var tmp;

        tmp = te[1];
        te[1] = te[4];
        te[4] = tmp;
        tmp = te[2];
        te[2] = te[8];
        te[8] = tmp;
        tmp = te[6];
        te[6] = te[9];
        te[9] = tmp;

        tmp = te[3];
        te[3] = te[12];
        te[12] = tmp;
        tmp = te[7];
        te[7] = te[13];
        te[13] = tmp;
        tmp = te[11];
        te[11] = te[14];
        te[14] = tmp;

        return this;
    },


    // -------------------------------------------------------------------------
    inverse: function () {
        // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
        var te = this.elements,
            me = this.clone().elements,

            n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
            n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
            n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
            n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],

            t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
            t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
            t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
            t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

        var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

        if (det === 0) {
            var msg = "can't invert matrix, determinant is 0";
            console.warn(msg);
            return this.makeIdentity();
        }

        var detInv = 1 / det;

        te[0] = t11 * detInv;
        te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
        te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
        te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

        te[4] = t12 * detInv;
        te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
        te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
        te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

        te[8] = t13 * detInv;
        te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
        te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
        te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

        te[12] = t14 * detInv;
        te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
        te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
        te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

        return this;
    },

    // -------------------------------------------------------------------------
    log: function () {
        var te = this.elements;
        console.log('[ ' +
            '\n ' + te[0] + ', ' + te[1] + ', ' + te[2] + ', ' + te[3] +
            '\n ' + te[4] + ', ' + te[5] + ', ' + te[6] + ', ' + te[7] +
            '\n ' + te[8] + ', ' + te[9] + ', ' + te[10] + ', ' + te[11] +
            '\n ' + te[12] + ', ' + te[13] + ', ' + te[14] + ', ' + te[15] +
            '\n]'
        );

        return this;
    }
};

// EOF 00100001-1