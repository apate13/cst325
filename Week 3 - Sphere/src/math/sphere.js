/*
 * An object type representing an implicit sphere.
 *
 * @param center A Vector3 object representing the position of the center of the sphere
 * @param radius A Number representing the radius of the sphere.
 */

var Sphere = function(center, radius) {
  // Sanity checks (your modification should be below this where indicated)
  if (!(this instanceof Sphere)) {
    console.error("Sphere constructor must be called with the new operator");
  }

  this.center = center;
  this.radius = radius;


  // todo - make sure this.center and this.radius are replaced with default values if and only if they
  // are invalid or undefined (i.e. center should be of type Vector3 & radius should be a Number)
  // - the default center should be the zero vector
  // - the default radius should be 1
  if(this.radius === undefined || this.radius <=0 || this.radius === null || this.radius == '')
    this.radius =1;
  

  if (this.center === undefined || this.center === null || this.radius == '')
    this.center = new Vector3(0, 0, 0);


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
    let direction = r1.direction.clone();

    let pt = r1.origin.clone().subtract(this.center);

    let dirA = direction.clone().add(direction).dot(pt);
    let pntA = pt.lengthSqr() - (this.radius * this.radius);

    let disc = (dirA * dirA) - (4 * pntA);
    let result = {
      hit: false,
    };

    if (disc >= 0)  {
      let x = 0 - dirA;
      // y = 2a;

      if (disc > 0) {
        disc = Math.sqrt(disc);

        let x_1 = x + disc;

        let x_2 = x - disc;

        if (x_1 < 0 && x_2 < 0) {
            return result;

        } else if (x_1 > 0 && x_2 < 0 || x_1 < 0 && x_2 > 0 || x_1 > 0 && x_2 < 0) {
            return result;
        } else {
            x = x_2;
        }
      }

      let dist = x / 2;

      if (disc === 0 && dist < 0) {
        disc = -1;
        return result;
      }

      let point = direction.multiplyScalar(dist).add(r1.origin);

      let normal = point.clone().subtract(this.center).normalize();

      result = {
        hit: true,
        point: point,
        normal: normal,
        distance: dist,
        alpha: disc
      };
    }
    return result;
  }
}
