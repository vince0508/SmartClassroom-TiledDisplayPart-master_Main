launchSnakeGame = function (windowId, isMaster) {

	console.log("test " + infos.position.i + infos.position.j );
	if((infos.position.i == 0 && infos.position.j == 0) || (infos.position.i == 0 && infos.position.j == 1)){
		//Canvas stuff
			var data = {"masterPosition": infos.position};
				if (isMaster){
					var canvas = createCanvas(windowId, "SNAKE", 400, 300, "gameSnake", isMaster, false, data);	
				}
				else{
					var canvas = createCanvas(windowId, "SNAKE", 400, 300, "gameSnake", isMaster, false, data);
					launchFullScreen(document.documentElement);        
				canvas.style.display = "none";	        
				canvasFullscreen.width = window.innerWidth;
				canvasFullscreen.height = window.innerHeight;
				canvasFullscreen.style.display = "block";
			       	canvas = canvasFullscreen;
			       	windowList[windowId].isTiled = true;
			       	// console.log("windowList[windowId].isTiled: "+windowList[windowId].isTiled);
				}
		    	
		    	var w = canvas.width;
		    	var h = canvas.height;
		    	var ctx = canvas.getContext("2d");

		    	// if (isMaster) {
		     //    	shareMediaDisplay(windowId, "snake", "SNAKE", false, data);
		    	// }
		    	
				/*Inutile car elle permet dupliquer la fenetre avec un autre joueur.
				Dans le snake c'est inutile. 	
				*/

			//Lets save the cell width in a variable for easy control

		var game = {

			cw : 10,
			d : "",
			food : {},
			score :0,
			canvas : canvas,
		    W : canvas.width, // Window's width
		    H : canvas.height, // Window's height
		    nx :0,
		    ny : 0,
		    tail : {},
		    i : 0,
		    onScreen : false,
    fullWindowState:false,
		   saveDisplay: canvas.style.display,
	saveLeft :canvas.parentElement.parentElement.offsetLeft,
        saveTop :canvas.parentElement.parentElement.offsetTop,
	
	
	quitBtn : {
            w: 100,
            h: 50,
            x: this.W - 100,
            y: this.H - 100,
            
            draw: function (canvas,ctx) {
            this.x=canvas.width-100;
            this.y=canvas.height-50;
           
                //var ctx = canvas.getContext("2d");
            
                ctx.strokeStyle = "black";
                ctx.lineWidth = "2";
               ctx.strokeRect(this.x, this.y, this.w, this.h);
                ctx.font = "18px Arial, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "black";
                ctx.fillText("Quit", this.x + 50, this.y + 25);
            }
        },
			//Lets create the snake now
			snake_array : [], //an array of cells to make up the snake
	
			init : function(){
		
				console.log("in_init");
		
				ctx = this.canvas.getContext("2d");	
				if (windowList[windowId].isTiled){

					this.d = "right"; //default direction
					this.create_snake();
					this.create_food(); //Now we can see the food particle		
					this.init_score();
					//askRemoteGameControl(windowId, "snake", "init_score", "", "except-host");
					askRemoteGameControl(windowId, "snake", "direction", "", "except-host");
					//askRemoteGameControl(windowId, "snake", "create_snake", "", "except-host");
					askRemoteGameControl(windowId, "snake", "create_food", "", "except-host");
					if(isMaster){
						this.onScreen = true;
					}
				}	
				else if(isMaster && !(windowList[windowId].isTiled)){
					this.d = "right"; //default direction
					this.create_snake();
					this.create_food(); //Now we can see the food particle
					this.init_score();
				}
		
				else{
					console.log("error: function init");
				}	
		
		

				
		
				// //finally lets display the score
				
				//Lets move the snake now using a timer which will trigger the paint function
				//every 60ms		
				if(typeof game_loop != "undefined") clearInterval(game_loop);
				game_loop = setInterval(this.paint.bind(this), 60);
	
			},



		init_other_screen : function(score, length,pos_x,pos_y,direction){
		
				console.log("score : " + score);
				console.log("length : " + length);
				console.log("direction : " + direction);
				
				ctx = this.canvas.getContext("2d");	
				if (windowList[windowId].isTiled){

					this.d = direction; //default direction
					this.create_snake_data(length,pos_x,pos_y);
					this.create_food(); //Now we can see the food particle		
					this.update_score(score);
					console.log("this.score : " + this.score);	
									
					
				}	
				
		
				if(typeof game_loop != "undefined") clearInterval(game_loop);
				game_loop = setInterval(this.paint.bind(this), 60);
	
			},



	
	
			create_snake : function ()
			{
	
				var length = 5; //Length of the snake
				this.snake_array = []; //Empty array to start with
				for(var i = length-1; i>=0; i--)
				{
					//This will create a horizontal snake starting from the top left
					this.snake_array.push({x: i, y:0});
				}
		
		
			},

			create_snake_data : function (length, pos_x, pos_y){
				this.snake_array = []; //Empty array to start with
				for(var i = length-1; i>=0; i--)
				{
					//This will create a horizontal snake starting from the top left
					this.snake_array.push({x: i, y:0});
				}
				if(infos.position.i == 0 && infos.position.j == 0){
					this.snake_array[0].x=Math.round((this.W-this.cw)/this.cw) - pos_x;
					this.snake_array[0].y=0;
					
				}else if (infos.position.i == 0 && infos.position.j == 1){
					this.snake_array[0].x=Math.round((this.W-this.cw)/this.cw) - pos_x;
					this.snake_array[0].y=0;
				}
			},
	
			//Lets create the food now
			create_food :function ()
			{
				this.food = {
					x: Math.round(Math.random()*(this.W-this.cw)/this.cw), 
					y: Math.round(Math.random()*(this.H-this.cw)/this.cw), 

				};
		
				//This will create a cell with x/y between 0-44
				//Because there are 45(450/10) positions accross the rows and columns
		
			},
	
			//Lets paint the snake now
			paint : function ()
			{

		
		
				//To avoid the snake trail we need to paint the BG on every frame
				//Lets paint the canvas now
				ctx.fillStyle = "white";
				ctx.fillRect(0, 0, this.W, this.H);
				ctx.strokeStyle = "black";
				ctx.strokeRect(0, 0, this.W, this.H);
		
				//The movement code for the snake to come here.
				//The logic is simple
				//Pop out the tail cell and place it infront of the head cell
		
				

				 if (windowList[windowId].isTiled || this.fullWindowState) {
				  
				this.quitBtn.draw(this.canvas,ctx);

			    }

		
				if (isMaster && !(windowList[windowId].isTiled)){
					this.move_bicth_snake();		
				}
				else if (windowList[windowId].isTiled && this.onScreen){
					this.move_bicth_snake();			
					// askRemoteGameControl(windowId, "snake", "move_bicth_snake", "", "except-host");	
				}
				else{
					// console.log("error")	
				}
		
		

				//Lets add the game over clauses now
				//This will restart the game if the snake hits the wall
				//Lets add the code for body collision
				//Now if the head of the snake bumps into its body, the game will restart

//				console.log("nx : " + this.nx);
//				console.log("W cw : " + this.W/this.cw);
				if(this.nx == -1 || this.nx == parseInt(this.W/this.cw) || this.ny == -1 || this.ny == parseInt(this.H/this.cw) || this.check_collision(this.nx, this.ny, this.snake_array)){
				console.log("colision");
					//restart game
					if (isMaster && !windowList[windowId].isTiled){
						console.log("if");
						this.init();
						return;
					}
					else if (windowList[windowId].isTiled && this.onScreen) {
					
						if(this.check_collision(this.nx, this.ny, this.snake_array)){
							this.init();	
							console.log("AAAAAAA");
							var sc =0;	
							askRemoteGameControl(windowId, "snake", "init_score", "", "except-host");
							
										
						}						
						else if(infos.position.i == 0 && infos.position.j == 0 ){
							if(this.nx == -1 || this.nx == parseInt(this.W/this.cw)  || this.ny == parseInt(this.H/this.cw)  ){
								this.init();
								console.log("BBBBBB");
								console.log("nx : " + this.nx);
								console.log("ny : " + this.ny);
								console.log("parseInt(this.W/this.cw) : " + parseInt(this.W/this.cw));
								var sc =0;	
							askRemoteGameControl(windowId, "snake", "init_score", "", "except-host");
								return;
							}
							else {
								this.onScreen = false;
							askRemoteGameControl(windowId, "snake", "onScreenTrue", "", "except-host");					
							askRemoteGameControl(windowId, "snake", "init_other_screen", {"score": this.score, "length": this.snake_array.length,"pos_x":this.snake_array[0].x,"pos_y":this.snake_array[0].y,"direction":"down"}, "except-host");
							return;	
							}	
						}
						else if(infos.position.i == 0 && infos.position.j == 1 ){
							if(this.nx == -1 || this.nx == parseInt(this.W/this.cw)  || this.ny == parseInt(this.H/this.cw)  ){
								this.init();
								console.log("CCCCC");
								var sc =0;	
							askRemoteGameControl(windowId, "snake", "init_score", "", "except-host");	
								return;
							}
							else {
								console.log("01 : else");
								this.onScreen = false;
								
							askRemoteGameControl(windowId, "snake", "onScreenTrue", "", "except-host");							console.log("01 : else askremote");
							console.log("this.snake_array[0].x: "+this.snake_array[0].x);
							console.log("this.snake_array[0].y: "+this.snake_array[0].y);
							console.log("this.ny: "+this.ny);
							askRemoteGameControl(windowId, "snake", "init_other_screen", {"score": this.score, "length": this.snake_array.length,"pos_x":this.snake_array[0].x,"pos_y":this.snake_array[0].y,"direction":"down"}, "except-host");
							console.log("01 : else return");
							return;
							}	
						}
										

						
					}
					else{
						console.log("error: ligne 283 ");
					}		
			
					//Lets organize the code a bit now.
			
				}

				
		
				//Lets write the code to make the snake eat the food
				//The logic is simple
				//If the new head position matches with that of the food,
				//Create a new head instead of moving the tail
				if(this.nx == this.food.x && this.ny == this.food.y)
				{

					if(isMaster){
						this.tail = {x: this.nx, y: this.ny};
					}
					else if (windowList[windowId].isTiled && this.onScreen){
						this.tail = {x: this.nx, y: this.ny};
						// askRemoteGameControl(windowId, "snake", "tail_attribut", "", "except-host");	
					}
			
			
					// this..score++;
			
					if(!windowList[windowId].isTiled){
						this.increase_score();
					}
					else{
						this.increase_score();
						askRemoteGameControl(windowId, "snake", "increase_score", "", "except-host");
					}
					//askRemoteGameControl(windowId, "snake", "increase_score", "", "except-host");
					//Create new food
					//askRemoteGameControl(windowId, "snake", "create_food", "", "except-host");

					if(isMaster){
						this.create_food();
					}
					else if (windowList[windowId].isTiled && this.onScreen){
						this.create_food();
		//				askRemoteGameControl(windowId, "snake", "create_food", "", "except-host");
					}			
				}
				else
				{
					if(isMaster && !windowList[windowId].isTiled){
						this.tail = this.snake_array.pop(); //pops out the last cell		
						this.tail.x = this.nx; this.tail.y = this.ny;	
					}
					else if (windowList[windowId].isTiled && this.onScreen){
						this.tail = this.snake_array.pop(); //pops out the last cell		
						this.tail.x = this.nx; this.tail.y = this.ny;		
						// askRemoteGameControl(windowId, "snake", "snake_array_pop", "", "except-host");
				
					}
			
		
				}
				//The snake can now eat the food.
				if(isMaster && !windowList[windowId].isTiled){
					this.snake_array.unshift(this.tail); //puts back the tail as the first cell
				}
				else if (windowList[windowId].isTiled && this.onScreen ){
					this.snake_array.unshift(this.tail); //puts back the tail as the first cell
					// askRemoteGameControl(windowId, "snake", "snake_array_unshift", "", "except-host");
			
				}
		
				// askRemoteGameControl(windowId, "snake", "paint_cell", "", "except-host");

				for( this.i = 0; this.i < this.snake_array.length; this.i++)
				{		
					var c = this.snake_array[this.i];
					//Lets paint 10px wide cells
			
					if(isMaster && !windowList[windowId].isTiled){
						// askRemoteGameControl(windowId, "snake", "paint_cell", "", "except-host");
						this.paint_cell(c.x, c.y);		
					}
					else if(windowList[windowId].isTiled && this.onScreen){				
						this.paint_cell(c.x, c.y);
						// askRemoteGameControl(windowId, "ping-pong", "movePaddle", { "id": 2, "x": this.paddles[1].x, "W": this.W }, "except-host");
						// askRemoteGameControl(windowId, "snake", "paint_cell", {"cx": c.x, "cy": c.y}, "except-host");		
					}			
					else{
						this.paint_cell_score();
					}
			
				}
				this.i = 0;
		
				//Lets paint the food
				// askRemoteGameControl(windowId, "snake", "paint_cell_food", "", "except-host");
				if (isMaster && !windowList[windowId].isTiled){
					this.paint_cell(this.food.x, this.food.y);		
				}		
				else if (windowList[windowId].isTiled && this.onScreen){
					this.paint_cell(this.food.x, this.food.y);		
					// askRemoteGameControl(windowId, "snake", "paint_cell_food", {"cx": this.food.x, "cy": this.food.y}, "except-host");		
					// askRemoteGameControl(windowId, "snake", "paint_cell_food", "", "except-host");
				}	
		
		
				//Lets paint the score
				var score_text = "Score: " + this.score;
				console.log("dans paint score: "+this.score);
				ctx.fillText(score_text, 25, this.H-5);
			},

			init_score : function (){
				this.score = 0; //default direction
			},

			update_score : function (score) {
				this.score = score;
			},

			direction : function (){
				this.d = "right"; //default direction
			},

			tail_attribut : function (){
				this.tail = {x: this.nx, y: this.ny};
			},

			snake_array_unshift :function (){
				this.snake_array.unshift(this.tail); //puts back the tail as the first cell
			},

			snake_array_pop : function (){
				this.tail = this.snake_array.pop(); //pops out the last cell		
				this.tail.x = this.nx; this.tail.y = this.ny;		
			},

			paint_cell_score : function(){
				ctx.fillStyle = "blue";
				// ctx.fillRect(x*this.cw, y*this.cw, this.cw, this.cw);
				ctx.strokeStyle = "white";
				// ctx.strokeRect(x*this.cw, y*this.cw, this.cw, this.cw);
			},
	
			//Lets first create a generic function to paint cells
			paint_cell : function (x, y)
			{

		
				ctx.fillStyle = "blue";
				ctx.fillRect(x*this.cw, y*this.cw, this.cw, this.cw);
				ctx.strokeStyle = "white";
				ctx.strokeRect(x*this.cw, y*this.cw, this.cw, this.cw);
			},

			onScreenTrue : function (){
				this.onScreen = true;

			},


			onScreenFalse : function (){
				this.onScreen = false;

			},

			check_collision : function (x, y, array)
			{
		
				// if (!windowList[windowId].isTiled) {
					//This function will check if the provided x/y coordinates exist
					//in an array of cells or not
					for(var i = 0; i < array.length; i++)
					{
						if(array[i].x == x && array[i].y == y){					
							return true;
						}
					}
					return false;
			



					// for(var i = 0; i < array.length; i++)
					// {
					// 	if(array[i].x == x && array[i].y == y)
					// 	 return true;
					// }
					// return false;
				// }
				// else if (windowList[windowId].isTiled){
				// 	// console.log("nx: "+this.nx+" ny: "+this.ny+" s_array: "+this.snake_array[0].x);
				// 	// console.log("nx: "+x+" ny: "+y+" array: "+array[0].x);
			
				// 	for(var i = 0; i < array.length; i++)
				// 	{
				// 		if(array[i].x == x && array[i].y == y)
				// 		 return true;
				// 	}
				// 	return false;
				// }
				// else {
				// 	console.log("Error: snake.js function check_collision");
				// }
			},

			move_bicth_snake : function (){

				//The movement code for the snake to come here.
				//The logic is simple
				//Pop out the tail cell and place it infront of the head cell
		
				this.nx = this.snake_array[0].x;
				this.ny =this.snake_array[0].y;
				
				//These were the position of the head cell.
				//We will increment it to get the new head position
				//Lets add proper direction based movement now

				if(this.d == "right"){this.nx++;}
				else if(this.d == "left") this.nx--;
				else if(this.d == "up") this.ny--;
				else if(this.d == "down") this.ny++;
			},
		
			increase_score : function (){
				this.score++;
			},
	
	
			launchFullScreen: function () {		
			fullWindowSnake();
		   },

		       cancelSnake: function () {
			// Stop the Animation
			clearInterval(game_loop);
		
		    
		    },
		    
		    
		      btnClick :function (e) {
		console.log("btnclick");
   		var mx = e.offsetX;
        	var my = e.offsetY;
        	console.log(this.fullWindowState);
   		if (windowList[windowId].isTiled || game.fullWindowState) {
   			console.log("btnclick2");
   			console.log(game.quitBtn);
            		if (mx >= game.quitBtn.x && mx <= (game.quitBtn.x + game.quitBtn.w) && my >= game.quitBtn.y && my <= (game.quitBtn.y + game.quitBtn.h)) {
            			console.log("tiled:"+windowList[windowId].isTiled+" master: "+isMaster);
            			
            
                	askRemoteGameControl(windowId, "snake", "endfullscreen", "", "all");
             
            }
        }
},

 endFullscreen:function(){
  console.log("endfullscreen111111111");
            cancelFullScreen(document.documentElement);
            canvas.style.display = this.saveDisplay;
            this.canvas = canvas;
            this.W = canvas.width;
            this.H = canvas.height;
            canvas.parentElement.parentElement.style.top = this.saveTop + "px";
            canvas.parentElement.parentElement.style.left = this.saveLeft + "px";
            canvasFullscreen.style.display = "none";
            this.fullWindowState = false;
            canvasFullscreen.removeEventListener("mousedown", this.btnClick, false);
            if (!isMaster){
            console.log("danssss if");
             elements=document.getElementsByClassName("window pepo");//.style.visibility="hidden";
            for(var i=0; i<elements.length;i++){
            elements[i].parentNode.removeChild(elements[i]);
            }
            }

	
}
		}


		game.init();	
		// askRemoteGameControl(windowId, "snake", "initSnake", "", "except-host");


		$(document).keydown(function(e){
				var key = e.which;
				//We will add another clause to prevent reverse gear
				if(key == "37" && game.d != "right") game.d = "left";
				else if(key == "38" && game.d != "down") game.d = "up";
				else if(key == "39" && game.d != "left") game.d = "right";
				else if(key == "40" && game.d != "up") game.d = "down";
				//The snake is now keyboard controllable
			});





		function fullWindowSnake() {	
			if (!game.fullWindowState) {
			game.fullWindowState = true;
			var windowId = canvas.id.split('canvas')[1];
			// windowId.isTiled = true;
			// this.windowId.isTiled = true;

			// Canvas goes full window
			var canvasFullscreen = document.getElementById('canvasFullscreen');        
			launchFullScreen(document.documentElement);
		
			saveLeft = canvas.parentElement.parentElement.offsetLeft;
			saveTop = canvas.parentElement.parentElement.offsetTop;
			saveDisplay = canvas.style.display;
			canvas.style.display = "none";
		
			canvasFullscreen.width = window.innerWidth;
			canvasFullscreen.height = window.innerHeight;
		       // canvasFullscreen.width = 300;
		       // canvasFullscreen.height = 200;

			canvasFullscreen.style.display = "block";

			game.canvas = canvasFullscreen;        
				game.W = canvasFullscreen.width;
			game.H = canvasFullscreen.height;

				console.log("game.H: "+game.H);
				console.log("game.W: "+game.W);

		
	

		   canvasFullscreen.addEventListener("mousedown", game.btnClick, false);
			
			 
		
				game.init();
				askRemoteGameControl(windowId, "snake", "initSnake", "", "all");

				if (isMaster && windowList[windowId].isTiled) {		
				 	// console.log("windowId:" +windowId);
				shareMediaDisplay(windowId, "snake", "SNAKE", false, data);
		    	}


		    }



		}

		windowList[windowId].data = { "game": game }

	}
}
