//=============================================================================
// LOAD VIDEO AND SHARE IT TO OTHER CLIENTS
//=============================================================================
function loadPicture(windowId, url) {
	if(infos.position.i != null && infos.position.j != null){
		var img=new Image();
		img.src=url;
		img.addEventListener("load", function () {
		   	var data = { "masterPosition": infos.position, "image": this }
			var canvas = createCanvas(windowId, "IMAGE", 600, 400, "picture", true, true, data);
		
			var gesturableImg = new ImgTouchCanvas({
			    canvas: canvas,
			    path: url,
			    desktop: false
			});
		
			data = { "masterPosition": infos.position}
			shareMediaDisplay(windowId, "picture", "IMAGE", false, data);
			shareImage(windowId, this.canvas.toDataURL("image/jpeg"));
			var width = $('div.display').width();
			var height = $('div.display').height();
		});	
	}
}

(function() {
    var root = this; //global object

    var ImgTouchCanvas = function(options) {
        if( !options || !options.canvas || !options.path) {
            throw 'ImgZoom constructor: missing arguments canvas or path';
        }

        this.canvas         = options.canvas;
        this.canvas.width   = this.canvas.clientWidth;
        this.canvas.height  = this.canvas.clientHeight;
        this.context        = this.canvas.getContext('2d');

                
       
	console.log("ok");
        this.desktop = options.desktop || false; //non touch events
        
        this.position = {
            x: 0,
            y: 0
        };
        this.scale = {
            x: 0.5,
            y: 0.5
        };
        this.imgTexture = new Image();
        this.imgTexture.src = options.path;

        this.lastZoomScale = null;
        this.lastX = null;
        this.lastY = null;

        this.mdown = false; //desktop drag

        this.init = false;
        this.checkRequestAnimationFrame();
        requestAnimationFrame(this.animate.bind(this));

        this.setEventListeners();
    };


    ImgTouchCanvas.prototype = {
        animate: function() {
            //set scale such as image cover all the canvas
            if(!this.init) {
                if(this.imgTexture.width) {
                    var scaleRatio = null;
                    if(this.canvas.clientWidth > this.canvas.clientHeight) {
                        scaleRatio = this.canvas.clientWidth / this.imgTexture.width;
                    }
                    else {
                        scaleRatio = this.canvas.clientHeight / this.imgTexture.height;
                    }

                    this.scale.x = scaleRatio;
                    this.scale.y = scaleRatio;
                    this.init = true;
                }
            }

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.context.drawImage(
                this.imgTexture, 
                this.position.x, this.position.y, 
                this.scale.x * this.imgTexture.width, 
                this.scale.y * this.imgTexture.height);

            requestAnimationFrame(this.animate.bind(this));
        },


        gesturePinchZoom: function(event) {
            var zoom = false;

            if( event.targetTouches.length >= 2 ) {
                var p1 = event.targetTouches[0];
                var p2 = event.targetTouches[1];
                var zoomScale = Math.sqrt(Math.pow(p2.pageX - p1.pageX, 2) + Math.pow(p2.pageY - p1.pageY, 2)); //euclidian distance
                
                

                if( this.lastZoomScale ) {
                    zoom = zoomScale - this.lastZoomScale;
                }

                this.lastZoomScale = zoomScale;
            }    

            return zoom;
        },

        doZoom: function(zoom,relativeX, relativeY) {
            if(!zoom) return;

            //new scale
            var currentScale = this.scale.x;

            var newScale = this.scale.x + zoom/100;
            

            //some helpers
            var deltaScale = newScale - currentScale;
            var currentWidth    = (this.imgTexture.width * this.scale.x);
            var currentHeight   = (this.imgTexture.height * this.scale.y);
            var deltaWidth  = this.imgTexture.width*deltaScale;
            var deltaHeight = this.imgTexture.height*deltaScale;
            


            //by default scale doesnt change position and only add/remove pixel to right and bottom
            //so we must move the image to the left to keep the image centered
            //ex: coefX and coefY = 0.5 when image is centered <=> move image to the left 0.5x pixels added to the right
            var canvasmiddleX = this.canvas.clientWidth / 2;
            var canvasmiddleY = this.canvas.clientHeight / 2;
            var xonmap = (-this.position.x) + canvasmiddleX;
            var yonmap = (-this.position.y) + canvasmiddleY;
            var coefX = -xonmap / (currentWidth);
            var coefY = -yonmap / (currentHeight);
            var newPosX = this.position.x + deltaWidth*coefX;
            var newPosY = this.position.y + deltaHeight*coefY;
		
            //edges cases
            /*var newWidth = currentWidth + deltaWidth;
            var newHeight = currentHeight + deltaHeight;
            
            if( newWidth < this.canvas.clientWidth ) { newPosX = relativeX-this.imgTexture.width/2 - newWidth;}
            if( newPosX > 0 ) { newPosX = 0; }
            if( newPosX + newWidth < this.canvas.clientWidth ) { newPosX = relativeX+this.imgTexture.width/2 - newWidth;}
            
            if( newHeight < this.canvas.clientHeight ) { newPosY = relativeY-this.imgTexture.height/2 - newHeight; }
            if( newPosY > 0 ) { newPosY = 0; }
            if( newPosY + newHeight < this.canvas.clientHeight ) { newPosY = relativeY+this.imgTexture.height/2 - newHeight; }

*/
            //finally affectations
            this.scale.x    = newScale;
            this.scale.y    = newScale;
            this.position.x = newPosX;
            this.position.y = newPosY;

        },

        doMove: function(relativeX, relativeY) {
            if(this.lastX && this.lastY) {
              var deltaX = relativeX - this.lastX;
              var deltaY = relativeY - this.lastY;
              var currentWidth = (this.imgTexture.width * this.scale.x);
              var currentHeight = (this.imgTexture.height * this.scale.y);

              this.position.x += deltaX;
              this.position.y += deltaY;

            }

            this.lastX = relativeX;
            this.lastY = relativeY;
        },

        setEventListeners: function() {
            // touch
            window.addEventListener('touchstart', function(e) {
            	console.log("touchstart");
                this.lastX          = null;
                this.lastY          = null;
                this.lastZoomScale  = null;
            }.bind(this));

            window.addEventListener('touchmove', function(e) {
            	console.log("touchmove");
                e.preventDefault();
                
                if(e.targetTouches.length == 2) { //pinch
		    var relativeX = e.targetTouches[0].pageX - this.canvas.getBoundingClientRect().left;
                    var relativeY = e.targetTouches[0].pageY - this.canvas.getBoundingClientRect().top;
                    this.doZoom(this.gesturePinchZoom(e),relativeX, relativeY);
                }
                else if(e.targetTouches.length == 1) {
                    var relativeX = e.targetTouches[0].pageX - this.canvas.getBoundingClientRect().left;
                    var relativeY = e.targetTouches[0].pageY - this.canvas.getBoundingClientRect().top;                
                    this.doMove(relativeX, relativeY);
                }
            }.bind(this));

            if(this.desktop) {
                // keyboard+mouse
                window.addEventListener('keyup', function(e) {
                	console.log("keyup");
                    if(e.keyCode == 187 || e.keyCode == 61) { //+
                        this.doZoom(5);
                    }
                    else if(e.keyCode == 54) {//-
                        this.doZoom(-5);
                    }
                }.bind(this));

                window.addEventListener('mousedown', function(e) {
                console.log("mousedown");
                    this.mdown = true;
                    this.lastX = null;
                    this.lastY = null;
                }.bind(this));

                window.addEventListener('mouseup', function(e) {
                console.log("mouseup");
                    this.mdown = false;
                }.bind(this));

                window.addEventListener('mousemove', function(e) {
                console.log("mousemove");
                    var relativeX = e.pageX - this.canvas.getBoundingClientRect().left;
                    var relativeY = e.pageY - this.canvas.getBoundingClientRect().top;

                    if(e.target == this.canvas && this.mdown) {
                        this.doMove(relativeX, relativeY);
                    }

                    if(relativeX <= 0 || relativeX >= this.canvas.clientWidth || relativeY <= 0 || relativeY >= this.canvas.clientHeight) {
                        this.mdown = false;
                    }
                }.bind(this));
            }
        },

        checkRequestAnimationFrame: function() {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
                window.cancelAnimationFrame = 
                  window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
            }

            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                      timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }

            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
            }
        }
    };

    root.ImgTouchCanvas = ImgTouchCanvas;
    
    
}).call(this);


//=============================================================================
// LOAD VIDEO AND SHARE IT TO OTHER CLIENTS
//=============================================================================
function loadVideoTiledDisplay(windowId, url, config_finished) {
    var video = document.createElement('video');
    video.id = "video" + windowId;
    video.style.display = "none";
    video.src = url;
    video.autoplay = false;
    video.loop = true;
    video.muted = false;
    //getWindow(windowId).appendChild(video);
    $('body').append(video);
    console.log(video);
    console.log(infos.position);
    video.addEventListener('loadedmetadata', function () {
        //var canvas = createCanvas(windowId, "VIDEO", this.videoWidth, this.videoHeight);
       var data = { "masterPosition": infos.position, "duration": video.duration, "currentTime": video.currentTime, "paused": video.paused };
       var canvas = createCanvas(windowId, "VIDEO", 400, 300,"video",true, true, data);
       var ctx = canvas.getContext('2d');
       ctx.drawImage(this, 0, 0, this.videoWidth, this.videoHeight);
        shareMediaDisplay(windowId, "video", "VIDEO", false, data);
        shareImage(windowId, canvas.toDataURL("image/jpeg"));
        var width = $('div.display').width();
        var height = $('div.display').height();
        shareWindowPosition(windowId, infos.position, 25, 25, width, height);
    });
}


function loadInputFile(div) {
    var fileInput = document.getElementById('video-input');
    var input = document.createElement('input');
    input.type = "file";
    input.className = "upload";
}

//=============================================================================
// LOAD PDF AND SHARE IT TO OTHER CLIENTS
//=============================================================================
function loadPdf(windowId, url, config_finished) {
    PDFJS.getDocument(url).then(function (pdf) {
        //PDFJS.disableWorker = true;
        var data = { "masterPosition":infos.position, "pdf": pdf, "currentPosition": 1, "total": pdf.numPages};
        createCanvas(windowId, "PDF", 400, 300, "pdf", true, true, data);
        //We send data to clients without the pdf object
        data = { "masterPosition": infos.position, "currentPosition": 1, "total": pdf.numPages };
        shareMediaDisplay(windowId, "pdf", "PDF", false, data);
        var width = $('div.display').width();
        var height = $('div.display').height();
        shareWindowPosition(windowId, infos.position, 25, 25, width, height);
        //Load the first page
        loadPdfPage(windowId, 1);
    });
}

//=============================================================================
// DISPLAY A PDF PAGE INTO CANVAS
//=============================================================================
function loadPdfPage(windowId, index) {
    var canvas = document.getElementById("canvas" + windowId);
    var data = windowList[windowId].data;
    data.pdf.getPage(index).then(function (page) {
        var scale = 1.5;
        var viewport = page.getViewport(scale);
        
        //
        // Prepare canvas using PDF page dimensions
        //
        var backing_canvas = document.getElementById("backing_" + canvas.id);
        backing_canvas.height = viewport.height;
        backing_canvas.width = viewport.width;
        var backing_context = backing_canvas.getContext('2d');
        
        //
        // Render PDF page into canvas context
        //
        var renderContext = {
            canvasContext: backing_context,
            viewport: viewport
        };
        page.render(renderContext).promise.then(function () {
            //var context = canvas.getContext('2d');
            //context.drawImage(backing_canvas, 0, 0, canvas.width, canvas.height);
            shareImage(windowId, backing_canvas.toDataURL("image/jpeg"));
        });;
    });
    data.currentPosition = index;
}


function loadSharedWindow(windowId, config_finished) {
    var canvas = createCanvas(windowId, "SHARED MAIN", 400, 300, "shared", true, true);
    	var rows;

	if (infos.app == "Picture"){
		rows = parseInt(document.getElementById("nbLignesPicture").value);
	}else if ( infos.app == "Video"){
		rows = parseInt(document.getElementById("nbLignesVideo").value);
	}else if(infos.app == "PDF"){
            	rows = parseInt(document.getElementById("nbLignesPDF").value);
        }else if(infos.app == "SharedWindow"){
            	rows = parseInt(document.getElementById("nbLignesSharedWindow").value);
        }

    //if (infos.position.j <= ((rows / 2) - 1)) {
    //    if (!windowList[windowId].isRotated) {
    //        windowRotation(windowId, 180);
    //    }
    //}
    shareWindow(windowId, "SHARED TEST", "shared");
    var width = $('div.display').width();
    var height = $('div.display').height();
    shareWindowPosition(windowId, infos.position, 25, 25, width, height);
}
