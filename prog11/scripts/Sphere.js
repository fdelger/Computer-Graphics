function Sphere (gl, nLon, nLat, p, v, a, w, m, physics) {
    this.verts = [];
    this.vnormals = [];
    this.faces = [];
    this.fnormals = [];

    var vbuffers = [];
    var nbuffers = [];

    this.p = p || new PV(true);
    this.v = v || new PV(false);
    this.a = a || new PV(false);
    this.w = w || new PV(false);
    this.m = m || 1;
    this.I = (2.0 / 5.0)*this.m; //moment of inertia for sphere r = 1

    this.object2rotated = new Mat();
    this.rotated2world = Mat.translation(p);

    this.phy = physics || false;

    this.g = 6.67408;

    var rotStep = Mat.rotation(0, 2 * Math.PI / nLon);
    var o = new PV(true);
    for ( var i = 0; i < nLat; i++) {
	var lat = Math.PI / (2 * nLat) * (1 + 2 * i);
	var p = new PV(Math.cos(lat), Math.sin(lat), 0, true);
	for ( var j = 0; j < nLon; j++) {
            var n = p.minus(o).unit();
	    this.verts.push(p);
            this.vnormals.push(n);
	    p = rotStep.times(p);
	}
    }

    var cap = [];
    for ( var i = 0; i < nLon; i++)
	cap[i] = i;

    this.faces.push(cap);

    for ( var i = 1; i < nLat; i++)
	for ( var j = 0; j < nLon; j++) {
	    var vInds = [];
	    vInds.push(nLon * i + j);
	    vInds.push(nLon * i + (j + 1) % nLon);
	    vInds.push(nLon * (i - 1) + (j + 1) % nLon);
	    vInds.push(nLon * (i - 1) + j);
	    this.faces.push(vInds);
	}

    cap = [];
    for ( var i = 0; i < nLon; i++)
	cap.push(nLon * (nLat - 1) + nLon - i - 1);

    this.faces.push(cap);

    for (var i = 0; i < this.faces.length; i++) {
        var fverts = [];
        for (var j = 0; j < this.faces[i].length; j++)
            fverts.push(this.verts[this.faces[i][j]]);

        var vbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(fverts), gl.STATIC_DRAW);
        vbuffers.push(vbuffer);
        
        var fnormals = [];
        for (var j = 0; j < this.faces[i].length; j++)
            fnormals.push(this.vnormals[this.faces[i][j]]);

        var nbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(fnormals), gl.STATIC_DRAW);
        nbuffers.push(nbuffer);

        var n = new PV(false);

        // Sum up the cross products of triangles in the face.
        // n = n.plus(...cross(....))
        var a = fverts[0];
        for (var j = 2; j < fverts.length; j++) {
            var b = fverts[j-1];
            var c = fverts[j];
            n = n.plus(b.minus(a).cross(c.minus(a)));
        }

        n.unitize();
        this.fnormals.push(n);
    }

    this.acceleration = function(that) {
        var vec = that.p.minus(this.p);
        var l = vec.magnitude();
        return vec.unit().times(this.g*that.m/(l*l));
    }

    this.update = function(dt) {

        dt /= 1000;


        // EXERCISE 6
        // Update this.v and this.p using this.a and dt.
        this.v = this.v.plus(this.a.times(dt));
        this.p = this.p.plus(this.v.times(dt));
        
        this.rotated2world = Mat.translation(this.p);

        if(this.w.magnitude() > 0) {
            // EXERCISE 7
            // Rotate around this.w by angle |this.w|*dt
            var uz = this.w.unit();
            var ux = uz.cross(new PV(0,1,0,true)).unit();
            var uy = uz.cross(ux);

            var vz = uz;
            var vx = ux.plus(uy.times(this.w.magnitude() * dt)).unit();
            var vy = vz.cross(vx);

            var U = new Mat(ux, uy, uz);
            var V = new Mat(vx, vy, vz);


            var R = V.times(U.transpose()); // takes ux,uy,uz to vx,vy,vz
            this.object2rotated = R.times(this.object2rotated);
        }


    }

    this.collides = function(that) {
        return this.p.minus(that.p).magnitude() <= 2;
    }

    this.fixCollision = function(that) {
        if(!this.collides(that)) return;
        

        //move the spheres away from the collision

        // EXERCISE 8
        // Update this.p and that.p to move the sphere 2.001 apart.
        
        var d = this.p.minus(that.p).magnitude(); 
        var dsecond = that.p.minus(this.p).magnitude();

        var d1 = (2.001 - d)/2; 
        var d2 = (2.001 - dsecond)/2;  

        var directionp1 = this.p.minus(that.p).unit();     
        var directionp2 = that.p.minus(this.p).unit(); 

        this.p = this.p.plus(directionp1.times(d1));
        that.p = that.p.plus(directionp2.times(d2));



        //point of collision
        var collision = this.p.plus(that.p).times(0.5);


        var smooth = true;
        if (smooth) {
            // EXERCISE 9
            // Update this.v and that.v based on bounce impulse
            // perpendicular to surface
            
            var u = this.p.minus(that.p).unit();
            var s = that.v.minus(this.v).dot(u);

            //this.v = this.v.plus(s * u);
            //that.v = that.v.minus(s * u);


        }
        else {
            // EXERCISE 10
            // Update this.v, that.v, this.w, that.w based on impulse
            // opposite to surface collision.
            var s1 = this.v.plus(this.w.cross(collision.minus(this.p)));
            var s2 = that.v.plus(that.w.cross(collision.minus(that.p)));
            var u = s2.minus(s1).unit();

            // (v + s u)^2 + (w + s p x u)^2
            // z = p x u
            // (v + s u)^2 + (w + s z)^2
            // 2 v*u + s + 2 w*z + s z^2
            // 2 v*u + 2 w*z + s (1 + z^2)
            var z1 = collision.minus(this.p).cross(u);
            var z2 = collision.minus(that.p).cross(u);
            var s = (((2 * that.v.dot(u) + 2 * that.w.dot(z2)) -
                      (2 * this.v.dot(u) + 2 * this.w.dot(z1))) /
                     (2 + z1.dot(z1) + z2.dot(z2)));

            this.v = this.v.plus(u.times(s));
            that.v = that.v.minus(u.times(s));
            this.w = this.w.plus(z1.times(s));
            that.w = that.w.minus(z2.times(s));
        }
    } 

    this.render = function (gl, program) {
        var vPosition = gl.getAttribLocation(program, "vPosition");
        var vNormal = gl.getAttribLocation(program, "vNormal");

        var sphere2world = this.rotated2world.times(this.object2rotated);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "model2world"), false, sphere2world.flatten());

        for (var i = 0; i < this.faces.length; i++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vbuffers[i]);
            gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, nbuffers[i]);
            gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormal);

            gl.drawArrays(gl.TRIANGLE_FAN, 0, this.faces[i].length);
        }
    }
}
