// files = [front, back, left, right, top, bottom]
function Skybox (gl, files, d) {

  this.pics = {};

  this.pics[files[0]] = new Picture(gl, new PV(-d, -d, -d, true), 
                                  (new PV( d,  0,  0, false)).unit(), 
                                  (new PV( 0,  d,  0, false)).unit(), 2*d, 2*d);

  this.pics[files[1]] = new Picture(gl, new PV(  d, -d, d, true), 
                                 (new PV( -d,  0,  0, false)).unit(), 
                                 (new PV(  0,  d,  0, false)).unit(), 2*d, 2*d);

  this.pics[files[2]] = new Picture(gl, new PV(-d,  -d,  d, true), 
                                 (new PV( 0,  0, -d, false)).unit(), 
                                 (new PV( 0,  d,  0, false)).unit(), 2*d, 2*d);

  this.pics[files[3]] = new Picture(gl, new PV( d,  -d, -d, true), 
                                  (new PV( 0,  0,  d, false)).unit(), 
                                  (new PV( 0,  d,  0, false)).unit(), 2*d, 2*d);

  this.pics[files[4]] = new Picture(gl, new PV(-d,  d,  -d, true), 
                                (new PV( d,  0,  0, false)).unit(), 
                                (new PV( 0,  0,  d, false)).unit(), 2*d, 2*d);

  this.pics[files[5]] = new Picture(gl, new PV(-d, -d, d, true), 
                                   (new PV( d,  0,  0, false)).unit(), 
                                   (new PV( 0,  0,  -d, false)).unit(), 2*d, 2*d);

  
  var my = this;

  this.images = {};

  for(var index in files) {
    var p = files[index];
    this.images[p] = new Image();
    this.images[p].onload = function() {
      console.log(this);
      var ind = this.src.substring(this.src.lastIndexOf("/")+1);
      my.pics[ind].tex = Texture2D.create(gl, Texture2D.Filtering.BILINEAR,
                                     Texture2D.Wrap.CLAMP_TO_EDGE, this.width, this.height,
                                     gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this, true);
    };
    this.images[p].src = p;
  }

  this.render = function(gl, program, eyeP) {

    //make sure the skybox is always centered at the eye position
    //still use the rotation of the eye

    for(var p in this.pics) {
      var old_p2w = this.pics[p].picture2world;
      var old_w2p = this.pics[p].world2picture;

      if(!this.pics[p].tex) continue;

      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(gl.getUniformLocation(program, "tex1"), 0);
      this.pics[p].tex.bind(gl);
 

      this.pics[p].picture2world = Mat.translation(eyeP).times(this.pics[p].picture2world);
      this.pics[p].world2picture = this.pics[p].world2picture.times(Mat.translation(eyeP.minus()));

      var M = gl.getUniformLocation( program, "model2world" );

      gl.uniformMatrix4fv(M, false, this.pics[p].picture2world.flatten());
     
      this.pics[p].render(gl, program);
    
      this.pics[p].picture2world = old_p2w;
      this.pics[p].world2picture = old_w2p;

    }

    
  }

}
