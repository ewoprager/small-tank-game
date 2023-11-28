import Player from "/player.js";
import Plane from "/plane.js";

export default class Game {
	constructor(canvas){
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		
		// function call arrays
		this.updateObjects = [];
		this.renderObjects = [];
		this.GUIObjects = [];
		
		// collision management
		this.projectiles = [];
		this.upgrades = [];
		
		// planes
		this.planeWait = 5; // seconds
		this.planeTimer = this.planeWait;
		this.warningTime = 8; // seconds
		this.warningTimer;
		this.newPlanePath;
		this.warning = false;
		// spawning
		this.spawnRad = 100 + 0.5 * Math.pow((window.CANVAS_WIDTH*window.CANVAS_WIDTH + window.CANVAS_HEIGHT*window.CANVAS_HEIGHT), 0.5);
		
		// upgrade 'enum'
		this.Upgrade = {
			engine: "Engine upgrade",
			turret: "Turret movement speed increase",
			reload: "Reduced reload time"
		};
		
		// score
		this.score = 0;
	}
	
	Start(){
		this.player = new Player(this);
	}
	
	UpdateMe(object){ this.updateObjects.push(object); }
	DontUpdateMe(object){ this.updateObjects.splice(this.updateObjects.indexOf(object), 1); }
	Update(deltaTime){
		// my update
		if(this.warning){
			this.warningTimer -= deltaTime;
			if(this.warningTimer <= 0){
				this.warning = false;
				new Plane(this, this.newPlanePath, this.spawnRad * 2);
			}
		} else {
			this.planeTimer -= deltaTime;
			if(this.planeTimer <= 0){
				this.SetNewPlanePath();
				this.warning = true;
				this.warningTimer = this.warningTime;
				this.planeTimer = this.planeWait;
			}
		}
		
		// updating others
		this.updateObjects.forEach(object => object.Update(deltaTime));
	}
	
	RenderMe(object){ this.renderObjects.push(object); }
	DontRenderMe(object){ this.renderObjects.splice(this.renderObjects.indexOf(object), 1); }
	Render(){ this.renderObjects.forEach(object => object.Render(this.context)); }
	
	GUIRenderMe(object){ this.GUIObjects.push(object); }
	DontGUIRenderMe(object){ this.GUIObjects.splice(this.GUIObjects.indexOf(object), 1); }
	GUIRender(){
		// my gui
		// score
		this.context.fillStyle = 'black';
		this.context.font = '12px san-serif';
		this.context.fillText("Score: " + this.score, 10, 18);
		// warning
		if(this.warning){
			// dashed line
			window.DrawArrowLine(this.context, 'red', {x: this.newPlanePath.x, y: this.newPlanePath.y}, this.spawnRad * 2, this.newPlanePath.bearing);
			
			// altitude label
			let cx = this.newPlanePath.x + this.spawnRad * Math.cos(this.newPlanePath.bearing * window.TO_RADIANS);
			let cy = this.newPlanePath.y - this.spawnRad * Math.sin(this.newPlanePath.bearing * window.TO_RADIANS);
			let flipped = (this.newPlanePath.bearing < 0 && this.newPlanePath.bearing > -90) || (this.newPlanePath.bearing > 90 && this.newPlanePath.bearing < 180);
			window.DrawAltitudeLabel(this.context, {x: cx, y: cy}, this.newPlanePath.altitude, flipped);
			
			// timer
			window.DrawWedge(this.context, 'red', {x: cx - 40*(2*flipped - 1), y: cy+3}, 6, this.warningTimer / this.warningTime/1);
		}
		
		// others' guis
		this.GUIObjects.forEach(object => object.GUIRender(this.context));
	}
	
	AddProjectile(object){ this.projectiles.push(object); }
	RemoveProjectile(object){ this.projectiles.splice(this.projectiles.indexOf(object), 1); }
	AddUpgrade(object){ this.upgrades.push(object); }
	RemoveUpgrade(object){ this.upgrades.splice(this.upgrades.indexOf(object), 1); }
	
	SetNewPlanePath(){
		let bearingFromCentre = Math.random()*360;
		this.newPlanePath = {
			x: window.CANVAS_WIDTH*0.5 + this.spawnRad*Math.cos(bearingFromCentre * window.TO_RADIANS),
			y: window.CANVAS_HEIGHT*0.5 - this.spawnRad*Math.sin(bearingFromCentre * window.TO_RADIANS),
			bearing: window.MPIPI(bearingFromCentre + 180 + 20 - 40*Math.random()),
			speed: 150 + 100*Math.random(),
			altitude: Math.floor(50 + 200 * Math.random())
		};
	}
}
