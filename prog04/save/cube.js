function Cube (gl) {
    this.verts = [ new PV(0, 0, 0, true),
                   new PV(1, 0, 0, true),
                   new PV(0, 1, 0, true),
                   new PV(1, 1, 0, true),
                   new PV(0, 0, 1, true),
                   new PV(1, 0, 1, true),
                   new PV(0, 1, 1, true),
                   new PV(1, 1, 1, true) ];

    this.faces = [ [0, 1, 5, 4],
                   [0, 4, 6, 2],
                   [0, 2, 3, 1],
                   [7, 3, 2, 6],
                   [7, 6, 4, 5],
                   [7, 5, 1, 3] ];

    this.colors = [ new PV(1, 0, 0, true),
                    new PV(0, 1, 0, true),
                    new PV(1, 1, 0, true),
                    new PV(0, 0, 1, true),
                    new PV(1, 0, 1, true),
                    new PV(0, 1, 1, true) ];

    var buffers = [];
    var vertices = [
	
	           new PV(0, 0, 0, true),
                   new PV(0, 0, 0, true),
                   new PV(0, 0, 0, true),
                   new PV(0, 0, 0, true),
                  
    ];
   
    var faceposition = 0;
    for ( var i = 0; i <= this.faces.length - 1 ; i++ )  {
	buffers[i] = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, buffers[i] );
		
	for ( var k = 0; k <= 3; k++ ) {
            faceposition = this.faces[i][k];
	    vertices[k] = this.verts[faceposition];
	    
	    if ( k === 3) {
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
	    }
	}
    }

    // EXERCISE:  initialize buffers.
    

    this.render = function (gl, program) {
        //EXERCISE:  render all six faces of the cube.
	
	var j;
	var vPosition = gl.getAttribLocation( program, "vPosition" );
        var colorLoc = gl.getUniformLocation( program, "color" );

	for ( j = 0 ; j <= buffers.length-1 ; j++ ) {
	     gl.bindBuffer( gl.ARRAY_BUFFER, buffers[j] );
             gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
             gl.enableVertexAttribArray( vPosition );
	     gl.uniform4fv(colorLoc, this.colors[j].flatten() );
	     gl.drawArrays( gl.TRIANGLE_FAN, 0, vertices.length);
	}
	// gl.drawArrays( gl.TRIANGLE_STRIP, 0, this.verts.length);
	
    }
}
