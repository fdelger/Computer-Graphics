var gl;
var program;
var sky_program;

var canvas;
var skybox;

var world2clip;
var world2clipL;
var world2clipR;

var view2world;
var view2worldL;
var view2worldR;

var world2view;
var world2viewL;
var world2viewR;

var picture;

var lightP;
var lightI;

var eyeP;
var eyePL;
var eyePR;

var eye_orig = new PV(0, 0, -12, true);

var flatOrRound = 1;

var texture1;
var texture2;

// Simple orthographic projection.
var view2proj = Mat.scale(new PV(1, 1, -1, false));
var proj2view = view2proj;

var view2projL;
var view2projR;
var proj2viewL;
var proj2viewR;

var view2clipL;
var view2clipR;
var clip2viewL;
var clip2viewR;

var Rvx = new Mat();
var Rvy = new Mat();

var Evx = new Mat();
var Evy = new Mat();
var Evz = new Mat();

var rx = 0;
var ry = 0;

var aperture = Math.PI / 3;
var aspect;

var skyboxes = [];
var skybox_index = 0;

function full() {
    var el = document.getElementById('screen');

    if(document.mozFullScreen || document.webkitIsFullScreen) {

        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }

    } else {

        if(el.webkitRequestFullScreen) {
            el.webkitRequestFullScreen();
        }
        else {
            el.mozRequestFullScreen();
        }

        console.log('fullscreen!');
    }
}

function resize() {
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

function on_fullscreen_change() {
    if(document.mozFullScreen || document.webkitIsFullScreen) {
        resize();
    }
    else {
        canvas.width = 960;
        canvas.height = 540;
    }
    
    aspect = 0.5*canvas.width / canvas.height;

    // Display portion of view between z=-near and z=-far.
    far = 20.0;
    focal_length = 3.6;
    near = focal_length / 5.0;

    //EXERCISE 2
    // Set b, t, l, and r using aperature and aspect
    t =  near * Math.tan(aperture/2);
    b = -t;
    r =  aspect * t; // no
    l =  -r;

    eye_sep = focal_length / 30.0;
    
    setPerspective();
    
}

document.addEventListener('mozfullscreenchange', on_fullscreen_change);
document.addEventListener('webkitfullscreenchange', on_fullscreen_change);

function load() {
    canvas = document.getElementById( "gl-canvas" );
    aspect = 0.5*canvas.width / canvas.height;

    // Display portion of view between z=-near and z=-far.
    far = 100.0;
    focal_length = 3.6;
    near = focal_length / 5.0;

    
    t =  near * Math.tan(aperture/2);
    b = -t;
    l =  aspect * b;
    r =  aspect * t;

    eye_sep = focal_length / 30.0;

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    image1 = new Image();
    image2 = new Image();
    image1.onload = function() {
        console.log("image1 loading");
        texture1 = Texture2D.create(gl, Texture2D.Filtering.BILINEAR,
      			            Texture2D.Wrap.CLAMP_TO_EDGE, image1.width, image1.height,
      			            gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1, true);
    };
    image2.onload = function() {
        console.log("image2 loading");
        texture2 = Texture2D.create(gl, Texture2D.Filtering.BILINEAR,
      			            Texture2D.Wrap.CLAMP_TO_EDGE, image2.width, image2.height,
      			            gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2, true);
    };
    image1.src = "mandrill.jpg";
    image2.src = "sierpinski.jpg";

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    sky_program = initShaders( gl, "sky-vertex-shader", "sky-fragment-shader" );
    gl.useProgram( program );

    skyboxes.push(new Skybox(gl, 
                             ["front.jpg", "back.jpg","left.jpg","right.jpg","top.jpg","bottom.jpg"], 1));
    skyboxes.push(new Skybox(gl, 
                             ["Front.png", "Back.png","Left.png","Right.png","Top.png","Bottom.png"], 1));

    skybox = skyboxes[skybox_index];
    
    spheres = [];
    /*
      spheres.push(new Sphere(gl, 32, 16,
      new PV( 0, 0, 0, true),
      new PV( 0, 0, 0, false),
      new PV( 0, 0, 0, false),
      new PV( 0, 0, 0, false),
      0, true
      ));
    */
    /*
      for(var i = 0; i < 4; i++) {
      
      var pos = new PV(Math.random()*10 - 5, Math.random()*10 - 5, 8 + Math.random()*3, false);
      var vel = new PV(0, 0, -4 + Math.random()*3, false);
      var acc = new PV(false);
      var ang = new PV(false);
      var mass = 1 + Math.random()*4;
      spheres.push(new Sphere(gl, 16, 8, pos, vel, acc, ang, mass, true));


      }
    */

    for(var i = 0; i < 10; i++) {
        var theta = 2*Math.PI*Math.random();
        var phi = Math.PI*(Math.random() - 0.5);
        var rad = 2 + Math.random()*10;
        var pos = Mat.rotation(1, theta).times(Mat.rotation(2, phi)).times(new PV(rad, 0, 0, false));
        theta = 2*Math.PI*Math.random();
        phi = Math.PI*(Math.random() - 0.5);
        var vel = Mat.rotation(1, theta).times(Mat.rotation(2, phi)).times(new PV(1, 0, 0, false));
        var acc = new PV(false);
        theta = 2*Math.PI*Math.random();
        phi = Math.PI*(Math.random() - 0.5);
        var speed = 1 + Math.random()*2;
        var ang = Mat.rotation(1, theta).times(Mat.rotation(2, phi)).times(new PV(speed, 0, 0, false));
        var mass = 1 + Math.random()*4;
        spheres.push(new Sphere(gl, 16, 8, pos, vel, acc, ang, mass, true));

    }

    /*
      spheres.push(new Sphere(gl, 32, 16, 
      new PV(  3,  0,  0, true), 
      new PV(  0,  0,  0, false),
      new PV(  0,  0,  0, false),
      new PV(  0,  0,  0, false),
      1, true
      ));

      spheres.push(new Sphere(gl, 32, 16, 
      new PV( -3,  0,  0, true), 
      new PV(  0,  0,  0, false),
      new PV(  0,  0,  0, false),
      new PV(  0,  0,  0, false),
      1, true
      ));
    */


    lightI = new PV(1, 1, 1, true);
    lightP = new PV(65, 65, -100, true);

    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
    document.onkeypress = keyPress;
    

    lookAt();
    setPerspective();
    updateM2C();
    requestAnimFrame(render);

}

// Camera rotates to look at center of object, keeping its x-axis level.
function lookAt() {

    // eye position is (0,0,0) in view coordinates....
    // object center position is (0,0,0) in object coordinates....
    // Calculate view2world and world2view.
    eye = Rvy.times(Rvx.times(eye_orig));

    var origin = new PV(0, 0, 0, true);
    //obj = eye.plus(Evz.times(Evy.times(Evx.times(eye.minus()))));
    obj = eye.plus(Evz.times(Evy.times(Evx.times(origin.minus(eye)))));
    var wy = new PV(0, 1, 0, false);

    var vz = eye.minus(obj).unit();
    //console.log("vz " + vz);
    var vx = wy.cross(vz).unit();
    var vy = vz.cross(vx);

    var R = new Mat(vx, vy, vz);
    var Rinv = R.transpose();

    var T = Mat.translation(eye);
    var Tinv = Mat.translation(eye.minus());

    view2world = T.times(R);
    world2view = Rinv.times(Tinv);

    // EXERCISE 1
    // Right eye is eye_sep/2.0 to the right.
    // Left eye is eye_sep/2.0 to the left.
    // Set view2worldR, world2viewR, view2worldL, world2viewL.
    var t = new PV(eye_sep/2.0, 0, 0, false);
    var T = Mat.translation(t);
    var Tinv = Mat.translation(t.minus());
    world2viewR = Tinv.times(world2view)
    view2worldR = view2world.times(T); 

    var t2 = new PV(-eye_sep/2.0, 0, 0, false);
    var T2 = Mat.translation(t);
    var Tinv2 = Mat.translation(t.minus());
    world2viewL = Tinv2.times(world2view); // no
    view2worldL = view2world.times(T2); // no

    console.log("view2world * world2view\n" +
                view2world.times(world2view));
}

function updateM2C () {

    // change to update to left or right matrix
    eyeP = view2world.times(new PV(true));
    eyePL = view2worldL.times(new PV(true));
    eyePR = view2worldR.times(new PV(true));

}

function setPerspective () {
    var aaa = -(far + near) / (far - near);
    var bbb = -2 * far * near / (far - near);
    view2proj = new Mat();
    view2proj[2][2] = aaa;
    view2proj[2][3] = bbb;
    view2proj[3][2] = -1;
    view2proj[3][3] = 0;
    
    proj2view = new Mat();
    proj2view[2][2] = 0;
    proj2view[2][3] = -1;
    proj2view[3][2] = 1 / bbb;
    proj2view[3][3] = aaa / bbb;


    console.log("view2proj\n" + view2proj);
    console.log("view2proj.times(new PV(0, 0, -near, true)) " +
                view2proj.times(new PV(0, 0, -near, true)));


    // Set view2proj and proj2view based on values of near and far
    // and the perspective projection.
    // Clicking My Button will switch between ortho and perspective.

    // EXERCISE 3
    // Set proj2clip to transform [l,r]x[t,b] to [-1,1]x[-1,1]
    // Set clip2proj
    // Left and right image will not be squashed.
    var n = near;
    var f = far;

    var T = Mat.translation(new PV(-(l/n + r/n)/2, -(t/n + b/n)/2, 0, false));
    var S = Mat.scale(new PV(2/(r/n - l/n), 2/(t/n - b/n), 1, false));
    var Tinv = Mat.translation(new PV((l/n + r/n)/2, (t/n + b/n)/2, 0, false));
    var Sinv = Mat.scale(new PV((r/n - l/n)/2, (t/n - b/n)/2, 1, false));

        
    var proj2clip = S.times(T);
    var clip2proj = Tinv.times(Sinv);
    console.log("proj2clip * clip2proj\n" +
                proj2clip.times(clip2proj));

    // EXERCISE 4
    // Using l,r,b,t, and focal_length, set lL,rL,lR, and rR
    /* t =  n * tan(aperture/2);
    b = -t;
    r =  aspect * t; // no
    l =  -r;
    */
    /* var t2 = new PV(-eye_sep/2.0, 0, 0, false); left */
    
    var lL = l - eye_sep/2.0 * (n/focal_length); // no
    var rL = r - eye_sep/2.0 * (n/focal_length) // no
    var lR = l + eye_sep/2.0 * (n/focal_length) // no
    var rR = r + eye_sep/2.0 * (n/focal_length)// no

    // EXERCISE 5
    // Set proj2clipL, clip2proj, proj2clipR, clip2projR using lL,rL or lR,rR.
    // Now stereo should work.
    var TL = Mat.translation(new PV(-(lL/n + rL/n)/2, -(t/n + b/n)/2, 0, false));
    var SL = Mat.scale(new PV(2/(rL/n - lL/n), 2/(t/n - b/n), 1, false));
    var TinvL = Mat.translation(new PV((lL/n + rL/n)/2, (t/n + b/n)/2, 0, false));
    var SinvL = Mat.scale(new PV((rL/n - lL/n)/2, (t/n - b/n)/2, 1, false));

    var proj2clipL = SL.times(TL) 

    var clip2projL = TinvL.times(SinvL); 

    view2clipL = proj2clipL.times(view2proj);
    clip2viewL = proj2view.times(clip2projL);

    console.log("view2clipL * clip2viewL\n" +
               view2clipL.times(clip2viewL));

    var TR = Mat.translation(new PV(-(lR/n + rR/n)/2, -(t/n + b/n)/2, 0, false));
    var SR = Mat.scale(new PV(2/(rR/n - lR/n), 2/(t/n - b/n), 1, false));
    var TinvR = Mat.translation(new PV((lR/n + rR/n)/2, (t/n + b/n)/2, 0, false));
    var SinvR = Mat.scale(new PV((rR/n - lR/n)/2, (t/n - b/n)/2, 1, false));

    var proj2clipR = SR.times(TR) // no

    var clip2projR = TinvR.times(SinvR);  // no

    view2clipR = proj2clipR.times(view2proj);
    clip2viewR = proj2view.times(clip2projR);

    console.log("view2clipR * clip2viewR\n" +
               view2clipR.times(clip2viewR));

}


var delta;

var animate = false;
var period = 2000;


function skyboxChange() {
    skybox_index = (skybox_index + 1) % skyboxes.length;
    skybox = skyboxes[skybox_index];
}

function animation() { 
    startTime = (new Date()).getTime(); 
    animate = !animate;
}

var keys = {
    left: false,
    right: false,
    up: false,
    down: false
};

function keyPress(e) {
    
    e = e || window.event;

    if(e.charCode == '32') {
        animation();
    }
    if(e.charCode == '102') {
        full();
    }

}

function keyDown(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        keys.up = true;
    }
    else if (e.keyCode == '40') {
        keys.down = true;
    }
    else if (e.keyCode == '37') {
        keys.left = true;
    }
    else if (e.keyCode == '39') {
        keys.right = true;
    }

}

function keyUp(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        keys.up = false;
    }
    else if (e.keyCode == '40') {
        keys.down = false;
    }
    else if (e.keyCode == '37') {
        keys.left = false;
    }
    else if (e.keyCode == '39') {
        keys.right = false;
    }

}

var alpha = 0; //pan around z up in world
var beta = 0;  //tilt around x forward
var gamma = 0; //yaw around y left in world

var orientation = false;

if (window.DeviceOrientationEvent) {

    // Listen for the deviceorientation event and handle the raw data
    window.addEventListener('deviceorientation', function(eventData) {
        // gamma is the left-to-right tilt in degrees, where right is positive
        tiltLR = eventData.gamma;
        // beta is the front-to-back tilt in degrees, where front is positive
        tiltFB = eventData.alpha;

        alpha = eventData.alpha;
        beta = eventData.beta;
        gamma = eventData.gamma - 90;

        alpha = beta = gamma = 0;

        orientation = true;

    }, false);
}

var count = 0;

function render() {
    
    count++;

    var speed = 60;

    if(keys.up) {
        rx = Math.min(rx + 1/speed, 1);
    }
    if(keys.down) {
        rx = Math.max(rx - 1/speed, -1);
    }
    if(keys.left) {
        ry += 1/speed;
    }
    if(keys.right) {
        ry -= 1/speed;
    }

    if(keys.up || keys.down || keys.left || keys.right) {

        console.log("rx: " + rx);
        console.log("ry: " + ry);

        Rvx = Mat.rotation(0, 0.5*Math.PI*rx);
        Rvy = Mat.rotation(1, 0.5*Math.PI*ry);
        lookAt();
        updateM2C();

    }

    if(orientation) {

        
        Evx = Mat.rotation(0, Math.PI * -gamma / 180);
        Evy = Mat.rotation(1, Math.PI * -alpha / 180);
        Evz = Mat.rotation(2, Math.PI * -beta  / 180);
        lookAt();
        updateM2C();

        orientation = false;

    }


    if(animate && count % 2 == 0) {
        time = (new Date()).getTime();
        delta = (time - startTime);
        startTime = time;

        for(var i = 0; i < spheres.length; i++) {
            spheres[i].a = spheres[i].p.times(-spheres[i].g * 0.1);
            spheres[i].update(delta);
        }
        


        for(var i = 0; i < spheres.length; i++) {
            for(var j = 0; j < spheres.length; j++) {
                if(i != j && spheres[i].phy && spheres[j].phy) {
                    if(spheres[i].collides(spheres[j])) {
                        //console.log(i + " collides " + j);
                        spheres[i].fixCollision(spheres[j]);
                    }
                }
            }
        }
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    if (!texture1 || !texture2) {
        requestAnimFrame( render )
        return;
    }

    var useNormalLoc = gl.getUniformLocation(program, "useNormal");
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(gl.getUniformLocation(program, "tex1"), 0);
    texture1.bind(gl);
    gl.activeTexture(gl.TEXTURE1);
    gl.uniform1i(gl.getUniformLocation(program, "tex2"), 1);
    texture2.bind(gl);

    gl.uniform1i(useNormalLoc, 1);
    
    gl.uniform4fv(gl.getUniformLocation(program, "lightP"), lightP.flatten());
    gl.uniform4fv(gl.getUniformLocation(program, "lightI"), lightI.flatten());

    for(var i = 0; i < spheres.length; i++) {

        // render LEFT


        gl.viewport(0, 0, canvas.width/2.0, canvas.height);
        gl.uniform4fv(gl.getUniformLocation(program, "eyeP"), eyePL.flatten());    

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "world2view"), false, world2viewL.flatten()); 
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "view2clip"), false, view2clipL.flatten());


        spheres[i].render(gl, program);

        // render RIGHT

        gl.viewport(canvas.width/2.0, 0, canvas.width/2.0, canvas.height);

        gl.uniform4fv(gl.getUniformLocation(program, "eyeP"), eyePR.flatten());    

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "world2view"), false, world2viewR.flatten()); 
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "view2clip"), false, view2clipR.flatten());

        spheres[i].render(gl, program);

    }

    gl.useProgram(sky_program);

    gl.viewport(0, 0, canvas.width/2, canvas.height);
    gl.uniformMatrix4fv(gl.getUniformLocation(sky_program, "world2view"), false, world2viewL.flatten()); 
    gl.uniformMatrix4fv(gl.getUniformLocation(sky_program, "view2clip"), false, view2clipL.flatten());
    skybox.render(gl, sky_program, eyePL);
    
    gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height);
    gl.uniformMatrix4fv(gl.getUniformLocation(sky_program, "world2view"), false, world2viewR.flatten()); 
    gl.uniformMatrix4fv(gl.getUniformLocation(sky_program, "view2clip"), false, view2clipR.flatten());
    skybox.render(gl, sky_program, eyePR);


    requestAnimFrame( render )
}

