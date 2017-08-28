var gl;
var program;
var cube;
var model2clip;
var translation = new PV(0,0,0,false);
window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    cube = new Cube(gl);

    // EXERCISE:  create all the matrices here.
  
    var object2model = new Mat();
    object2model = Mat.translation(new PV( 1/2, 1/2, 1/2, false));
    var model2object = new Mat();
    model2object = Mat.translation(new PV( -1/2, -1/2, -1/2, false));
    console.log(model2object.times(object2model));
    
    var object2rotated = new Mat();
    var rotated2object = new Mat();
    
    var rotated2world = new Mat();
    
    var world2view = new Mat();
    var view2world = new Mat(); // SET

    var proj2view = new Mat(); // SET
    proj2view = proj2view.times(Mat.scale(new PV(1, 1, -1, false)));
    var view2proj = new Mat();
    view2proj = Mat.scale(new PV(1, 1, -1,false)).times(view2proj);
    console.log(view2proj.times(proj2view));
    
    var proj2clip = new Mat();
    proj2clip = proj2clip.times(Mat.scale(new PV(9/16, 1, 1, false)));
    var clip2proj = new Mat();
    clip2proj = Mat.scale(new PV(16/9, 1, 1, false)).times(clip2proj);
    console.log(clip2proj.times(proj2clip));

    var	canvas2clip = new Mat();
    canvas2clip =  Mat.translation(new PV(-1, 1, 0, false)).times(Mat.scale(new PV (2/canvas.width, -2/canvas.height, 1, false)));
    var clip2canvas = new Mat();
    clip2canvas = Mat.scale(new PV (canvas.width/2, -canvas.height/2, 1, false)).times(Mat.translation(new PV(1, -1, 0, false)));
    console.log(clip2canvas.times(canvas2clip));
    
    model2clip  =  proj2clip.times(view2proj.times(world2view.times(rotated2world.times(object2rotated.times(model2object)))));

    console.log(model2clip);

    document.getElementById("MyButton").onclick = function () {
        console.log("You clicked My Button!");
	
	
    };

    document.getElementById("ZPlus").onclick = function () {
        console.log("You clicked z + 0.1.");
	var add = new PV (0,0,0.1,false);
        translation = translation.plus(add);
	rotated2world = Mat.translation(translation);
	model2clip  =  proj2clip.times(view2proj.times(world2view.times(rotated2world.times(object2rotated.times(model2object)))));
	
    };

    document.getElementById("ZMinus").onclick = function () {
        console.log("You clicked z - 0.1.");
	var subtract = new PV (0,0,-0.1,false);
        translation = translation.plus(subtract);
	rotated2world = Mat.translation(translation);
	model2clip  =  proj2clip.times(view2proj.times(world2view.times(rotated2world.times(object2rotated.times(model2object)))));
    };

    var clientX, clientY;
    var downWorld;
    var mouseWorld;
    var mouseIsDown = false;

    canvas.addEventListener("mousedown", function (e) {
        mouseIsDown = true;
        clientX = e.clientX;
        clientY = e.clientY;
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var mouseCanvas = new PV(cursorX, cursorY, 0, true);
        mouseWorld = view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(mouseCanvas))));
	downWorld = mouseWorld;

        // EXERCISE
    });

    canvas.addEventListener("mouseup", function (e) {
        mouseIsDown = false;
    });

    canvas.addEventListener("mousemove", function (e) {
        if (!mouseIsDown)
            return;
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
	var mouseCanvas = new PV(cursorX, cursorY, 0, true);
	mouseWorld = view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(mouseCanvas))));
	
	if (mouseIsDown) {
	    var update = mouseWorld.minus(downWorld);
	  	   
	    translation = translation.plus(update);

	    var translationflipped = translation.times(-1);
	    console.log(translationflipped);
	    console.log(translation);
	    downWorld = mouseWorld;
	
	    rotated2world = Mat.translation(translation);
	    
            model2clip  =  proj2clip.times(view2proj.times(world2view.times(rotated2world.times(object2rotated.times(model2object)))));
	    
	}
        // EXERCISE
    });

    window.onkeydown = function( event ) {
        var key = String.fromCharCode(event.keyCode);
        console.log("You typed " + key);
        if (event.shiftKey)
            console.log("Shift is on.");
	if (key === 'X') {
	    object2rotated = Mat.rotation(0, 0.1).times(object2rotated);
            rotated2object = rotated2object.times(Mat.rotation(0, -0.1));
	    model2clip  =  proj2clip.times(view2proj.times(world2view.times(rotated2world.times(object2rotated.times(model2object)))));  
	}
	if (key === 'Y') {
	    object2rotated = Mat.rotation(1, 0.1).times(object2rotated);
            rotated2object = rotated2object.times(Mat.rotation(1, -0.1));
	    model2clip  =  proj2clip.times(view2proj.times(world2view.times(rotated2world.times(object2rotated.times(model2object)))));  
	}
	
	if (key === 'Z') {
	    object2rotated = Mat.rotation(2, 0.1).times(object2rotated);
            rotated2object = rotated2object.times(Mat.rotation(2, -0.1));
	    model2clip  =  proj2clip.times(view2proj.times(world2view.times(rotated2world.times(object2rotated.times(model2object)))));  
	}


        // EXERCISE
    };

    window.onresize = function (event) {
        console.log("resize " + canvas.width + " " + canvas.height);
    }

    render();
};



function render() {
    gl.enable(gl.DEPTH_TEST)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var model2clipLoc = gl.getUniformLocation( program, "model2clip" );

    gl.uniformMatrix4fv( model2clipLoc, false, model2clip.flatten() );
    cube.render(gl, program);

    requestAnimFrame( render )
}
