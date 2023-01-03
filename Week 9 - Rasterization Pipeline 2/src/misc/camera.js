function Camera(input) {
    // The following two parameters will be used to automatically create the cameraWorldMatrix in this.update()
    this.cameraYaw = 0;
    this.cameraPosition = new Vector3();

    this.cameraWorldMatrix = new Matrix4();

    // -------------------------------------------------------------------------
    this.getViewMatrix = function() {
        return this.cameraWorldMatrix.clone().inverse();
    }

    // -------------------------------------------------------------------------
    this.getForward = function() {
        //////#6 - pull out the forward direction from the world matrix and return as a vector
        //         - recall that the camera looks in the "backwards" direction
        let r = this.cameraWorldMatrix.elements;

        return new Vector3(r[2], r[7], r[10]).multiplyScalar(-1);
        return new Vector3();
    }
    // -------------------------------------------------------------------------
    this.update = function(dt) {
        var currentForward = this.getForward();

        if (input.up) {
            ///////#7 - move the camera position a little bit in its forward direction
            currentForward.multiplyScalar(0.02);
            this.cameraPosition.copy(currentForward);
        }

        if (input.down) {
            ///////#7 - move the camera position a little bit in its backward direction
            currentForward.multiplyScalar(-0.02);
            this.cameraPosition.copy(currentForward);
        }

        if (!input.down && !input.up) {
            this.cameraPosition.set(0, 0, 0);
        }

        if (input.left) {
            ///////#8 - add a little bit to the current camera yaw
            this.cameraYaw += 0.001;
        }

        if (input.right) {
            ///////#8 - subtract a little bit from the current camera yaw
            this.cameraYaw -= 0.001;
        }

        if (!input.left && !input.right) {
            this.cameraYaw = 0;
        }

        //////#7 - create the cameraWorldMatrix from scratch based on this.cameraPosition
        this.cameraWorldMatrix.multiply(new Matrix4().makeTranslation(this.cameraPosition));

        //////#8 - create a rotation matrix based on cameraYaw and apply it to the cameraWorldMatrix
        // (order matters!)
        this.cameraWorldMatrix.multiply(new Matrix4().makeRotationY(this.cameraYaw));
    }
}