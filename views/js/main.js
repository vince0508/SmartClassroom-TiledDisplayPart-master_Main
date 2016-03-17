


//TRUE IF DISPLAYING FULLSCREEN 
var fullWindowState;
//Save datas of the window in a List (display state, media data etc...)
var windowList = new Object();
//True if the body is rotated to 180 degree
var isRotated = false;
//True if the user has not selected the header of the window
var notHead = false;
//=================================================================================
// MANAGE DISPLAY DIV : (Rotation etc...)
//=================================================================================

/**
 * Do a rotation to 180 degree of the body
 */
function rotateDisplayDiv() {
    var display = document.body;
    if (!isRotated) {
        display.style.webkitTransform = 'rotate(' + 180 + 'deg)';
        isRotated = true;
    }
    else {
        display.style.webkitTransform = 'rotate(' + 0 + 'deg)';
        isRotated = false;
    }
   
}





//=================================================================================
// CREATE A NEW HTML/CSS/JQUERY WINDOW ACCORDING TO AN ID AND MANAGE DRAG AND DROP
//=================================================================================

/**
 * Create a HTML window and set drag and drop, resize and rotation 
 * 
 * @param windowId : the unique ID of the window 
 * @param title : the title of the window that will be set in the header
 * @param width : the width of the window
 * @param height : the height of the window
 * @param type : the type of the media or app that will be set in the window
 * @param isShared : if the window has to share its position, angle, size... to others clients
 */
function addWindow(windowId, title, width, height, type, isShared) {
    //CREATE PRINCIPAL WINDOW DIV
    var windowDiv = document.createElement('div');
    windowDiv.className = 'window pepo';
    windowDiv.id = 'window' + windowId;
    windowDiv.style.width = width + "px";
    
    //CREATE WINDOW HEADER
    var windowHeader = document.createElement('header');
    windowHeader.className = 'window-header';
    windowHeader.id = 'window-header' + windowId;
    
    //CREATE FULLSCREEN ICON
    var iconFullscreen = document.createElement('label');
    iconFullscreen.className = 'icon-fullscreen';
    iconFullscreen.innerHTML = "[  ]";
    
    //CREATE TILED DISPLAY ICON
    var iconTiled = document.createElement('label');
    iconTiled.className = 'icon-tiled';
    iconTiled.innerHTML = "T";
    
    //CREATE TILED DISPLAY ICON
    var iconRotation = document.createElement('label');
    iconRotation.className = 'icon-rotation';
    iconRotation.innerHTML = "R";
    
    var iconResize = document.createElement('label');
    iconResize.className = 'icon-resize';
    iconResize.innerHTML = "S";
    
    //CREATE CLOSE ICON
    var iconClose = document.createElement('label');
    iconClose.className = 'icon-close';
    iconClose.innerHTML = "x";
    //CREATE HEADER TITLE
    var WindowTitle = document.createElement('div');
    WindowTitle.className = 'title-header';
    WindowTitle.innerHTML = title;
    
    //CREATE DIV FOR ADDING ICONS
    var toolbar = document.createElement('div');
    toolbar.className = 'toolbar-header';
    toolbar.appendChild(iconFullscreen);
    toolbar.appendChild(iconTiled);
    
    toolbar.appendChild(iconClose);
    toolbar.appendChild(iconRotation);
    toolbar.appendChild(iconResize);
    
    //ADD TOOLBAR AND TITLE INTO WINDOW HEADER
    windowHeader.appendChild(toolbar);
    windowHeader.appendChild(WindowTitle);
    
    //CREATE WINDOW DIV FOR DISPLAYING
    var windowFormDiv = document.createElement('div');
    windowFormDiv.className = 'window-form';
    windowFormDiv.id = 'windowForm' + windowId;
    //windowFormDiv.innerHTML = "Content";
    //windowFormDiv.style.height = '100% - 50px';
    //windowFormDiv.style.height = height + 'px';
    
    //ADD HEADER AND DISPLAY DIV INTO WINDOW
    windowDiv.appendChild(windowHeader);
    windowDiv.appendChild(windowFormDiv);
    
    // ADD WINDOW INTO AREA
    var display = document.getElementsByClassName("display")[0];
    display.appendChild(windowDiv);
    
    //MANAGE DRAG AND DROP FOR MOUSE
    $("#" + windowHeader.id).on("mousedown touchstart", function (e) {
        var orientation = 'normal'
        var rows = 2;
        if (infos.position.j <= ((rows / 2) - 1)) {
            orientation = 'reversed'
        }
        //The max coordinate x and y of all the tables
        var maxPosition;
        if (isShared) {
            //In this configuration, there is two lines and two columns
            var rows = 2;
            var cols = 2;
            maxPosition = { "i": (rows - 1), "j": (cols - 1) };
        }
        else {
            //With none value, the window cannot go outside the div with className = display
            maxPosition = 'none';
            orientation = 'normal';
        }
        
        if (windowList[windowId].modificationType != "dragging") return;
        var isRotating = false;
        $("#" + windowDiv.id).pep({

            constrainTo: 'parent',
            velocityMultiplier: 5,
            tablePosition: infos.position,
            maxPosition: maxPosition,
            orientation: orientation,
            rotation : isRotated,
            start: function (ev, obj) {
                if (notHead) {
                    $.pep.unbind($("#" + windowDiv.id));
                }
                //obj.$el.css({ background : 'red'});
            },
            drag: function (ev, obj) {
                var width = $('div.display').width();
                var height = $('div.display').height();
                if (isShared) {
                    shareWindowPosition(windowId, infos.position, obj.$el.context.offsetTop, obj.$el.context.offsetLeft, width, height);
                }
            },
            
            easing: function (ev, obj) {
                var width = $('div.display').width();
                var height = $('div.display').height();
                if (isShared) {
                    shareWindowPosition(windowId, infos.position, obj.$el.context.offsetTop, obj.$el.context.offsetLeft, width, height);
                }
            },
            stop: function (ev, obj) {
                var vel = obj.velocity();                
                if (vel.x > 1500 || vel.y > 1500 || vel.x < -1500 || vel.y < -1500) {
                    console.log("TABLE SUIVANTE");
                    //obj.$el.css({ background : 'green'}); 
                }
                $.pep.unbind($("#" + windowDiv.id));
            }
        });
    });
    //The window is rotated to 0 like the beginning - Mouse Event
    $("#" + windowHeader.id).dblclick(function (event) {
        var windowId = windowDiv.id.split('window')[1];
       if (!isShared) {
			updateWindowAngle(windowId, true,-windowList[windowId].angle);
		}
		else{
			shareWindowAngle(windowId, true,-windowList[windowId].angle);
		}
        
    });
    //The window is rotated to 0 like the beginning - Touch Event
    jester(windowHeader).doubletap(function (event) {
        var windowId = windowDiv.id.split('window')[1];
		if (!isShared) {
			updateWindowAngle(windowId, true,-windowList[windowId].angle);
		}
		else{
			shareWindowAngle(windowId, true,-windowList[windowId].angle);
		}
        
    });
    
    //The user can resize the window with the edges
    interact('#' + windowDiv.id)
    .resizable({
        edges: { left: true, right: true, bottom: true, top: true }
    })
    .on('resizemove', function (event) {
        if (windowList[windowId].modificationType != "resize") return;
        var rect = { "height" : event.rect.height, "width": event.rect.width }
        var delta = { "left" : event.deltaRect.left, "top": event.deltaRect.top }
        var e = { "rect" : rect, "deltaRect": delta }
        if (isShared) {
            //Resize all windows with ID windowId
            shareWindowSize(windowId, e);
        }
        else {
            //Resize this window
            resizeWindow(windowId, e);
        }
    });
    
    //The user can rotate the window with two fingers
    interact('#' + windowDiv.id).gesturable({
        onmove: function (event) {
            if (windowList[windowId].modificationType != "rotation") return;
            if (isShared) {
                //Rotate all windows with ID windowId
                shareWindowAngle(windowId, false, event.da);
            }
            else {
                //Rotate this window
                updateWindowAngle(windowId, false, event.da);
            }
        }
    });
    return windowDiv;
}

//Get the HTML window
function getWindow(windowId) {
    return document.getElementById('window' + windowId);
}

//=============================================================================
// CREATE A AUDIOPLAYER TO PLAY ALL STREAMED AUDIO
//=============================================================================

//Initialize an audio link for the HTML Flowplayer (USELESS)
function initializeAudioLink(id) {
    var audioLink = document.createElement('a');
    //audioLink.href = "/audio" + id;
    audioLink.id = "audioPlayer";
    audioLink.style.visibility = "hidden";
    audioLink.style.width = "2px";
    audioLink.style.height = "2px";
    $('body').append(audioLink);
}

//Create the flowplayer bound to the url /audio + id
/**
 * Create a HTML Canvas in the window according to a specific media or app 
 * 
 * @param id : the id of the client (1,2,3 or 4) 
 * @param windowId : the unique ID of the window 
 */
function initializeAudioplayer(id, windowId) {
    console.log("AUDIOPLAY LAUNCHING" + id);
    var audioplayer = flowplayer("audioPlayer", "/includes/flowplayer.swf", {
        clip: {
            // baseUrl for both parent and instream clips
            url: "/audio" + id,
            autoBuffering: true,
            autoPlay: false,
            onBegin: function () {
                ReadyToPlayAudio(windowId);
            }
        }
    });
    setAudioPlayer(audioplayer);
}

//=============================================================================
// CREATE CANVAS INTO HTML WINDOW FOR DISPLAYING MEDIA (VIDEO, PDF, APPS etc..)
//=============================================================================

/**
 * Create a HTML Canvas in the window according to a specific media or app 
 * 
 * @param windowId : the unique ID of the window 
 * @param title : the title of the window that will be set in the header
 * @param width : the width of the window
 * @param height : the height of the window
 * @param type : the type of the media or app that will be set in the window
 * @param isMaster : true if this client is the master of the object
 * @param isShared : if the window has to share its position, angle, size... to others clients
 * @param data : some useful data of media or app (like duration of the video etc...) 
 */
function createCanvas(windowId, title, width, height, type, isMaster, isShared, data) {
    var canvas = document.createElement('canvas');
    canvas.id = 'canvas' + windowId;
    canvas.style.position = "relative";
    canvas.style.display = "block";
    canvas.style.width = "100%";
    //canvas.style.height = "100%";
    canvas.width = width;
    canvas.height = height;
    var backing_canvas = document.createElement("canvas");
    backing_canvas.id = "backing_" + canvas.id;
    backing_canvas.style.display = "none";
    
    //var windowDiv = addWindow(windowId, title, width + 10, height + 5, type);
    var windowDiv = addWindow(windowId, title, width, height, type, isShared);
    windowDiv.getElementsByClassName('window-form')[0].appendChild(canvas);
    windowDiv.getElementsByClassName('window-form')[0].appendChild(backing_canvas);
    
    var media = { "modificationType" : "dragging", "offset" : { "x": 0, "y": 0 }, "type": type, "isTiled": false, "isRotated": false, "angle": 0, "isMaster": isMaster, "data": data }
    windowList[windowId] = media;
    
    if (type == "video") {
        var videoControls = createVideoControls(windowId, false, isMaster);
        windowDiv.appendChild(videoControls);
        
        var timeoutIdentifier;
        
        $("#" + videoControls.id).mousemove(function (e) {
            if (timeoutIdentifier) {
                clearTimeout(timeoutIdentifier);
            }
            timeoutIdentifier = setTimeout(function () {
                $("#" + videoControls.id).slideUp(200);
            }, 2500);
        });
        
        $("#" + canvas.id).mousemove(function (e) {
            $("#" + videoControls.id).slideDown(200);
            
            if (timeoutIdentifier) {
                clearTimeout(timeoutIdentifier);
            }
            timeoutIdentifier = setTimeout(function () {
                $("#" + videoControls.id).slideUp(200);
            }, 2500);
        });
    
    }
    else if (type == "pdf") {
        var pdfControls = createPdfControls(windowId, false, isMaster);
        windowDiv.appendChild(pdfControls);
        
        var timeoutIdentifier;
        
        $("#" + pdfControls.id).mousemove(function (e) {
            if (timeoutIdentifier) {
                clearTimeout(timeoutIdentifier);
            }
            timeoutIdentifier = setTimeout(function () {
                $("#" + pdfControls.id).slideUp(200);
            }, 2500);
        });
        
        $("#" + canvas.id).mousemove(function (e) {
            $("#" + pdfControls.id).slideDown(200);
            
            if (timeoutIdentifier) {
                clearTimeout(timeoutIdentifier);
            }
            timeoutIdentifier = setTimeout(function () {
                $("#" + pdfControls.id).slideUp(200);
            }, 2500);
        });
    
    }
    return canvas;
};

function reloadCanvas(canvas) {
    var backing_canvas = document.getElementById("backing_" + canvas.id);
    var draw = canvas.getContext('2d');
    draw.drawImage(backing_canvas, 0, 0, canvas.width, canvas.height);
}


//=============================================================================
// CREATE A CONTROLS BAR FOR CANVAS DISPLAYING VIDEOS
//=============================================================================

/**
 * Create a HTML Video Controls in the window
 * 
 * @param windowId : the unique ID of the window 
 * @param isFullscreen : true if the window is Fullscreen
 * @param isMaster : true if this client is the master of the object
 */
function createVideoControls(windowId, isFullscreen, isMaster) {
    if (isFullscreen) {
        var ID = 0;
    }
    else {
        var ID = windowId;
    }
    var toolbar = document.createElement('div');
    toolbar.className = 'media-controls transparent';
    toolbar.id = "media-controls" + ID;
    toolbar.style.display = "none";
    
    var canvas = document.getElementById("canvas" + windowId);
    if (isMaster) {
        var video = document.getElementById("video" + windowId);
    }
    else {
        var video = windowList[windowId].data;
    }
    
    var current_time = document.createElement('div');
    current_time.className = 'video-currentTime';
    current_time.id = "video-currentTime" + ID;
    current_time.innerHTML = "0:00";
    
    var play = document.createElement('div');
    play.className = 'play-video';
    play.id = 'play-video' + ID;
    if (video.paused) {
        play.innerHTML = "PLAY";
    }
    else {
        play.innerHTML = "PAUSE";
    }
    
    var duration = document.createElement('div');
    duration.className = 'video-duration';
    duration.id = 'video-duration' + ID;
    duration.innerHTML = Math.round(video.duration / 60) + ":" + (Math.round(video.duration) % 60).toString().replace(/^(\d)$/, '0$1');
    
    var seekBar = document.createElement('input');
    seekBar.type = "range";
    seekBar.className = ' video-slider fill fill--1';
    seekBar.id = 'video-slider' + ID;
    seekBar.value = ((100 * video.currentTime) / video.duration);
    seekBar.step = "0.1";
    seekBar.max = "100";
    styles.push('');
    updatePrograssFillBar(seekBar, ID);
    
    // Case isFullscreen : The event listener will be set outside this function to remove it easily
    if (isMaster && !isFullscreen) {
        video.addEventListener("timeupdate", function () {
            var data = { "duration": video.duration, "currentTime": video.currentTime };
            askRemoteMediaControl(windowId, "video", "currentTime", data, "except-host");
            seekBar.value = ((100 * video.currentTime) / video.duration);
            document.getElementById('video-currentTime' + ID).innerHTML = Math.round(video.currentTime / 60) + ":" + (Math.round(video.currentTime) % 60).toString().replace(/^(\d)$/, '0$1');
            updatePrograssFillBar(seekBar, ID);
        }, false);
    }
    // Case isFullscreen : The event listener will be set outside this function to remove it easily
    else if (!isFullscreen) {
        canvas.addEventListener("dataupdate", function () {
            seekBar.value = ((100 * video.currentTime) / video.duration);
            document.getElementById('video-currentTime' + ID).innerHTML = Math.round(video.currentTime / 60) + ":" + (Math.round(video.currentTime) % 60).toString().replace(/^(\d)$/, '0$1');
            updatePrograssFillBar(seekBar, ID);
        }, false);
    }
    
    seekBar.addEventListener('input', function () {
        if (isMaster) {
            video.currentTime = (this.value * video.duration) / 100;
            //document.getElementById('video-currentTime' + ID).innerHTML = (Math.round(video.currentTime) % 60) + ":" + Math.round(video.currentTime / 60).toString().replace(/^(\d)$/, '0$1');
        }
        else {
            askRemoteMediaControl(windowId, "video", "seekbar", this.value, "master");
        }
        updatePrograssFillBar(seekBar, ID);
    }, false);
    
    play.addEventListener('mousedown', function () {
        if (isMaster) {
            if (video.paused) {
                this.innerHTML = "PAUSE";
                askRemoteMediaControl(windowId, "video", "play", "event", "except-host");
                video.play();
            }
            else {
                this.innerHTML = "PLAY";
                askRemoteMediaControl(windowId, "video", "pause", "event", "except-host");
                video.pause();
            }
        }
        else {
            if (video.paused) {
                this.innerHTML = "PAUSE";
                video.paused = false;
                askRemoteMediaControl(windowId, "video", "play", "", "master");
            }
            else {
                this.innerHTML = "PLAY";
                video.paused = true;
                askRemoteMediaControl(windowId, "video", "pause", "", "master");
            }
        }
    }, false);
    
    toolbar.appendChild(seekBar);
    toolbar.appendChild(play);
    toolbar.appendChild(current_time);
    toolbar.appendChild(duration);
    return toolbar;
}


//=============================================================================
// CREATE A CONTROLS BAR FOR CANVAS DISPLAYING PDF
//=============================================================================

/**
 * Create a HTML Pdf Controls in the window
 * 
 * @param windowId : the unique ID of the window 
 * @param isFullscreen : true if the window is Fullscreen
 * @param isMaster : true if this client is the master of the object
 */
function createPdfControls(windowId, isFullscreen, isMaster) {
    if (isFullscreen) {
        var ID = 0;
    }
    else {
        var ID = windowId;
    }
    var toolbar = document.createElement('div');
    toolbar.className = 'media-controls transparent';
    toolbar.id = "media-controls" + ID;
    toolbar.style.display = "none";
    
    var canvas = document.getElementById("canvas" + windowId);
    var data = windowList[windowId].data;
    
    var previous = document.createElement('div');
    previous.className = 'previous-pdf';
    previous.id = 'previous-pdf' + ID;
    previous.innerHTML = "PREVIOUS";
    
    var next = document.createElement('div');
    next.className = 'next-pdf';
    next.id = 'next-pdf' + ID;
    next.innerHTML = "NEXT";
    
    var seekBar = document.createElement('input');
    seekBar.type = "range";
    seekBar.className = ' video-slider fill fill--1';
    seekBar.id = 'video-slider' + ID;
    seekBar.value = data.currentPosition - 1;
    seekBar.step = "1";
    seekBar.max = data.total - 1;
    styles.push('');
    updatePrograssFillBar(seekBar, ID);
    
    seekBar.addEventListener('input', function () {
        if (isMaster) {
            loadPdfPage(windowId, parseInt(this.value) + 1);
            askRemoteMediaControl(windowId, "pdf", "seekbar-event", this.value, "except-host");
        }
        else {
            askRemoteMediaControl(windowId, "pdf", "seekbar", this.value, "master");
        }
        updatePrograssFillBar(seekBar, ID);
    }, false);
    
    previous.addEventListener('mousedown', function () {
        if (isMaster) {
            if (data.currentPosition > 1) {
                askRemoteMediaControl(windowId, "pdf", "seekbar-event", seekBar.value, "except-host");
                loadPdfPage(windowId, data.currentPosition - 1);
                seekBar.value--;
            }
        }
        else {
            if (data.currentPosition > 1) {
                askRemoteMediaControl(windowId, "pdf", "previous", "", "master");
            }
        }
        updatePrograssFillBar(seekBar, ID);
    }, false);
    
    next.addEventListener('mousedown', function () {
        if (isMaster) {
            if (data.currentPosition < data.total) {
                seekBar.value++;
                askRemoteMediaControl(windowId, "pdf", "seekbar-event", seekBar.value, "except-host");
                loadPdfPage(windowId, data.currentPosition + 1);
                updatePrograssFillBar(seekBar, ID);
            }
        }
        else {
            askRemoteMediaControl(windowId, "pdf", "next", "", "master");
        }
    }, false);
    
    toolbar.appendChild(seekBar);
    toolbar.appendChild(previous);
    toolbar.appendChild(next);
    //toolbar.appendChild(duration);
    return toolbar;
}

//=============================================================================
// MANAGE FULLSCREEN
//=============================================================================

/**
 * Display the data of the canvas to the fullscreen canvas
 * 
 * @param canvas : the canvas which has the copied to the fullscreen canvas
 */
function fullWindow(canvas) {
    
    if (!fullWindowState) {
        fullWindowState = true;
        fullscreenCanvasRotated = false;
        var windowId = canvas.id.split('canvas')[1];
        var isMaster = windowList[windowId].isMaster;
        
        // Canvas goes full window
        var canvasFullscreen = document.getElementById('canvasFullscreen');
        var backing_canvas = document.getElementById('backing_' + canvas.id);
        //var divFullscreen = document.getElementById('divFullscreen');")
        launchFullScreen(document.documentElement);
        
        saveLeft = canvas.parentElement.parentElement.offsetLeft;
        saveTop = canvas.parentElement.parentElement.offsetTop;
        saveWidth = canvas.width;
        saveHeight = canvas.height;
        saveDisplay = canvas.parentElement.parentElement.style.display;
        
        canvasFullscreen.width = window.innerWidth;
        canvasFullscreen.height = window.innerHeight;
        canvasFullscreen.style.display = "inline";
        
        canvas.parentElement.parentElement.style.display = "none";
        //canvas.width = window.innerWidth;
        //canvas.height = window.innerHeight;
        
        if (windowList[windowId].type == "video") {
            var videoControls = createVideoControls(windowId, true, isMaster);
            videoControls.style.marginTop = "-64px";
            
            var listenerVideoTimeUpdate = function (e) {
                var data = { "duration": this.duration, "currentTime": this.currentTime };
                askRemoteMediaControl(windowId, "video", "currentTime", data, "except-host");
                var seekBar = document.getElementById('video-slider0');
                seekBar.value = ((100 * this.currentTime) / this.duration);
                document.getElementById('video-currentTime0').innerHTML = Math.round(this.currentTime / 60) + ":" + (Math.round(this.currentTime) % 60).toString().replace(/^(\d)$/, '0$1');
                updatePrograssFillBar(seekBar, 0);
            }
            
            var listenerCanvasDataUpdate = function (e) {
                var video = windowList[windowId].data;
                var seekBar = document.getElementById('video-slider0');
                seekBar.value = ((100 * video.currentTime) / video.duration);
                document.getElementById('video-currentTime0').innerHTML = Math.round(video.currentTime / 60) + ":" + (Math.round(video.currentTime) % 60).toString().replace(/^(\d)$/, '0$1');
                updatePrograssFillBar(seekBar, 0);
            }
            
            if (isMaster) {
                var video = document.getElementById("video" + windowId);
                video.addEventListener("timeupdate", listenerVideoTimeUpdate, false);
            }
            else {
                canvas.addEventListener("dataupdate", listenerCanvasDataUpdate, false);
            }
            var timeoutIdentifier;
            $("#" + videoControls.id).mousemove(function (e) {
                if (timeoutIdentifier) {
                    clearTimeout(timeoutIdentifier);
                }
                timeoutIdentifier = setTimeout(function () {
                    $("#" + videoControls.id).slideUp(200);
                }, 2500);
            });
            
            var fullscreenControlListener = function (e) {
                $("#" + videoControls.id).slideDown(200);
                
                if (timeoutIdentifier) {
                    clearTimeout(timeoutIdentifier);
                }
                timeoutIdentifier = setTimeout(function () {
                    $("#" + videoControls.id).slideUp(200);
                }, 2500);
            }
            
            canvasFullscreen.addEventListener("mousemove", fullscreenControlListener, false);
            $("body").append(videoControls);
            updateCanvas(windowId, backing_canvas.toDataURL("image/jpeg"));
        }
        else if (windowList[windowId].type == "pdf") {
            var pdfControls = createPdfControls(windowId, true, isMaster);
            pdfControls.style.marginTop = "-64px";
            
            var timeoutIdentifier;
            $("#" + pdfControls.id).mousemove(function (e) {
                if (timeoutIdentifier) {
                    clearTimeout(timeoutIdentifier);
                }
                timeoutIdentifier = setTimeout(function () {
                    $("#" + pdfControls.id).slideUp(200);
                }, 2500);
            });
            
            var fullscreenControlListener = function (e) {
                $("#" + pdfControls.id).slideDown(200);
                if (timeoutIdentifier) {
                    clearTimeout(timeoutIdentifier);
                }
                timeoutIdentifier = setTimeout(function () {
                    $("#" + pdfControls.id).slideUp(200);
                }, 2500);
            }
            canvasFullscreen.addEventListener("mousemove", fullscreenControlListener, false);
            $("body").append(pdfControls);
            updateCanvas(windowId, backing_canvas.toDataURL("image/jpeg"));
        }else if (windowList[windowId].type == "gameSnake") {
//JOE MODIF
		console.log("fullWindow pour gameSnake");
		}
        else {
            
            updateCanvas(windowId, backing_canvas.toDataURL("image/jpeg"));
        }
		
		var timeoutIdentifier;
		var fullscreenControlListener = function (e) {
			$("#fullscreen-controls-id").slideDown(200);
			
			if (timeoutIdentifier) {
				clearTimeout(timeoutIdentifier);
			}
			timeoutIdentifier = setTimeout(function () {
				$("#fullscreen-controls-id").slideUp(200);
			}, 2500);
		}
		canvasFullscreen.addEventListener("mousemove", fullscreenControlListener, false);
        
        var fullscreenButton = document.getElementById('close-fullscreen');
        var draw = canvasFullscreen.getContext('2d');
        
        
        
        var resize = function (e) {
            //canvas.width = window.innerWidth;
            //canvas.height = window.innerHeight;
            canvasFullscreen.width = window.innerWidth;
            canvasFullscreen.height = window.innerHeight;
            draw.drawImage(backing_canvas, 0, 0, canvasFullscreen.width, canvasFullscreen.height);
        }
        window.addEventListener('resize', resize, false);
        
        var listener = function (e) {
            if (windowList[windowId].isRotated && !fullscreenCanvasRotated) {
                draw.translate(canvasFullscreen.width, canvasFullscreen.height);
                draw.rotate(180 * (Math.PI / 180));
                fullscreenCanvasRotated = true;
            }
            draw.drawImage(backing_canvas, 0, 0, canvasFullscreen.width, canvasFullscreen.height);
        }
        
        var endFullscreen = function (e) {
            cancelFullScreen(document.documentElement);
            //canvas.width = saveWidth;
            //canvas.height = saveHeight;
            canvas.parentElement.parentElement.style.top = saveTop + "px";
            canvas.parentElement.parentElement.style.left = saveLeft + "px";
            canvas.parentElement.parentElement.style.display = saveDisplay;
            reloadCanvas(canvas)
            
            
            canvasFullscreen.style.display = "none";
            fullWindowState = false;
            $("#fullscreen-controls-id").slideUp(1);
            
            if (windowList[windowId].type == "video") {
                document.body.removeChild(videoControls);
                if (isMaster) {
                    video.removeEventListener("timeupdate", listenerVideoTimeUpdate, false);
                    //To send a new picture to display it not tiled
                    var canvas_temp = document.createElement("canvas");
                    canvas_temp.width = video.videoWidth;
                    canvas_temp.height = video.videoHeight;
                    $(canvas_temp).css("display", "none");
                    var context_temp = canvas_temp.getContext('2d');
                    context_temp.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    shareImage(windowId, canvas_temp.toDataURL("image/jpeg"));
                }
                else {
                    canvas.removeEventListener("dataupdate", listenerCanvasDataUpdate, false);
                }
            }
            else if (windowList[windowId].type == "pdf") {
                document.body.removeChild(pdfControls);
                if (isMaster) {
                    loadPdfPage(windowId, windowList[windowId].data.currentPosition);
                }
               
            }
            else if (windowList[windowId].type == "picture") {
                if (isMaster) {
                    var img = windowList[windowId].data.image;
                    backing_canvas.width = img.width;
                    backing_canvas.height = img.height;
                    var context_backing = backing_canvas.getContext('2d');
                    context_backing.drawImage(img, 0, 0, img.width, img.height);
                    shareImage(windowId, backing_canvas.toDataURL("image/jpeg"));
                }
            }else if (windowList[windowId].type == "gameSnake"){
// JOE MODIF 
			console.log("endFullscreen pour gameSnake");	
			}
            canvasFullscreen.removeEventListener("mousemove", fullscreenControlListener, false);
            fullscreenButton.removeEventListener("mousedown", askEndFullscreen, false);
            canvas.removeEventListener("endfullscreen", endFullscreen, false);
            canvas.removeEventListener("draw", listener, false);
        }
        var askEndFullscreen = function (e) {
            askRemoteMediaControl(windowId, "all", "endfullscreen", "", "all");
        }
        canvas.addEventListener('draw', listener, false);
        canvas.addEventListener('endfullscreen', endFullscreen , false)
        fullscreenButton.addEventListener('mousedown', askEndFullscreen , false);
    }
}

function launchFullScreen(element) {
    if (element.requestFullscreen) { element.requestFullscreen(); }
    else if (element.mozRequestFullScreen) { element.mozRequestFullScreen(); }
    else if (element.webkitRequestFullscreen) { element.webkitRequestFullscreen(); }
    else if (element.msRequestFullscreen) { element.msRequestFullscreen(); }
}

function cancelFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

/**
 * Create a HTML Canvas that has to be displayed fullscreen
 */
function createFullscreenCanvas() {
    var canvasFullscreen = document.createElement('canvas');
    canvasFullscreen.className = "canvasFullWindow";
    canvasFullscreen.id = "canvasFullscreen";
    canvasFullscreen.style.display = "none";
    //canvasFullscreen.style.zIndex = "1";  
    $("body").append(canvasFullscreen);
   
}


//=============================================================================
// ALL EVENTS LISTENER
//=============================================================================

function initializeEventListener() {
    $(".load-picture").mousedown(function (e) {
        var inputFile = document.getElementById('input-picture');
        var fileUrl = window.URL.createObjectURL(inputFile.files[0]);
        if (fileUrl) {
            askServerLoadPicture(fileUrl);
        }
    });
    
    $(".load-tiled-display").mousedown(function (e) {
        var inputFile = document.getElementById('input-video-tiled-display');
        var fileUrl = window.URL.createObjectURL(inputFile.files[0]);
        if (fileUrl) {
            askServerLoadVideoTiledDisplay(fileUrl);
        }
    });
    
    $(".load-pdf").mousedown(function (e) {
        var inputFile = document.getElementById('input-pdf');
        var fileUrl = window.URL.createObjectURL(inputFile.files[0]);
        //if (fileUrl) {
            askServerLoadPdf(fileUrl);
        //}
    });
    
    $(".load-shared-window").mousedown(function (e) {
        askServerLoadSharedWindow();
    });
    
    $(".load-ping-pong").mousedown(function (e) {
        askServerLoadPingPong();
    });
    
    $(".load-snake").mousedown(function (e) {
        askServerLoadSnake();
    });
    
    $(".load-drawing").mousedown(function (e) {
        askServerLoadDrawing();
    });
    
    $(".rotate-display-div").mousedown(function (e) {
        rotateDisplayDiv();
    });
    
    $(".display").on("touchstart click", "label.icon-close", function (e) {
        e.preventDefault();
        //e.currentTarget.parentElement.parentElement.parentElement.parentElement.removeChild(e.currentTarget.parentElement.parentElement.parentElement);
        
        var windowId = e.currentTarget.parentElement.parentElement.parentElement.id.split('window')[1];
		if (windowList[windowId].type != "interactif") {
			askCloseWindow(windowId);
		}
		else{
			closeWindow(windowId);
		}
    });
    
    $(".display").on("touchstart mousedown", "label.icon-fullscreen", function (e) {
        e.preventDefault();
        var windowId = e.currentTarget.parentElement.parentElement.parentElement.id.split('window')[1];
        var canvas = document.getElementById("canvas" + windowId);
        
        if (windowList[windowId].type == "game") {
            windowList[windowId].data.game.launchFullScreen();
        }else if (windowList[windowId].type == "gameSnake"){
			console.log("windowList[windowId].data.game "+windowList[windowId].data.game);
			console.log("windowId: "+windowId);	
			windowList[windowId].data.game.launchFullScreen();
		}
        else {
            fullWindow(canvas);
        }
    });
    
    $(".display").on("touchstart mousedown", "label.icon-tiled", function (e) {
        e.preventDefault();
        var windowId = e.currentTarget.parentElement.parentElement.parentElement.id.split('window')[1];
        if (windowList[windowId].type == "game") {
            askRemoteGameControl(windowId, "ping-pong", "tiled-display", "", "all");
        }else if (windowList[windowId].type == "gameSnake") {
            askRemoteGameControl(windowId, "snake", "tiled-display", "", "all");
        }
        else if (windowList[windowId].type != "interactif"){
            askRemoteMediaControl(windowId, "all", "tiled-display", infos.position, "all");
        }
    });
    
    $(".display").on("touchstart mousedown", "label.icon-rotation", function (event) {
        event.preventDefault();
        var windowId = event.currentTarget.parentElement.parentElement.parentElement.id.split('window')[1];
        if (windowList[windowId].modificationType == "rotation") {
            windowList[windowId].modificationType = "dragging";
            this.style.background = '#39D2B4';
            
        }

        else {
            $.pep.unbind($("#" + event.currentTarget.parentElement.parentElement.parentElement.id));
            windowList[windowId].modificationType = "rotation";
            this.style.background = '#FDB813';
            this.parentElement.getElementsByClassName('icon-resize')[0].style.background = '#39D2B4';
        }
    });
    
    $(".display").on("touchstart mousedown", "label.icon-resize", function (event) {
        event.preventDefault();
        var windowId = event.currentTarget.parentElement.parentElement.parentElement.id.split('window')[1];
        if (windowList[windowId].modificationType == "resize") {
            windowList[windowId].modificationType = "dragging";
            this.style.background = '#39D2B4';
            
        }

        else {
            $.pep.unbind($("#" + event.currentTarget.parentElement.parentElement.parentElement.id));
            windowList[windowId].modificationType = "resize";
            this.style.background = '#68217A';
            this.parentElement.getElementsByClassName('icon-rotation')[0].style.background = '#39D2B4';
        }
    });
    
    
    $(".display").on("touchmove", function (e) {
        e.preventDefault();
    });
    
    // action lorsque le label est cliqu\E9
    $(".input-file-trigger").on("mousedown", function (e) {
        $(".input-file").focus();
        return false;
    });
    
    // affiche un retour visuel d\E8s que input:file change
    $(".input-file").on("change", function (e) {
        e.currentTarget.parentElement.getElementsByClassName("file-return").innerHTML = this.value;
    });
};


//=============================================================================
// USEFUL FUNCTIONS
//=============================================================================

function getOffset(el) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}
var s = document.createElement('style'), 
    r = document.querySelectorAll('input[type=range]'), 
    n_r = r.length, 
    styles = [], 
    pp = ['-webkit-slider-runnable-', '-moz-range-'],
    n_pp = pp.length;

updatePrograssFillBar = function (seekBar, id) {
    if (seekBar.classList.contains('fill')) {
        styles[id] = getFillStyle(seekBar);
    }
    else {
        styles[id] = '';
    }
    if (seekBar.classList.contains('tip')) {
        styles[id] += getTipStyle(seekBar);
    }
    s.textContent = styles.join('');
}


manageControlBar = function () {
    document.getElementsByTagName('body')[0].appendChild(s);
}

function formatage(nombre) {
    var zero = "";
    if (nombre < 100) {
        zero = "0";
        if (nombre < 10) {
            zero = "00";
        }
    }
    return zero + nombre;
}

var removeMedia = function () {
    _.each([$video, $audio], function ($media) {
        if (!$media.length) return;
        $media[0].pause();
        $media[0].src = '';
        $media.children('source').prop('src', '');
        $media.remove().length = 0;
    });
};
