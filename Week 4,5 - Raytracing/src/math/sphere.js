/*
 * An object type representing an implicit sphere.
 *
 * @param center A Vector3 object representing the position of the center of the sphere
 * @param radius A Number representing the radius of the sphere.
 */

var Sphere = function(center, radius, color) {
    // Sanity checks (your modification should be below this where indicated)
    if (!(this instanceof Sphere)) {
        console.error("Sphere constructor must be called with the new operator");
    }

    this.center = center;
    this.radius = radius;
    this.color = color;

    if (this.center === undefined || this.center === null) {
        this.center = new Vector3(0, 0, 0);
    }

    if (this.radius === undefined || this.radius === null || this.radius <= 0) {
        this.radius = 1;
    }

    if (this.color === undefined) {
        this.color = new Vector3(1, 1, 1);
    }

    if (!(this.color instanceof Vector3)) {
        console.error("The color must be a Vector3");
    }

    // Sanity checks (your modification should be above this)
    if (!(this.center instanceof Vector3)) {
        console.error("The sphere center must be a Vector3");
    }

    if ((typeof(this.radius) != 'number')) {
        console.error("The radius must be a Number");
    }
};

Sphere.prototype = {

    //-----------------------------------------------------------------------------
    raycast: function(r1) {
        let d = r1.direction.clone();
        // point "on" the circle
        let pt = r1.origin.clone().subtract(this.center);

        // a = d.dot(d) -> always = 1
        let b = d.clone().add(d).dot(pt);
        let c = pt.lengthSqr() - (this.radius * this.radius);

        // b^2 - 4ac
        let disc = (b * b) - (4 * c);
        let result = {
            hit: false,
        };

        // the ray intersects our sphere at at least 1 point
        if (disc >= 0)  {
            let numer = 0 - b;
            // denom = 2a;

            // 2 intersections
            if (disc > 0) {
                disc = Math.sqrt(disc);
                let numer_1 = numer + disc;
                let numer_2 = numer - disc;

                // the sphere is behind us
                if (numer_1 < 0 && numer_2 < 0) {
                    return result;

                    // we are inside of the sphere
                } else if (numer_1 > 0 && numer_2 < 0 || numer_1 < 0 && numer_2 > 0) {
                    return result;

                    // the sphere is in front of us
                } else {
                    numer = numer_2;
                }
            }

            let dist = numer / 2;

            // 1 intersection behind us
            if (disc === 0 && dist < 0) {
                return result;
            }

            // p = o + dist * d
            let point = d.multiplyScalar(dist).add(r1.origin);
            // vector c -> p
            let normal = point.clone().subtract(this.center).normalize();

            result = {
                hit: true,
                point: point,
                normal: normal,
                distance: dist,
            };
        }

        return result;
    }
}

// EOF 00100001-1