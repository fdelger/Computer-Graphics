var gl;
var program;
var cube;
var model2clip;

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


    // Make the center of the model the origin of the object.
    var modelT = new PV(-0.5, -0.5, -0.5, false);
    var model2object = Mat.translation(modelT);
    var object2model = Mat.translation(modelT.minus());

    // Give the object a small initial rotation in x and y.
    var object2rotated = Mat.rotation(1, 0.1).times(Mat.rotation(0, 0.1));
    var rotated2object = Mat.rotation(0, -0.1).times(Mat.rotation(1, -0.1));

    // Current translation of the object in the world.
    var translation = new PV(0, 0, 0, false);
    // EXERCISE 1
    // Change z translation to -3.
    translation = new PV(0, 0, -3, false);
    var rotated2world = Mat.translation(translation);
    var world2rotated = Mat.translation(translation.minus());

    var world2view = new Mat();
    var view2world = new Mat();

    // Clicking lookAt button sets world2view and view2world using
    // lookAt() function.
    document.getElementById("lookAt").onclick = function () {
        lookAt();
    };

    // Camera rotates to look at center of object, keeping its x-axis level.
    function lookAt () {
        // EXERCISE 4
        // eye position is (0,0,0) in view coordinates....
        // object center position is (0,0,0) in object coordinates....
        // Calculate view2world and world2view.
        eye = view2world.times(new PV(true));
        obj = rotated2world.times(new PV(true));
        var wy = new PV(0, 1, 0, false);
        var vz = eye.minus(obj).unit();
        console.log("vz " + vz);
        var vx = wy.cross(vz).unit();
        var vy = vz.cross(vx);

        var R = new Mat(vx, vy, vz);
        var Rinv = R.transpose();

        console.log("R * Rinv\n" + R.times(Rinv));
        var T = Mat.translation(eye);
        var Tinv = Mat.translation(eye.minus());

        view2world = T.times(R);
        world2view = Rinv.times(Tinv);

        console.log("view2world * world2view\n" +
                    view2world.times(world2view));
        updateM2C();
    }
        
    // Simple orthographic projection.
    var view2proj = Mat.scale(new PV(1, 1, -1, false));
    var proj2view = view2proj;
 
    // Display portion of view between z=-near and z=-far.
    var near = 2.0, far = 10.0;

    function setOrthographic () {
        // EXERCISE 1
        // Set view2proj and proj2view based on values of near and far
        // and the orthographic projection.
        // What value of z translates to 0?
        // How is z scaled so near to far goes to -1 to 1?
        view2proj = Mat.scale(new PV(1, 1, 2/(near - far), true))
            .times(Mat.translation(new PV(0, 0, (near + far)/2, false)));
        proj2view = Mat.translation(new PV(0, 0, -(near + far)/2, false))
            .times(Mat.scale(new PV(1, 1, (near - far)/2, true)));

        console.log("view2proj * proj2view\n" +
                    view2proj.times(proj2view));
        updateM2C();
    }

    function setPerspective () {
        // EXERCISE 6
        // Set view2proj and proj2view based on values of near and far
        // and the perspective projection.
        // Clicking My Button will switch between ortho and perspective.
        var a = -(far + near) / (far - near);
        var b = -2 * far * near / (far - near);
        view2proj = new Mat();
        view2proj[2][2] = a;
        view2proj[2][3] = b;
        view2proj[3][2] = -1;
        view2proj[3][3] = 0;
        
        proj2view = new Mat();
        proj2view[2][2] = 0;
        proj2view[2][3] = -1;
        proj2view[3][2] = 1 / b;
        proj2view[3][3] = a / b;

        console.log("view2proj * proj2view\n" +
                    view2proj.times(proj2view));
        updateM2C();
    }

    var aspect = canvas.width / canvas.height;
    var proj2clip = Mat.scale(new PV(1 / aspect, 1, 1, true));
    var clip2proj = Mat.scale(new PV(aspect, 1, 1, true));

    // Zoom factor.
    var zoom = 1;

    function setZoom () {
        // EXERCISE 5
        // Set proj2clip and clip2proj based on zoom (and aspect ratio).
        proj2clip = Mat.scale(new PV(zoom / aspect, zoom, 1, true));
        clip2proj = Mat.scale(new PV(aspect / zoom, 1 / zoom, 1, true));
        
        console.log("clip2proj * proj2clip\n" +
                    clip2proj.times(proj2clip));
        updateM2C();
    }

    var clip2canvas =
        Mat.scale(new PV(canvas.width / 2.0, -canvas.height / 2.0, 1, true))
        .times(Mat.translation(new PV(1, -1, 0, false)));
    var canvas2clip =
        Mat.translation(new PV(-1, 1, 0, false))
        .times(Mat.scale(new PV(2.0 / canvas.width, -2.0 / canvas.height, 1, true)));

    // EXERCISE 1
    setOrthographic();

    updateM2C();

    function updateM2C () {
        model2clip = proj2clip.times(view2proj).times(world2view).times(rotated2world).times(object2rotated).times(model2object);

        console.log("model2clip " + model2clip);
    }

    document.getElementById("slider").onchange = function(event) {
        console.log("slider " + event.target.value);

        // EXERCISE 5
        // Set zoom to go from 1 to 10 as slider goes through range.
        // Zoom slider should now work.
        zoom = event.target.value / 100;
        console.log("zoom " + zoom);

        console.log("zoom " + zoom);
        setZoom();
    };

    var perspective = false;
    document.getElementById("MyButton").onclick = function () {
        console.log("You clicked My Button!");
        if (perspective)
            setPerspective();
        else
            setOrthographic();
        perspective = !perspective;
    };

    document.getElementById("ZPlus").onclick = function () {
        console.log("You clicked z + 0.1.");

        // EXERCISE 2
        // Change the following code to modify world2view and
        // view2world corresponding to moving the camera 0.1 in the
        // positive z direction.
        /*
        translation[2] += 0.1;
        rotated2world = Mat.translation(translation);
        world2rotated = Mat.translation(translation.minus());
        */
        var T = Mat.translation(new PV(0, 0, 0.1, false));
        var Tinv = Mat.translation(new PV(0, 0, -0.1, false));
        world2view = Tinv.times(world2view);
        view2world = view2world.times(T);

        console.log("world2view * view2world\n" +
                    world2view.times(view2world));
        updateM2C();
    };

    document.getElementById("ZMinus").onclick = function () {
        console.log("You clicked z - 0.1.");
        // EXERCISE 2
        // Change the following code to modify world2view and
        // view2world corresponding to moving the camera 0.1 in the
        // negative z direction.
        /*
        translation[2] -= 0.1;
        rotated2world = Mat.translation(translation);
        world2rotated = Mat.translation(translation.minus());
        */
        var T = Mat.translation(new PV(0, 0, -0.1, false));
        var Tinv = Mat.translation(new PV(0, 0, 0.1, false));
        world2view = Tinv.times(world2view);
        view2world = view2world.times(T);

        console.log("world2view * view2world\n" +
                    world2view.times(view2world));
        updateM2C();
    };

    var clientX, clientY;
    var downWorld;
    var mouseIsDown = false;
    var vertexClickDistance = 4;
    var clickedModel;

    canvas.addEventListener("mousedown", function (e) {
        clientX = e.clientX;
        clientY = e.clientY;
        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
        console.log("X: " + clipX + " Y: " + clipY);

        // EXERCISE 8
        // Calculate mouseCanvas.  Set clickedModel undefined.
        mouseCanvas = new PV(cursorX, cursorY, 0, true);
        clickedModel = undefined;
        // For each vertex in the model, check if its image in the
        // canvas is less thant vertexClickDistance.
        // If so, set clickedModel.
        for (i = 0; i <= 7 ; i++) {
                var CanvasCube;
                //var test;
                var ModelCube = cube.verts[i];
                CanvasCube = clip2canvas.times(proj2clip.times(view2proj.times(world2view.times(rotated2world.times
                    (object2rotated.times(model2object.times(ModelCube)))))));
                CanvasCube = CanvasCube.homogeneous();
                CanvasCube[3] = 0;
                if (CanvasCube.distance(mouseCanvas) < 4) {
                    //clickedModel = CanvasCube;
                    clickedModel = ModelCube;
                    //test = clickedModel
                }


        }

        // If clickedModel is defined, print it to the console.
        console.log("clickedModel " + clickedModel);

        // EXERCISE 7
        // Transform center of object to canvas coordinates and
        // homogenenize (use .homogeneous()).
        var objCanvas = clip2canvas.times(proj2clip.times(view2proj.times(world2view.times(rotated2world.times(new PV(true)))))).homogeneous();

        // CHANGE the following mouse click to use the z-coordinate of
        // center of object instead of zero.
        mouseCanvas = new PV(cursorX, cursorY, objCanvas[2], true);

        // Homogenize the following:
        var mouseWorld = view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(mouseCanvas)))).homogeneous();

        downWorld = mouseWorld;
        mouseIsDown = true;
    });

    canvas.addEventListener("mouseup", function (e) {
        mouseIsDown = false;
        if (e.clientX == clientX && e.clientY == clientY) {
            var cursorX = e.clientX - canvas.offsetLeft;
            var cursorY = e.clientY - canvas.offsetTop;
            console.log("X: " + cursorX + " Y: " + cursorY);
            var clipX = cursorX * 2 / canvas.width - 1;
            var clipY = -(cursorY * 2 / canvas.height - 1);
            console.log("X: " + clipX + " Y: " + clipY);
        }
    });

    canvas.addEventListener("mousemove", function (e) {
        if (!mouseIsDown)
            return;

        var cursorX = e.clientX - canvas.offsetLeft;
        var cursorY = e.clientY - canvas.offsetTop;
        console.log("X: " + cursorX + " Y: " + cursorY);
        var clipX = cursorX * 2 / canvas.width - 1;
        var clipY = -(cursorY * 2 / canvas.height - 1);
        console.log("X: " + clipX + " Y: " + clipY);
            
        if (clickedModel == undefined) {
            // EXERCISE 7
            // Same as in mousedown.
            var objCanvas = clip2canvas.times(proj2clip.times(view2proj.times(world2view.times(rotated2world.times(new PV(true)))))).homogeneous();
            
            var mouseCanvas = new PV(cursorX, cursorY, objCanvas[2], true);
            var mouseWorld = view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(mouseCanvas)))).homogeneous();
            
            translation = translation.plus(mouseWorld.minus(downWorld));
            downWorld = mouseWorld;
            
            rotated2world = Mat.translation(translation);
            world2rotated = Mat.translation(translation.minus());
            
            console.log("rotated2world * world2rotated\n" +
                        rotated2world.times(world2rotated));
        }
        else {
            // EXERCISE 9
            // Get the frontmost and backmost point corresponding to
            // the click point in the canvas.
            var f;
            var b;
            f = new PV(cursorX, cursorY, 1, true);
            b = new PV(cursorX, cursorY, -1, true);

            // Transform them to f and b in the *rotated* frame.
            f = world2rotated.times(view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(f)))));
            b = world2rotated.times(view2world.times(proj2view.times(clip2proj.times(canvas2clip.times(b)))));

            // u is the unit vector parallel to line fb
            var u = b.minus(f).unit();
            // o is the center of the object
            var o = new PV(0,0,0,true);
        
            // p is the vertex that was clicked on
            var p = clickedModel;
            // Convert p to the rotated frame
            p = object2rotated.times(model2object.times(p));


            // v is the vector from o to p
            var v = p.minus(o).unit();
            // Calculate w, the vector that takes o to the closest
            // point on line fb and print it to the console.
            var s = (u.dot(o) - u.dot(f)) / u.dot(u);
            var w = f.plus(u.times(s)).minus(o);



            // EXERCISE 10
            // Update w if it is longer than v.
            if (w.magnitude() > v.magnitude()) {
                w = w.times(v.magnitude()/w.magnitude());
            }
 
            // If it is shorter, calculate t: the distance along fb to
            // a point whose distance from o is the length of v.
            // Set w to w + u t or w - ut, whichever is closer to v.
            else {
                var t = Math.sqrt(v.dot(v)- w.dot(w));
                if ( w.plus(u.times(t)).distance(v) > w.minus(u.times(t)).distance(v) )
                    w = w.minus(u.times(t));
                else{
                    w = w.plus(u.times(t));
                }
            }

            // Print w to the console.
            console.log(w);

            // EXERCISE 11
            // No matter how we got w, check if its distance to v is
            // less than 1e-6.  If so, just return.
            if (w.distance(v) < 1e-6)
                return;
            var vx = v.unit();
            var wx = w.unit();

            var vz = v.cross(w).unit();
            var wz = vz;

            var vy = vz.cross(vx);
            var wy = wz.cross(wx);

            // Calculate a rotation that takes v to w.
            var V = new Mat(vx, vy, vz);
            var W = new Mat(wx, wy, wz);

           
            V = W.times(V.transpose());

            //W1.times(V1.transpose()).times(vx);
            //W1.times(1,0,0);

            // How does object2rotated update?
            object2rotated = V.times(object2rotated);


        }

        updateM2C();
    });

    window.onkeydown = function( event ) {
        switch (event.keyCode) {
        case 37:
            console.log('left');
            break;
        case 38:
            console.log('up');
            break;
        case 39:
            console.log('right');
            break;
        case 40:
            console.log('down');
            break;
        }
        
        // EXERCISE 3
        // Update world2view and view2world so that arrow keys move
        // the camera in the direction of the arrow by 0.1 units.
        if (37 <= event.keyCode && event.keyCode <= 40) {
            var t = [ [ -0.1, 0 ], [ 0, 0.1 ], [ 0.1, 0 ], [ 0, -0.1 ] ];
            var i = event.keyCode - 37;
            var t = new PV(t[i][0], t[i][1], 0, false);
            world2view = Mat.translation(t.minus()).times(world2view);
            view2world = view2world.times(Mat.translation(t));
            updateM2C();
            return;
        }
        
        var key = String.fromCharCode(event.keyCode);
        var rotSign = event.shiftKey ? -1 : 1;
        console.log("You clicked " + key);
        switch( key ) {
        case 'X':
            object2rotated = Mat.rotation(0, 0.1 * rotSign).times(object2rotated);
            rotated2object = rotated2object.times(Mat.rotation(0, -0.1 * rotSign));
            break;
            
        case 'Y':
            object2rotated = Mat.rotation(1, 0.1 * rotSign).times(object2rotated);
            rotated2object = rotated2object.times(Mat.rotation(1, -0.1 * rotSign));
            break;
            
        case 'Z':
            object2rotated = Mat.rotation(2, 0.1 * rotSign).times(object2rotated);
            rotated2object = rotated2object.times(Mat.rotation(2, -0.1 * rotSign));
            break;
        }
        
        updateM2C();
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


    if (false) {
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    var colorLoc = gl.getUniformLocation( program, "color" );

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    var color2 = new PV(1.0, 1.0, 0.0, 1.0);
    gl.uniform4fv( colorLoc, color2.flatten());

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, vertices2.length );
    }

    gl.uniformMatrix4fv(model2clipLoc, false, model2clip.flatten());

    cube.render(gl, program);

    requestAnimFrame( render )
}
