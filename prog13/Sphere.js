function Sphere (gl, nLon, nLat, color) {
    this.color = color;
    this.verts = [];
    this.vnormals = [];
    this.faces = [];
    this.fnormals = [];

    var vbuffers = [];
    var nbuffers = [];

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
/*
        var ftcoords = [];
        for (var j = 0; j < this.faces[i].length; j++)
            ftcoords.push(this.tcoords[this.faces[i][j]]);

        var tbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(ftcoords), gl.STATIC_DRAW);
        tbuffers.push(tbuffer);
*/
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

        n.unitize;
        this.fnormals.push(n);
    }

    this.render = function (gl, program, flatOrRound) {
        var vPosition = gl.getAttribLocation(program, "vPosition");
        var vNormal = gl.getAttribLocation(program, "vNormal");
        var colorLoc = gl.getUniformLocation(program, "color");
        var normalLoc = gl.getUniformLocation(program, "normal");
        var useNormalLoc = gl.getUniformLocation(program, "useNormal");
        var vTCoord = gl.getAttribLocation(program, "vTCoord");

        var center = new PV(0.5, 0.5, 0.5, true);

        for (var i = 0; i < this.faces.length; i++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vbuffers[i]);
            gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, nbuffers[i]);
            gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormal);
            /*
            gl.bindBuffer(gl.ARRAY_BUFFER, tbuffers[i]);
            gl.vertexAttribPointer(vTCoord, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vTCoord);
*/

            var color = center.plus(this.fnormals[i].times(0.5));
            gl.uniform4fv(colorLoc, color.flatten());

            gl.uniform4fv(normalLoc, this.fnormals[i].flatten());
            gl.uniform1i(useNormalLoc, flatOrRound);

            gl.drawArrays(gl.TRIANGLE_FAN, 0, this.faces[i].length);
        }
    }

    // EXERCISE 4:
    // Calculate value of s for which q + s u intersects the plane of the
    // face with index f, even if it is negative or misses the face itself.
    // Return s.
    this.planeHit  = function (f, q, u) {
        var normals = this.fnormals[f];
        var vertices = this.verts[this.faces[f][0]];
        return -normals.dot(q.minus(vertices)) / normals.dot(u);

    }

    // EXERCISE 5:
    // p lies on the plane of the (convex) face f.
    // Return true if p lies inside the face.
    this.contains = function (f, p) {
        var norm = this.fnormals[f];
        var facesf = this.faces[f];
        for(var i = 0; i < facesf.length; i++){
            var wrap = (i+1) % facesf.length; 
            var vertices2 = this.verts[facesf[i]];
            var nextvertex = this.verts[facesf[wrap]];
            if(norm.dot( vertices2.minus(p).cross(nextvertex.minus(p))) < 0)
                return false;
        }
        return true;

    }

    // EXERCISE 6
    // Return s for the closest hit face or 1e9 if no face is hit.
    this.closestHit = function (q, u) {
        var sMin = 1e9;
        
        // PUT YOUR SOLUTION HERE
        for(var i = 0; i < this.faces.length; i++){
            var s = this.planeHit(i, q, u);
            if( s > 0 ) {
                var vector = q.plus(u.times(s));
                if(this.contains(i, vector) && s < sMin)
                    sMin = s;
            }
        }
        return sMin;
    }
}
