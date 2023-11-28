import Game from "/game.js";

// global variables
window.TO_RADIANS = Math.PI/180;
window.mousePos = {x: 0, y: 0};
window.CANVAS_WIDTH;
window.CANVAS_HEIGHT;
window.upgradeFactor = 1.3;

var canvas;
var game;

// app start:
document.addEventListener("DOMContentLoaded", event => {
	const app = firebase.app();
	//console.log(app);
	
	canvas = document.getElementById("gameScreen");
	// size of the game screen
	window.CANVAS_WIDTH = canvas.width;
	window.CANVAS_HEIGHT = canvas.height;
	
	game = new Game(canvas);
	
	game.Start();
	
	Loop(0);
});

// setting global mouse position variables
document.addEventListener("mousemove", event => {
	var rect = canvas.getBoundingClientRect();
	window.mousePos.x = event.clientX - rect.left;
	window.mousePos.y = event.clientY - rect.top;
});

let lastTime = 0;
function Loop(timeStamp){
	let deltaTime = (timeStamp - lastTime) / 1000;
	lastTime = timeStamp;
	
	// clearing the context
	game.context.clearRect(0, 0, canvas.width, canvas.height);
	
	if(deltaTime){
		// updating the game objects
		game.Update(deltaTime);
		
		// drawing the game objects
		game.Render();
		
		// drawing the GUI
		game.GUIRender();
	}
	
	// calling the loop again
	requestAnimationFrame(Loop);
}

function unlockAudio() {
	let sound = new Audio();
	sound.play();
	sound.pause();
	document.body.removeEventListener('click', unlockAudio)
	document.body.removeEventListener('touchstart', unlockAudio)
}
document.body.addEventListener('click', unlockAudio);
document.body.addEventListener('touchstart', unlockAudio);

// global functions
window.DrawSpriteRotated = function(context, position, angle, sprite){
	context.save();
	context.translate(position.x, position.y);
	context.rotate(-angle * window.TO_RADIANS);
	context.drawImage(sprite.img, -sprite.ox, -sprite.oy, sprite.img.width * sprite.scale, sprite.img.height * sprite.scale);
	context.restore();
}
window.MPIPI = function(angle){
	while(angle > 180) angle -= 360;
	while(angle < -180) angle += 360;
	return angle;
}
window.MakeSprite = function(image, scale){
	return {
		img: image,
		scale: scale,
		ox: image.width * scale * 0.5,
		oy: image.height * scale * 0.5
	};
}
window.Altitude = function(distance, speed, initialElevation){
	let initialSpeedVertical = speed * Math.sin(initialElevation * window.TO_RADIANS);
	let t = distance / speed;
	return 2 + initialSpeedVertical * t - 0.5 * 10 * t * t  * 45;
}
window.DrawLine = function(context, colour, thickness, pos1, pos2){
	context.strokeStyle = colour;
	context.lineWidth = thickness;
	context.beginPath();
	context.moveTo(pos1.x, pos1.y);
	context.lineTo(pos2.x, pos2.y);
	context.stroke();
}
window.DrawArrowLine = function(context, colour, position, dist, angle){
	let gap = 8;
	let x = position.x;
	let y = position.y;
	let dx = gap * Math.cos(angle * window.TO_RADIANS);
	let dy = - gap * Math.sin(angle * window.TO_RADIANS);
	let I = dist / gap;
	let rx1 = 3*Math.cos((angle + 135) * window.TO_RADIANS);
	let ry1 = -3*Math.sin((angle + 135) * window.TO_RADIANS);
	let rx2 = 3*Math.cos((angle - 135) * window.TO_RADIANS);
	let ry2 = -3*Math.sin((angle - 135) * window.TO_RADIANS);
	context.strokeStyle = colour;
	context.lineWidth = 1;
	for(let i=0; i<I; i++){
		context.beginPath();
		context.moveTo(x + rx1, y + ry1);
		context.lineTo(x, y);
		context.lineTo(x + rx2, y + ry2);
		context.stroke();
		x += dx;
		y += dy;
	}
}
window.DrawAltitudeLabel = function(context, position, text, flipped=false){
	context.strokeStyle = 'red';
	context.lineWidth = 1;
	context.beginPath();
	context.moveTo(position.x, position.y);
	context.lineTo(position.x + (flipped ? -10 : 10), position.y + 10);
	context.lineTo(position.x + (flipped ? -30 : 30), position.y + 10);
	context.stroke();
	
	context.fillStyle = 'red';
	context.font = '12px san-serif';
	context.fillText(text, position.x + (flipped ? - 30 : 10), position.y + 8);
}
window.DrawWedge = function(context, colour, position, radius, fraction){
	context.fillStyle = colour;
	context.beginPath();
	context.moveTo(position.x, position.y);
	context.arc(position.x, position.y, radius, - Math.PI * 0.5, -Math.PI * 0.5 + 2 * Math.PI * fraction);
	context.closePath();
	context.fill();
}
window.PickRandom = function(array){
	let ret = array[Math.floor(array.length* Math.random())];
	return ret;
}
