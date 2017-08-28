/*
  function PV (isPoint) {		new PV(true)
  function PV (x, y, z, isPoint)	new PV(1, 2, 7, false)
  function PV (x, y, z, w)		new PV(0, 1, 6, 1)
*/
function PV (x, y, z, w) {
    var v = [0, 0, 0, 0];

    if (typeof x === "boolean") {
        // function PV (isPoint)
	if (x)
	    v[3] = 1;
    }
    else if (typeof x === "number" &&
             typeof y === "number" &&
             typeof z === "number") {
	v[0] = x;
	v[1] = y;
	v[2] = z;
	if (typeof w === "number")
            v[3] = w;
        else if (typeof w === "boolean") {
            if (w) 
	        v[3] = 1;
        }
        else
            throw "Illegal Argument";
    }
    else
        throw "Illegal Argument";
    
    v.__proto__ = PV.prototype;

    return v;  
}

PV.prototype = Object.create(Array.prototype);

PV.prototype.constructor = PV;

PV.prototype.toString = function () {
    return "[ " + this[0] + " " + this[1] + " " + this[2] + " " + this[3] + " ]";

}

PV.prototype.isVector = function () {
    return this[3] == 0;
}

PV.prototype.isPoint = function () {
    return this[3] != 0;
}

PV.prototype.flatten = function () {
    var floats = new Float32Array( 4 );
    for (var i = 0; i < 4; i++)
        floats[i] = this[i];
    return floats;
}

function flatten (v) {
    if (!(v[0] instanceof PV))
        throw "Illegal Argument 3";

    var floats = new Float32Array(4 * v.length);

    var n = 0;
    for (var i = 0; i < v.length; i++)
        for (var j = 0; j < 4; j++) {
            floats[n++] = v[i][j];
            // console.log("i " + i + " j " + j + " v[i][j] " + v[i][j]);
        }
    
    return floats;
}        

function Mat(c1, c2, c3, c4) {
    var cols = [ c1, c2, c3, c4 ];
    
    var mat = [new PV(1, 0, 0, 0),
               new PV(0, 1, 0, 0),
               new PV(0, 0, 1, 0),
               new PV(0, 0, 0, 1)];
    
    for (var j = 0; j < 4; j++) {
        if (cols[j] === undefined)
            break;
        if (!(cols[j] instanceof PV))
            throw "Illegal Argument";
        
        for (var i = 0; i < 4; i++)
            mat[i][j] = cols[j][i];
    }
    
    mat.__proto__ = Mat.prototype;

    return mat;
}

Mat.prototype = Object.create(Array.prototype);
Mat.prototype.constructor = Mat;

Mat.prototype.toString = function () {
    return this[0].toString() + "\n" + 
        this[1].toString() + "\n" + 
        this[2].toString() + "\n" + 
        this[3].toString() + "\n";
}

Mat.prototype.flatten = function () {
    var floats = new Float32Array( 16 );
    var n = 0;
    for (var j = 0; j < 4; j++)
        for (var i = 0; i < 4; i++)
            floats[n++] = this[i][j];
    return floats;
}

PV.prototype.plus = function (that) {
    if (that instanceof PV) {
        return new PV(this[0] + that[0],
                      this[1] + that[1],
                      this[2] + that[2],
                      this[3] + that[3]);
    }
    else {
        console.log("illegal argument");
        throw "Illegal Argument";
    }
}

// (2, -1, 3, 1) times -2 equals (-4, 2, -6, -2)
// (2, -1, 3, 1) times (3, 2, 5, 0) equals (6, -2, 15, 0)
PV.prototype.times = function (that) {
    if (typeof that === "number") {
        return new PV(this[0] * that,
                      this[1] * that,
                      this[2] * that,
                      this[3] * that);
    }
    if (that instanceof PV) {
        return new PV(this[0] * that[0],
                      this[1] * that[1],
                      this[2] * that[2],
                      this[3] * that[3]);
    }
    else {
        console.log("illegal argument");
        throw "Illegal Argument";
    }
}

// u.minus() = -u
// u.minus(v) = u - v
PV.prototype.minus = function (that) {
    if (that === undefined) {
        return new PV(this[0] * -1,
		      this[1] * -1,
		      this[2] * -1,
		      this[3] * -1);
		   
    }
    else if (that instanceof PV) {
        return new PV(this[0] - that[0],
		      this[1] - that[1],
		      this[2] - that[2],
		      this[3] - that[3]);
		      
    }
    else {
        console.log("illegal argument");
        throw "Illegal Argument";
    }
}

// Do a 4-dimensional dot product:
// (1, 2, 3, 4) dot (-2, -3, 1, 1) = 1 * -2 + 2 * -3 + 3 * 1 + 4 * 1
PV.prototype.dot = function (that) {
    if (!(that instanceof PV)) {
	console.log("illegal argument");
        throw "Illegal Argument";
    }
    else {
	return ( this[0] * that[0] +
		 this[1] * that[1] +
		 this[2] * that[2] +
		 this[3] * that[3] );
    }
  
    // EXERCISE
}

// Assume inputs are vectors.  Output is a vector.
PV.prototype.cross = function (that) {
    if (!(that instanceof PV))
        throw "Illegal Argument";
    else {
	return new PV ( (this[1] * that[2]) - (this[2] * that[1]),
			(this[2] * that[0]) - (this[0] * that[2]),
			(this[0] * that[1]) - (this[1] * that[0]),
			 this[3] );
    }
    // EXERCISE
}

PV.prototype.magnitude = function () {
    // I'm doing the dot product of itself and then sqrt the length
    var length = 0;
    length = this.dot(this);
    return Math.sqrt(length) ;
};

PV.prototype.distance = function (that) {
    if (!(that instanceof PV))
        throw "Illegal Argument";
    else {
	that = this.minus(that);
	return that.magnitude();
    }

    // EXERCISE
    // Use minus and magnitude.
};

// Return unit vector pointing same direction as this.
PV.prototype.unit = function () {
    var magnitude = 0;
    magnitude = this.magnitude();
    return new PV ( this[0] / magnitude,
		    this[1] / magnitude,
		    this[2] / magnitude,
		    this[3] ) ;
};

// Replace this with unit vector pointing same direction as this.
PV.prototype.unitize = function () {
    /* I'm aware that it's kind of sloppy/redundant to code it this way
    / and by not calling this.unit but for some reason if I tried calling this.unit() nothing would happen.
    / For example return this.unit() returns simply this.
    / But I know the unit function isn't wrong since you can see the test
    / results for the above that, I believe, are correct. */
    
    var magnitude = 0;
    magnitude = this.magnitude();
    this[0] = this[0] / magnitude;
    this[1] = this[1] / magnitude;
    this[2] = this[2] / magnitude;
    this[3] = this[3] / magnitude;
    return this;
    
    
};

// Return homogeneous point by dividing all coordinates by this[3].
// Does not change this.
PV.prototype.homogeneous = function () {
    // EXERCISE
    var division = this[3];
    if ( division <= 0 )
	throw "illegal this[3] coordinate, cant divide by 0";
    return new PV (   this[0] / division,
		      this[1] / division,
		      this[2] / division,
		      this[3] / division );
};

// Divide all coordinates by this[3].  Changes this.
PV.prototype.homogenize = function () {
    // EXERCISE
    var division = this[3]
    if ( division <= 0 )
	throw "illegal this[3] coordinate, cant divide by 0";
    this[0] = this[0] / division;
    this[1] = this[1] / division;
    this[2] = this[2] / division;
    this[3] = this[3] / division;
    return this;
    
};


// Return rotation matrix for rotation by angle about axis i.
// 0: x, 1: y, 2: z
Mat.rotation = function (i, angle) {
    if (i === undefined || angle === undefined ||
        !(typeof i === "number") || !(typeof angle === "number"))
	throw "Illegal Argument";

    var mat = new Mat();
    var k = 0 ;
    var j = 0 ;
    // EXERCISE
    // Uses Math.sin() and Math.cos()
    // Set j=0 and k=1 and do the i=2 (z-axis) case.
    if ( i === 2) {
	j = 0;
	k = 1;
    }
    if (i === 0) {
        j = 1;
	k = 2;
    }
    if (i === 1 ){
	j = 2;
        k = 0;
    }
        mat[j][j] = Math.cos(angle);
	mat[j][k] = Math.sin(angle) * -1 ;
	mat[k][j] = Math.sin(angle);
	mat[k][k] = Math.cos(angle);
	
	return mat;
	};

Mat.translation = function (v) {
    if (!(v instanceof PV))
	throw "Illegal Argument";

    var mat = new Mat(); // turning the identity matrix into the identity plus v1,v2,v3,1 on the last column

    var k = 3;
    
    for ( var i = 0; i <= 2; i++ ) {
	mat[i][k] = v[i];
    }

    return mat;
};

Mat.scale = function (s) {
    var mat = new Mat();

    if (typeof s === "number") {
        for ( var i = 0 ; i <= 3 ; i ++) {
	   for (var j = 0 ; j <=3 ; j++) {
               mat[i][j] = mat[j][i] * s;
	}
    }    }
    else if (s instanceof PV) {
        var v = new PV(true);

	v[0] = mat[0][0] * s[0] + mat[0][1] * s[1] + mat[0][2] * s[2] + mat[0][3] * s[3];
	v[1] = mat[1][0] * s[0] + mat[1][1] * s[1] + mat[1][2] * s[2] + mat[1][3] * s[3];
	v[2] = mat[2][0] * s[0] + mat[2][1] * s[1] + mat[2][2] * s[2] + mat[2][3] * s[3];
	v[3] = mat[3][0] * s[0] + mat[3][1] * s[1] + mat[3][2] * s[2] + mat[3][3] * s[3];
	
    }
    else
	throw "Illegal Argument";

    return mat;

};

Mat.prototype.transpose = function() {
    var mat = new Mat();
    for ( var i = 0 ; i <= 3 ; i ++) {
	for (var j = 0 ; j <=3 ; j++) {
	       var temp = mat[i][j];
               mat[i][j] = mat[j][i];
               mat[j][i] = temp;
	}
    }
    return mat;
};    

//Matrix multiplication.
//If that is a PV, it is treated as a 4 by 1 column vector.


Mat.prototype.times = function (that) {
    if (that instanceof PV) {
        var v = new PV(false);

	v[0] = this[0][0] * that[0] + this [0][1] * that [1] + this [0][2] * that [2] + this [0][3] * that[3];
	v[1] = this[1][0] * that[0] + this [1][1] * that [1] + this [1][2] * that [2] + this [1][3] * that[3];
	v[2] = this[2][0] * that[0] + this [2][1] * that [1] + this [2][2] * that [2] + this [2][3] * that[3];
	v[3] = 0;
        // EXERCISE

        return v;
    }

    else if (that instanceof Mat) {
	// I'm assuming its a 4x4 times a 4x4 matrix
        var mat = new Mat();
        var mat2 = new Mat();

	mat2 = that.transpose();
	var k = 0;
	var j = 0;
	for ( k = 0; k <=3 ; k++ ) {
	    for( j = 0; j <=3 ; j++) {
		mat[k][j] = this[k].dot(mat2[k]);
	    }
	}

	
/*	Cleaner method above
        var k = 0;
        var j = 0;
	var m = 0;

	for ( k = 0; k <=3 ; k++ ) {
	    for( j = 0; j <=3 ; j++) {
		mat[k][j] = this[k][0] * that[0][m] + this[k][1] * that[1][m] + this[k][2] * that[2][m] + this[k][3] * that[3][m];
		m++; // I use m to move through the colummns of that. 
		if (m ===3)
		    m = 0; //restart the column tracker for a new row of the new matrix
	    }
	}
  */       
    }
  	
        return mat;
}


