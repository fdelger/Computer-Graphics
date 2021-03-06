
var gl;
var vertices;
var program;
var bufferId;
var translation = vec4 (0,0,0,0);
var translation2 = vec4 (0,0,0,0);

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
    // Four Vertices
    
    vertices = [
        vec2( -0.5, -0.5 ),
        vec2(  0.5, -0.5 ),
        vec2( -0.5,  0.5 ),
        vec2(  0.5,  0.5)
    ];
  
    // A 3D triangle

    vertices2 = [
        vec3( -0.75, -0.75,  0.5 ),
        vec3(  0.75, -0.75,  0.5 ),
        vec3(  0.0,   0.25, -0.5)
    ];

    // Array of Colors2

    colors2 = [
        vec3( 1.0, 0.0, 0.0),
	vec3( 0.0, 1.0, 0.0),
	vec3( 0.0, 0.0, 1.0),
    ];
    
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    bufferId2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices2), gl.STATIC_DRAW);

    bufferId2c = gl.createBuffer();
    gl.bindBuffer ( gl.ARRAY_BUFFER, bufferId2c );
    gl.bufferData ( gl.ARRAY_BUFFER, flatten(colors2), gl.STATIC_DRAW);
    
    document.getElementById("MyButton").onclick = function () {
        console.log("You clicked My Button!");
    };
    
    document.getElementById("z + 0.1").onclick = function () {
        translation2[2] += 0.1;
     };
    
    document.getElementById("z - 0.1").onclick = function () {
        translation2[2] -= 0.1;
    };


    canvas.addEventListener("click", function (e) {
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
        var newVertex = [clipX, clipY];
	vertices.push(newVertex);
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
	
    });

    var downX;
    var downY;
    var mouseIsDown;
    
    canvas.addEventListener("mousedown", function (e) {
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
	downX = clipX;
	downY = clipY;
        mouseIsDown = true;
    }); 

    canvas.addEventListener("mouseup", function (e) {
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
        mouseIsDown = false;
    });

     canvas.addEventListener("mousemove", function (e) {
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
	if (mouseIsDown) {
	    translation2[0]+= clipX - downX;
	    translation2[1]+= clipY - downY;
	    console.log(clipX-downX);  
	    downX = clipX;
	  
	    downY = clipY;
	    
	}
    });

    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    var colorLoc = gl.getUniformLocation( program, "color" );
    var translationLoc = gl.getUniformLocation( program, "translation");
    var vColor = gl.getAttribLocation(program, "vColor" );
    var useColorLoc = gl.getUniformLocation(program, "useColor" );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    var color = vec4 (0.0, 1.0, 0.0, 1.0);
    gl.uniform4fv(colorLoc, flatten(color) );
    gl.uniform4fv( translationLoc, flatten(translation) );
    gl.uniform1i (useColorLoc, 1);

    gl.disableVertexAttribArray(vColor);
    
    
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, vertices.length );

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2 );
    gl.vertexAttribPointer(  vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    var color2 = vec4(1.0, 0.0, 0.0, 1.0);
    gl.uniform4fv(colorLoc, flatten(color2) );
    gl.uniform4fv( translationLoc, flatten(translation2) );
    gl.uniform1i(useColorLoc, 0);
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2c );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, vertices2.length );
    
    requestAnimFrame( render )
}
