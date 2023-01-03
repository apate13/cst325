/*
 * A simple object to encapsulate the data and operations of object rasterization
 */
function WebGLGeometryQuad(gl) {
    this.gl = gl;
    this.worldMatrix = new Matrix4();

    // -----------------------------------------------------------------------------
    this.getPosition = function () {
        // todo #9 - return a vector4 of this object's world position contained in its matrix
        let e = this.worldMatrix.elements;

        return new Vector4(e[3], e[7], e[11], 0);
    }

    // -----------------------------------------------------------------------------
    this.create = function (rawImage, rawImage2) {
        var verts = [
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            -1.0, 1.0, 0.0,
            1.0, 1.0, 0.0
        ];

        var normals = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
        ];

        var uvs = [
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
        ];

        var indices = [0, 1, 2, 2, 1, 3];
        this.indexCount = indices.length;

        // create the position and color information for this object and send it to the GPU
        this.vertexBuffer = gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        this.texCoordsBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        if (rawImage) {
            // todo #4 - create the texture (uncomment when ready)
            // 1.
            this.texture = gl.createTexture();
            let uTexture = gl.getUniformLocation(textureShaderProgram, 'uTexture');

            const image = new Image();
            image.onload = () => {
                // 2. bind the texture
                this.gl.bindTexture(gl.TEXTURE_2D, this.texture);

                // needed for the way browsers load images, ignore this
                this.gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

                // 3. set wrap modes (for s and t) for the texture
                this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

                // 4. set filtering modes (magnification and minification)
                this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

                // 5. send the image WebGL to use as this texture
                this.gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                this.gl.uniform1i(uTexture, 0);

                // We're done for now, unbind
                this.gl.bindTexture(gl.TEXTURE_2D, null);
            };

            image.src = rawImage.src;
        }

        if (rawImage2) {
            // 1. create the texture
            this.texture2 = gl.createTexture();
            let uTexture2 = gl.getUniformLocation(textureShaderProgram, 'uTexture2');

            const image2 = new Image();
            image2.onload = () => {
                // 2. bind the texture
                this.gl.bindTexture(gl.TEXTURE_2D, this.texture2);

                // needed for the way browsers load images, ignore this
                this.gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

                // 3. set wrap modes (for s and t) for the texture
                this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

                // 4. set filtering modes (magnification and minification)
                this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

                // 5. send the image WebGL to use as this texture
                this.gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
                this.gl.uniform1i(uTexture2, 1);

                // We're done for now, unbind
                this.gl.bindTexture(gl.TEXTURE_2D, null);
            };

            image2.src = rawImage2.src;
        }
    }

    // -------------------------------------------------------------------------
    this.render = function (camera, projectionMatrix, shaderProgram) {
        this.gl.useProgram(shaderProgram);

        var attributes = shaderProgram.attributes;
        var uniforms = shaderProgram.uniforms;

        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(
            attributes.vertexPositionAttribute,
            3,
            gl.FLOAT,
            gl.FALSE,
            0,
            0
        );
        this.gl.enableVertexAttribArray(attributes.vertexPositionAttribute);

        if (attributes.hasOwnProperty('vertexNormalsAttribute')) {
            this.gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            this.gl.vertexAttribPointer(
                attributes.vertexNormalsAttribute,
                3,
                this.gl.FLOAT,
                this.gl.FALSE,
                0,
                0
            );
            this.gl.enableVertexAttribArray(attributes.vertexNormalsAttribute);
        }

        if (attributes.hasOwnProperty('vertexTexcoordsAttribute')) {
            this.gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
            this.gl.vertexAttribPointer(
                attributes.vertexTexcoordsAttribute,
                2,
                gl.FLOAT,
                gl.FALSE,
                0,
                0
            );
            this.gl.enableVertexAttribArray(attributes.vertexTexcoordsAttribute);
        }

        if (this.texture) {
            // todo #4
            // uncomment when ready
            this.gl.activeTexture(gl.TEXTURE0);
            this.gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }

        if (this.texture2) {
            this.gl.activeTexture(gl.TEXTURE1);
            this.gl.bindTexture(gl.TEXTURE_2D, this.texture2);
        }

        // Send our matrices to the shader
        this.gl.uniformMatrix4fv(uniforms.worldMatrixUniform, false, this.worldMatrix.clone().transpose().elements);
        this.gl.uniformMatrix4fv(uniforms.viewMatrixUniform, false, camera.getViewMatrix().clone().transpose().elements);
        this.gl.uniformMatrix4fv(uniforms.projectionMatrixUniform, false, projectionMatrix.clone().transpose().elements);
        this.gl.uniform1f(uniforms.timeUniform, time.secondsElapsedSinceStart);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.disableVertexAttribArray(attributes.vertexPositionAttribute);
        this.gl.disableVertexAttribArray(attributes.vertexNormalsAttribute);

        if (attributes.hasOwnProperty('vertexTexcoordsAttribute')) {
            this.gl.disableVertexAttribArray(attributes.vertexTexcoordsAttribute);
        }
    }
}