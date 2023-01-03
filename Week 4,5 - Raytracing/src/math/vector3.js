/*
 * An "object" representing a 3d vector to make operations simple and concise.
 *
 * Similar to how we work with plain numbers, we will work with vectors as
 * an entity unto itself.  Note the syntax below: var Vector3 = function...
 * This is different than you might be used to in most programming languages.
 * Here, the function is meant to be instantiated rather than called and the
 * instantiation process IS similar to other object oriented languages => new Vector3()
 */

var Vector3 = function(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;

    // Sanity check to prevent accidentally using this as a normal function call
    if (!(this instanceof Vector3)) {
        console.error("Vector3 constructor must be called with the 'new' operator");
    }
}

Vector3.prototype = {

    //-----------------------------------------------------------------------------
    set: function(x, y, z) {
        this.x = x; this.y = y; this.z = z;
        return this;
    },

    //-----------------------------------------------------------------------------
    clone: function() {
        return new Vector3(this.x, this.y, this.z);
    },

    //-----------------------------------------------------------------------------
    copy: function(other) {
        this.x = other.x; this.y = other.y; this.z = other.z;
        return this;
    },

    //-----------------------------------------------------------------------------
    negate: function() {
        return this.multiplyScalar(-1);
    },

    //-----------------------------------------------------------------------------
    add: function(v) {
        this.x += v.x; this.y += v.y; this.z += v.z;
        return this;
    },

    //-----------------------------------------------------------------------------
    subtract: function(v) {
        this.x -= v.x; this.y -= v.y; this.z -= v.z;
        return this;
    },

    //-----------------------------------------------------------------------------
    multiplyScalar: function(scalar) {
        this.x *= scalar; this.y *= scalar; this.z *= scalar;
        return this;
    },

    //-----------------------------------------------------------------------------
    length: function() {
        return Math.sqrt(this.lengthSqr());
    },

    //-----------------------------------------------------------------------------
    lengthSqr: function() {
        return this.dot(this);
    },

    //-----------------------------------------------------------------------------
    normalize: function() {
        return this.multiplyScalar(1 / this.length());
    },

    //-----------------------------------------------------------------------------
    dot: function(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    },


    //=============================================================================
    // The functions below must be completed in order to receive an "A"

    //-----------------------------------------------------------------------------
    fromTo: function(fromPoint, toPoint) {
        if (!(fromPoint instanceof Vector3) || !(toPoint instanceof Vector3)) {
            console.error("fromTo requires to vectors: 'from' and 'to'");
        }

        return new Vector3(toPoint.x - fromPoint.x, toPoint.y - fromPoint.y, toPoint.z - fromPoint.z);
    },

    //-----------------------------------------------------------------------------
    project: function(vectorToProject, otherVector) {
        if (!(vectorToProject instanceof Vector3) || !(otherVector instanceof Vector3)) {
            console.error("project requires to vectors: 'to project' and 'direction'");
        }

        v = vectorToProject.clone();
        dir = otherVector.clone();

        return dir.multiplyScalar(v.dot(dir) / dir.lengthSqr());
    }
};

// EOF 00100001-1