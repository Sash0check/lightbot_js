var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var background_color= "#001531";

function draw_background(){
	ctx.fillStyle = background_color;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}
draw_background();

var im_size=70;
var data;
var level = 0;
var field = [];
var docers = [];
var docs = {
	"f1_doc":[],
	"f2_doc":[],
	"m_doc":[],
};
var path = [];
var utils = {
	"lamps":[],
	"guns":[],
	"gears":[],
	"battaries":[],
};
var selected_doc;
var start_button;
var repeat_button;

var gears_quantity = 3;

var block_start_button = false;

var gears = [];

for (var i =0; i <10; i++){
	gears.push(new Image());
}

function update_gears(){
	//console.log(gears);
	ctx.fillStyle = background_color;
	ctx.fillRect(990,20,im_size,im_size);
	ctx.fillStyle = "#82f9ff";
	ctx.fillText(gears_quantity, 1010, 75);
}

function update_level_count(){
	ctx.fillStyle = background_color;
	ctx.fillRect(700, 20, 200, 50);
	ctx.font = 'bold 48px sans-serif';
	ctx.fillStyle = "#82f9ff";
	ctx.fillText("Level "+ (level+1), 700, 70);
	
}

var Cell = function(type){
	this.type=type;
	//this.start=null;
	this.x=null;
	this.y=null;
};

Cell.prototype={
	draw : function(starting_point,i,j,padding){
		if (padding){
			var x=starting_point[0]+i*im_size + padding*i;
			var y=starting_point[1]+j*im_size + padding*j;
		}else{
			var x=starting_point[0]+i*im_size;
			var y=starting_point[1]+j*im_size;
		}
//		this.start=starting_point;
		this.x=x;
		this.y=y;
		ctx.drawImage(images[this.type],x,y,im_size,im_size);
	},
	stroke : function(color){
		ctx.lineWidth=3;
		ctx.strokeStyle=color;
		ctx.strokeRect(this.x+ctx.lineWidth/2,this.y+ctx.lineWidth/2, im_size-ctx.lineWidth, im_size-ctx.lineWidth);
	},
	restore : function(){
		ctx.drawImage(images[this.type],this.x,this.y,im_size,im_size);
	}
};

var Button = function(type){
	this.type=type;
	//this.start=null;
	this.x=null;
	this.y=null;
};

Button.prototype={
	draw : function(x,y){
		this.x=x;
		this.y=y;
		ctx.drawImage(buttons[this.type],x,y,im_size,im_size);
	},
	stroke : function(color){
		ctx.lineWidth=3;
		ctx.strokeStyle=color;
		ctx.strokeRect(this.x+ctx.lineWidth/2,this.y+ctx.lineWidth/2, im_size-ctx.lineWidth, im_size-ctx.lineWidth);
	},
	restore : function(color){
		ctx.drawImage(buttons[this.type],this.x,this.y,im_size,im_size);
	}
};


var bot = {
	"cell":new Cell("bot_0"),
	"coords":[],
	"direction":0
};

var docers_coords=[100,100];
var field_coords=[500,100];

var images={
	"cell":new Image(),
	"cell_f":new Image(),
	"cell_m":new Image(),
	"cell_start":new Image(),
	"m":new Image(),
	"f1":new Image(),
	"f2":new Image(),
	"road":new Image(),
	"bot_0":new Image(),
	"bot_1":new Image(),
	"bot_2":new Image(),
	"bot_3":new Image(),
	"finish":new Image(),
	"lamp":new Image(),
	"left":new Image(),
	"right":new Image(),
	"jump":new Image(),
	"forward":new Image(),
	"lamp_glow":new Image(),
	"gun_0":new Image(),
	"gun_1":new Image(),
	"gun_2":new Image(),
	"gun_3":new Image(),
	"ray_h":new Image(),
	"ray_v":new Image(),
	"finish_lock":new Image(),
	"gear":new Image(),
	"battary":new Image(),
	"level_completed":new Image(),
	"level_failed":new Image(),
};

var buttons = {
	"start":new Image(),
	"repeat":new Image(),
};

var buttons = {
	"start":new Image(),
	"pause":new Image(),
	"repeat":new Image(),
};

function end_screen(type){
	
	setTimeout(function(){
		if (type=="win"){
			//console.log("win");
			ctx.drawImage(images["level_completed"],field_coords[0],field_coords[1],im_size*data.w_cells,im_size*data.h_cells);
		}else if (type=="loose"){
			gears_quantity--;
			if (gears_quantity==0) {
				level = 0;
				gears_quantity = 3;
				next_level(0);
			}
			ctx.drawImage(images["level_failed"],field_coords[0],field_coords[1],im_size*data.w_cells,im_size*data.h_cells);
		}
	},700);

	setTimeout(function(){
		start_button.type = "start";
		start_button.restore();
		//repeat_button.restore();
		if (type=="win"){
			block_start_button=false;
			next_level();
		}else if (type=="loose"){
			restart();
		}
	},3000);
}

load_images();
load_buttons();


var timer_i=0;
var lapms_quantity = 0;
var lamps_check = {};
function start_bot(){
	block_start_button = true;
	draw_field();
	update_gears();
	draw_bot();	
	console.log("start button id pressed");
	var sequence=[];
	for (var i in docs.m_doc){
		var curr = docs.m_doc[i];
		if (curr.type!="cell_m"){
			console.log("Type "+curr.type);
			if (curr.type == "f1"){
				sequence=sequence.concat(get_actions("f1_doc"));
			}
			else if (curr.type == "f2"){
				sequence=sequence.concat(get_actions("f2_doc"));
			}
			else sequence.push(curr);
		}
	}
	timer_i=0;
	console.log(sequence);
	var timer = setInterval(function() {
	  if (timer_i >= sequence.length) {
	    clearInterval(timer); // конец через 2 секунды
	    if (bot.coords[0] == data.finish[0] && bot.coords[1] == data.finish[1])
		{
			if (data.lamps.length!=0){
				if (Object.keys(lamps_check).length == data.lamps.length){
					console.log("win2");
					end_screen("win");
					//alert("WIN!");
				}else{
					end_screen("loose");
					//alert("LOOSER3");
				}
			}else{
				console.log("win1");
				end_screen("win");
				
			}
		}
		else if (block_start_button)
		{
			end_screen("loose");
		}
	    return;
	  }
	  iteration(sequence);
	}, 200);

}
function next_level(number){
	level++;
	if (number || number==0){
		clear_all();
		data=levels[number];
		level=number;
		sessionStorage.setItem("level",level);
		main();
	}else if (levels[level]){
		clear_all();
		data=levels[level];
		sessionStorage.setItem("level",level);
		main();

	}else{
		alert("End of game, you win!");
	}
}

function check_on_the_path(){
	if (bot.coords[0]<0 || bot.coords[0]>data.h_cells || bot.coords[1]<0 || bot.coords[1]>data.w_cells ) return false;
	if (field[bot.coords[0]][data.h_cells-1-bot.coords[1]].type=="ray_v" || field[bot.coords[0]][data.h_cells-1-bot.coords[1]].type=="ray_h"){
		return false;
	}
	for (var i in data.path){
		if (bot.coords[0]==data.path[i][0] && bot.coords[1]==data.path[i][1])
			return true;
	}
	return false;
}

function iteration(sequence){
	is_battary=false;
	if (sequence[timer_i].type=="forward"){
		switch (Math.abs(4-bot.direction)%4) {
		  case 0://up
		  	bot.coords[1]++;
		    break;
		  case 2://down
		  	bot.coords[1]--;
		    break;
		  case 1://left
		  	bot.coords[0]--;
		    break;
		  case 3://right
		  	bot.coords[0]++;
		    break;
		}
	}
	if (Object.keys(lamps_check).length == data.lamps.length){
		console.log("done");
		field[data.finish[0]][data.h_cells-1-data.finish[1]].type="finish";
		field[data.finish[0]][data.h_cells-1-data.finish[1]].restore();
	}
	for (var i=0;i<data.lamps.length;i++){
		if (bot.coords[0]==data.lamps[i][0] && bot.coords[1]==data.lamps[i][1]){
			lamps_check[i]=1;
			utils.lamps[i].type = "lamp_glow";
			utils.lamps[i].restore();
		}	
	}
	
	if (sequence[timer_i].type=="left"){
		bot.direction-=1;
	}
	if (sequence[timer_i].type=="right"){
		
		bot.direction+=1;
		
	}

	if (sequence[timer_i].type!="left" && sequence[timer_i].type!="right"){
		var del = null;
		for (var i=0;i<utils.gears.length;i++){
			if (utils.gears[i].x == (field_coords[0]+bot.coords[0]*im_size) && utils.gears[i].y == (field_coords[1]+(data["h_cells"]-1-bot.coords[1])*im_size)){
				del=i;
				gears_quantity++;
				break;
			}
		}
		//utils.gears.splice(del,1);
	}

	for (var i=0;i<utils.battaries.length;i++){
		if (utils.battaries[i].x == (field_coords[0]+bot.coords[0]*im_size) && utils.battaries[i].y == (field_coords[1]+(data["h_cells"]-1-bot.coords[1])*im_size)){
			draw_docs();
			utils.battaries.splice(i,1);
			start_button.type = "start";
			start_button.restore();
			block_start_button = false;
			timer_i=sequence.length;
			break;
		}
	}
	

	bot.cell.type="bot_"+Math.abs(4-bot.direction)%4;
	draw_field();
	update_gears();
	draw_bot();
	if (!check_on_the_path()) {
		timer_i=sequence.length;
		start_button.type = "start";
		start_button.restore();
	}
	timer_i++;
}
var stack_count=[0,0];
function get_actions(doc){
	var list=[];
	for (var i in docs[doc]){
		var curr = docs[doc][i];
		if (stack_count[0]!=0 && stack_count[0]==stack_count[1]) {
			for(var j=0;j<10;j++)
				list=list.concat(list);
			return list;
		}
		if (curr.type!="cell_f"){
			if (curr.type == "f1"){
				if (doc=="f2_doc") stack_count[0]++;
				if (doc=="f1_doc")
				{
					for(var j=0;j<10;j++)
						list=list.concat(list);
				}else{
					list=list.concat(get_actions("f1_doc"));
				}
			}
			else if (curr.type == "f2"){
				if (doc=="f1_doc") stack_count[1]++;
				if (doc=="f2_doc"){
					for(var j=0;j<10;j++)
						list=list.concat(list);
				}else{
					list=list.concat(get_actions("f2_doc"));
				}
			}
			else list.push(curr);
		}
	}
	return list;
}

function main(){
	draw_decorations();
	draw_field();
	draw_bot();
	update_level_count();
	update_gears();
}

function clear_all(){
	field = [];
	docers = [];
	path = [];
	docs = {
		"f1_doc":[],
		"f2_doc":[],
		"m_doc":[],
	};
	selected_doc=null;
	placed=false;
	restore_cell=null;
	bot = {
		"cell":new Cell("bot_0"),
		"coords":[],
		"direction":0
	};

	utils = {
		"lamps":[],
		"guns":[],
		"gears":[],
		"battaries":[],
	};

	update_gears();
	block_start_button = false;
}

var count_loaded_images=0;

function load_images(){
	for (var i = 0; i < 10; i++){
		gears[i].src = "../resources/try_"+i+".png";
		gears[i].onload = function () {
			count_loaded_images++;
		}
	}
	
	for (key in images){
		images[key].src="../resources/"+key+".png";
		images[key].onload = function () {
			count_loaded_images++;
			if (count_loaded_images==(Object.keys(images).length + gears.length)){
				if (sessionStorage.getItem("level")){
					level=parseInt(sessionStorage.getItem("level"));
				}
				data = levels[level];
				main();
			}
		}
	}
}

function load_buttons(){
	for (key in buttons){
		buttons[key].src="../resources/"+key+".png";
	}
}

function draw_bot(){
	if (bot.coords.length==0){
		bot["coords"][0]=data["light_bot_coords"][0];
		bot["coords"][1]=data["light_bot_coords"][1];
	}
	bot["cell"].draw(field_coords,bot["coords"][0],data["h_cells"]-1-bot["coords"][1]);
}

function draw_decorations(){
	ctx.drawImage(images["battary"],920,20,im_size,im_size);
	ctx.drawImage(images["f1"],field_coords[0]-im_size,field_coords[1],im_size,im_size);
	ctx.drawImage(images["f2"],field_coords[0]-im_size,field_coords[1] + im_size,im_size,im_size);
	ctx.drawImage(images["m"],field_coords[0]-im_size,field_coords[1] + im_size*2,im_size,im_size);
	if (docers.length==0){
		for (var i in data["actions"]){
			docers.push(new Cell(data["actions"][i]));
		}
		var count=0;
		for (var i=0; i<docers.length; i++){
			docers[i].draw(docers_coords,Math.abs(i%2),count,5);
			docers[i].stroke("#82f9ff");
			if (i%2==1) count++;
		}
		start_button = new Button("start");
		start_button.draw(500,20);
		repeat_button = new Button("repeat");
		repeat_button.draw(field_coords[0]-im_size,field_coords[1] + im_size*3);
	}else{
		for (var i=0; i<docers.length; i++){
			docers[i].restore();
			docers[i].stroke("#82f9ff");
		}
	}
}

function draw_field(){
	console.log(data);
	if (field.length==0){
		for (var i=0;i<data['w_cells'];i++){
			field[i]=new Array();
			for (var j=0;j<data['h_cells'];j++){
				field[i][j]=null;
			}
		}
		for (var i=0;i<data['w_cells'];i++){
			for (var j=0;j<data['h_cells'];j++){
				if (j==0){
					field[i][j] = new Cell("cell_f");	
					docs["f1_doc"].push(field[i][j]);
				}
				else if (j==1){
					field[i][j] = new Cell("cell_f");
					docs["f2_doc"].push(field[i][j]);	
				}
				else if (j==2){
					field[i][j] = new Cell("cell_m");
					docs["m_doc"].push(field[i][j]);	
				}
				else{
					field[i][j] = new Cell("cell");	
				}
			}
		}

		var temp_path=[];
		for (var i in data["path"]){
			temp_path.push(data["path"][i]);
		}
		var named_path=[];
		for (var i=0; i<temp_path.length; i++){
			//console.log(x+" "+y)
			named_path.push("road");
		}
		for (var i=0; i<temp_path.length; i++){
			if (temp_path[i][0] == data.finish[0] && temp_path[i][1] == data.finish[1])
			{
				named_path[i] = "finish";
			}
		}

		for (var i=0; i<temp_path.length; i++){
			var x = temp_path[i][0];
			var y = data.h_cells -1- temp_path[i][1];
			path.push(new Cell(named_path[i]));
			field[x][y] = path[i];
		}

		if (data.lamps.length>0)
			field[data.finish[0]][data.h_cells-1-data.finish[1]].type="finish_lock";
			for (var i=0; i<data.lamps.length; i++){
				utils.lamps.push(new Cell("lamp"));
				var x = data.lamps[i][0];
				var y = data.h_cells -1- data.lamps[i][1];
				field[x][y] = utils.lamps[i];
			}

		if (data.gears && data.gears.length>0)
			for (var i=0; i<data.gears.length; i++){
				utils.gears.push(new Cell("battary"));
				var x = data.gears[i][0];
				var y = data.h_cells -1- data.gears[i][1];
				field[x][y] = utils.gears[i];
			}

		if (data.battaries && data.battaries.length>0)
			for (var i=0; i<data.battaries.length; i++){
				utils.battaries.push(new Cell("gear"));
				var x = data.battaries[i][0];
				var y = data.h_cells -1- data.battaries[i][1];
				field[x][y] = utils.battaries[i];
			}

		/*if (data.guns && data.guns.length>0)
			for (var i=0; i<data.guns.length; i++){
				utils.guns.push(new Cell("gun_" + data.guns[i][2]));
				var x = data.guns[i][0];
				var y = data.h_cells -1- data.guns[i][1];
				field[x][y] = utils.guns[i];
				switch (data.guns[i][2]){
					case 0://up
						var ty = data.guns[i][0];
					  	for(var j=data.h_cells-data.guns[i][1]-2;j>=3;j--){
					  		if (field[ty][j].type=="road"){ 
					  			field[ty][j].type="ray_v";
					  		}else{
					  			break;
					  		}
					  	}
					    break;
					  case 2://down
					  	var ty = data.guns[i][0];
					  	for(var j=data.h_cells-data.guns[i][1];j<data.h_cells;j++){
					  		if (field[ty][j].type=="road"){
					  			field[ty][j].type="ray_v";
					  		}else{
					  			break;
					  		}
					  	}
					    break;
					  case 1://left
					  	var tx = data.h_cells-data.guns[i][1]-1;
					  	for(var j=data.guns[i][0]-1;j>=0;j--){
					  		if (field[j][tx].type=="road"){
					  			field[j][tx].type="ray_h";
					  		}else{
					  			break;
					  		}
					  	}
					    break;
					  case 3://right
					  	var tx = data.h_cells-data.guns[i][1]-1;
					  	for(var j=data.guns[i][0]+1;j<data.h_cells;j++){
					  		if (field[j][tx].type=="road"){
					  			field[j][tx].type="ray_h";
					  		}else{
					  			break;
					  		}
					  	}
					    break;
				}
			}*/

		for (var i=0;i<data['w_cells'];i++){
			for (var j=0;j<data['h_cells'];j++){
				field[i][j].draw(field_coords,i,j);
			}
		}
	}else{
		for (var i=0;i<data['w_cells'];i++){
			for (var j=0;j<data['h_cells'];j++){
				field[i][j].restore();
			}
		}
	}
}

function draw_docs(){
	docs = {
		"f1_doc":[],
		"f2_doc":[],
		"m_doc":[],
	};
	for (var i=0;i<data['w_cells'];i++){
		for (var j=0;j<3;j++){
			if (j==0){
				field[i][j] = new Cell("cell_f");	
				docs["f1_doc"].push(field[i][j]);
			}
			else if (j==1){
				field[i][j] = new Cell("cell_f");
				docs["f2_doc"].push(field[i][j]);	
			}
			else if (j==2){
				field[i][j] = new Cell("cell_m");
				docs["m_doc"].push(field[i][j]);	
			}
			else{
				field[i][j] = new Cell("cell");	
			}
			field[i][j].draw(field_coords,i,j);
		}
	}
}

var mouse={
	x:0,
	y:0,
	down:false
};

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
    };
};

function is_mouse_in_rect(docer){
	var x=docer.x;
	var y=docer.y;
	if (mouse.x>x && mouse.y>y && mouse.x<(x + im_size) && mouse.y<(y + im_size)){
		return true;
	}
	else return false;
};

var placed = false;
var restore_type;
var restore_cell;
var copy_doc;
var selected_doc_field;

window.addEventListener('contextmenu', function(evt) {
	evt.preventDefault();
});

window.addEventListener('mousedown', function(evt) {
	if (evt.button == 2){
		selected_doc_field = null;
		selected_doc = null;
		restore_type = null;
		restore_cell = null;
		copy_doc = null;
		placed = false;
		for (var i in docs){
			for (var j in docs[i]){
				if (is_mouse_in_rect(docs[i][j])){
					if (docs[i][j].type!="cell_f" && docs[i][j].type!="cell_m"){
						console.log(docs[i][j].type);
						switch ((docs[i][j].y-field_coords[1])/im_size){
							case 0:
								docs[i][j].type="cell_f";
								break;
							case 1:
								docs[i][j].type="cell_f";
								break;
							case 2:
								docs[i][j].type="cell_m";
								break;
						}
						docs[i][j].restore();
					}
				}
			}
		}
	}
});

function restart(){
	bot = {
		"cell":new Cell("bot_0"),
		"coords":[],
		"direction":0
	};
	block_start_button=false;
	is_battary=false;
	for (var i=0; i<utils.lamps.length; i++){
		utils.lamps[i].type="lamp";
		utils.lamps[i].restore();
	}
	lamps_check={};
	draw_field();
	if (data.lamps.length>0){
		field[data.finish[0]][data.h_cells-1-data.finish[1]].type="finish_lock";
		field[data.finish[0]][data.h_cells-1-data.finish[1]].restore();
	}
	update_gears();
	draw_bot();
}

window.onmousedown = function (e){
	if (e.button == 0){
		mouse.x=getMousePos(e).x;
		mouse.y=getMousePos(e).y;
		if (is_mouse_in_rect(repeat_button)){
			next_level(0);
		}
		if (block_start_button==false && is_mouse_in_rect(start_button)){
			start_bot();
			start_button.type = "pause";
			start_button.restore();
		}
		for (var i in docers){
			if (is_mouse_in_rect(docers[i])){
				if (docers[i]!=selected_doc){
					docers[i].stroke("rgb(255, 0, 0)");
					selected_doc=new Cell(docers[i].type);
				}
				else{
					docers[i].restore();
					docers[i].stroke("#82f9ff");
					selected_doc=null;
				}
					
			}else{
				docers[i].restore();
				docers[i].stroke("#82f9ff");
			}
		}
		if (selected_doc){
			for (var i in docs){
				for (var j in docs[i]){
					if (is_mouse_in_rect(docs[i][j])){
						apply_cell(selected_doc,docs[i][j]);
					}
				}
			}
		}


		for (var i in docs){
			for (var j in docs[i]){
				if (is_mouse_in_rect(docs[i][j])){
					if (selected_doc){
						selected_doc=null;
					}else{
						if (selected_doc_field){
							if (selected_doc_field==docs[i][j]){
								selected_doc_field.restore();
								selected_doc_field=null;
							}else if(docs[i][j].type=="cell_f" || docs[i][j].type=="cell_m"){
								apply_cell(selected_doc_field,docs[i][j]);
								switch ((selected_doc_field.y-field_coords[1])/im_size){
									case 0:
										selected_doc_field.type="cell_f";
										break;
									case 1:
										selected_doc_field.type="cell_f";
										break;
									case 2:
										selected_doc_field.type="cell_m";
										break;
								}
							}else if(docs[i][j].type!="cell_f" && docs[i][j].type!="cell_m"){
									var temp_doc = docs[i][j].type;
									docs[i][j].type = selected_doc_field.type;
									selected_doc_field.type = temp_doc;
									docs[i][j].restore();
							}
							selected_doc_field.restore();
							selected_doc_field=null;
						}else if (docs[i][j].type!="cell_f" && docs[i][j].type!="cell_m"){
							selected_doc_field=docs[i][j];
							selected_doc_field.stroke("rgb(255, 0, 0)");
						}
					}
				}
			}
		}
	}
}
function apply_cell(from_cell,to_cell){
	var tx,ty;
	tx=to_cell.x;
	ty=to_cell.y;
	to_cell.type=from_cell.type;
	to_cell.x=tx;
	to_cell.y=ty;
	to_cell.restore();
}