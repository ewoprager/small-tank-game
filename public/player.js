import Projectile from "/projectile.js"

export default class Player {
	constructor(game){
		this.game = game;
		this.game.UpdateMe(this);
		this.game.RenderMe(this);
		this.game.GUIRenderMe(this);
		
		// sprites
		this.hullSprite = window.MakeSprite(document.getElementById("img_crusader_hull"), 1);
		this.turretSprite = window.MakeSprite(document.getElementById("img_crusader_turret"), 1);
		
		this.sqRad = 256;
		
		// audio
		this.fireSound = document.getElementById("sound_fire");
		
		// hull movement
		this.angle = 0; // degrees
		this.position = {x: 200, y: 200};
		this.velocity = {x: 0, y: 0};
		this.speed = 0; // pixels per second
		 // (upgradable)
		 this.maxSpeed = 120; // pixels per second
		 this.maxRotateSpeed = 40; // degrees per second
		 this.maxAcceleration = 50; // pixels per square second
		 
		// turret movement
		// yaw
		this.turretRelativeAngle = 0; // degrees
		this.turretMass = 1; // kg
		this.turretKnockBack = {x: 0, y: 0};
		this.turretReturnRate = 0.01; // fraction reduced to per second
		this.turretKnockBackRatio = 0.015; // pixels per kgms^-1 (knockback distance per momentum change)
		 // (upgradable)
		 this.maxTurretRotateSpeed = 60; // degrees per second
		// pitch
		this.turretElevation = 0; // degrees
		this.maxTurretElevation = 45; // degrees
		 // (upgradable)
		 this.maxTurretElevSpeed = 15; // degrees per second
		
		// GUI
		// plot
		this.guiOrigin = {x: 50, y: 575};
		this.guiWidth = 700;
		this.guiHeight = 250;
		this.guiYScale = 0.4;
		this.guiXs = [];
		for(let i=0; i<this.guiWidth; i+=5) this.guiXs.push(i);
		// mark
		this.marking = false;
		this.markPos = {x: 0, y: 0};
		
		// firing
		this.projectileMass = 0.1; // kg
		this.projectileSpeed = 800; // pixels per second
		this.fireWait = 0; // seconds
		 // (upgradable)
		 this.reloadTime = 1.5; // seconds
		
		// key press variables
		this.leftPressed = false;
		this.forwardPressed = false;
		this.rightPressed = false;
		this.backwardPressed = false;
		this.tRightPressed = false;
		this.tLeftPressed = false;
		this.firePressed = false;
		this.markPressed = false;
		this.scrollAmount = 0;
		this.scrollElevRatio = 0.005; // degrees per scroll
		
		document.addEventListener("keydown", event => {
			switch(event.keyCode){
				case 65: this.leftPressed = true; break;
				case 87: this.forwardPressed = true; break;
				case 68: this.rightPressed = true; break;
				case 83: this.backwardPressed = true; break;
				case 69: this.tRightPressed = true; break;
				case 81: this.tLeftPressed = true; break;
				case 32: this.firePressed = true; break;
				default: /*console.log(event.keyCode);*/ break;
			}
		});
		document.addEventListener("keyup", event => {
			switch(event.keyCode){
				case 65: this.leftPressed = false; break;
				case 87: this.forwardPressed = false; break;
				case 68: this.rightPressed = false; break;
				case 83: this.backwardPressed = false; break;
				case 69: this.tRightPressed = false; break;
				case 81: this.tLeftPressed = false; break;
				case 32: this.firePressed = false; break;
				default: break;
			}
		});
		document.addEventListener("mousedown", event => {
			switch(event.button){
				case 0:
					this.markPressed = true; break;
					break;
				default: break;
			}
		});
		document.addEventListener("mouseup", event => {
			switch(event.button){
				case 0:
					this.markPressed = false; break;
				default: break;
			}
		});
		window.addEventListener("wheel", event => {
			this.scrollAmount += event.deltaY;
		});
	}
	
	Update(deltaTime){
		// hull movement
		this.angle += this.maxRotateSpeed * (this.leftPressed - this.rightPressed) * deltaTime;
		this.angle = window.MPIPI(this.angle);
		
		let desiredSpeed = this.maxSpeed * (this.forwardPressed - this.backwardPressed);
		if(this.speed != desiredSpeed){
			if(this.maxAcceleration * deltaTime >= Math.abs(desiredSpeed - this.speed)){
				this.speed = desiredSpeed;
			} else {
				this.speed += this.maxAcceleration * deltaTime * Math.sign(desiredSpeed - this.speed);
			}
		}
		
		this.velocity.x = this.speed * Math.cos(this.angle * window.TO_RADIANS);
		this.velocity.y = -this.speed * Math.sin(this.angle * window.TO_RADIANS);
		
		this.position.x += this.velocity.x * deltaTime;
		this.position.y += this.velocity.y * deltaTime;
		
		// turret movement
		// yaw
		let thisRotateSpeed;
		if(this.marking){
			thisRotateSpeed = 12000 / this.markPos.x/1;
			if(thisRotateSpeed > this.maxTurretRotateSpeed) thisRotateSpeed = this.maxTurretRotateSpeed;
		} else thisRotateSpeed = this.maxTurretRotateSpeed;
		this.turretRelativeAngle += thisRotateSpeed * (this.tLeftPressed - this.tRightPressed) * deltaTime;
		this.turretRelativeAngle = window.MPIPI(this.turretRelativeAngle);
		// pitch
		if(this.scrollAmount < 0){
			this.scrollAmount = 0;
		} else if(this.scrollAmount > this.maxTurretElevation/this.scrollElevRatio/1){
			this.scrollAmount = this.maxTurretElevation/this.scrollElevRatio/1;
		}
		let desiredTurretElevation = this.scrollAmount * this.scrollElevRatio;
		if(Math.abs(desiredTurretElevation - this.turretElevation) < this.maxTurretElevSpeed * deltaTime){
			this.turretElevation = desiredTurretElevation;
		} else {
			this.turretElevation += Math.sign(desiredTurretElevation - this.turretElevation) * this.maxTurretElevSpeed * deltaTime;
		}
		
		// turret knockback
		let thisFrac = Math.pow(this.turretReturnRate, deltaTime);
		this.turretKnockBack.x *= thisFrac;
		this.turretKnockBack.y *= thisFrac;
		
		// firing
		if(this.fireWait <= 0){
			if(this.firePressed){
				this.Fire();
				this.fireWait = this.reloadTime;
			}
		} else {
			this.fireWait -= deltaTime;
			if(this.fireWait < 0) this.fireWait = 0;
		}
		
		// marking
		if(this.markPressed) this.Mark();
		
		// finding an upgrade
		for(let upgrade of this.game.upgrades){
			// horizontal collision
			let dx = upgrade.position.x - this.position.x;
			let dy = upgrade.position.y - this.position.y;
			if(dx*dx + dy*dy < this.sqRad){
				switch(upgrade.type){
					case this.game.Upgrade.engine:
						this.maxSpeed *= window.upgradeFactor;
						this.maxRotateSpeed *= window.upgradeFactor;
						this.maxAcceleration *= window.upgradeFactor;
						break;
					case this.game.Upgrade.turret:
						this.maxTurretRotateSpeed *= window.upgradeFactor;
						this.maxTurretElevSpeed *= window.upgradeFactor;
						break;
					case this.game.Upgrade.reload:
						this.reloadTime /= window.upgradeFactor/1;
						break;
				}
				upgrade.Destroy();
			}
		}
	}
	Render(context){
		// hull
		DrawSpriteRotated(context, this.position, this.angle, this.hullSprite);
		// turret
		DrawSpriteRotated(context, {
			x: this.position.x + this.turretKnockBack.x,
			y: this.position.y + this.turretKnockBack.y
		}, window.MPIPI(this.angle + this.turretRelativeAngle), this.turretSprite);
		if(this.marking){
			// range circle
			context.lineWidth = 1;
			context.strokeStyle = 'blue';
			context.beginPath();
			context.arc(this.position.x, this.position.y, this.markPos.x, 0, 2 * Math.PI, false);
			context.stroke();
			// aim mark
			window.DrawLine(context, 'blue', 2, {
				x: this.position.x + (this.markPos.x - 4) * Math.cos((this.angle + this.turretRelativeAngle) * window.TO_RADIANS),
				y: this.position.y - (this.markPos.x - 4) * Math.sin((this.angle + this.turretRelativeAngle) * window.TO_RADIANS)
			}, {
				x: this.position.x + (this.markPos.x + 4) * Math.cos((this.angle + this.turretRelativeAngle) * window.TO_RADIANS),
				y: this.position.y - (this.markPos.x + 4) * Math.sin((this.angle + this.turretRelativeAngle) * window.TO_RADIANS)
			});
		}
	}
	GUIRender(context){
		if(this.marking){
			// mark
			window.DrawLine(context, 'blue', 1, {x: this.guiOrigin.x, y: this.guiOrigin.y - this.guiYScale*this.markPos.y}, {x: this.guiOrigin.x + this.guiWidth, y: this.guiOrigin.y - this.guiYScale*this.markPos.y});
			window.DrawLine(context, 'blue', 1, {x: this.guiOrigin.x + this.markPos.x, y: this.guiOrigin.y}, {x: this.guiOrigin.x + this.markPos.x, y: this.guiOrigin.y - this.guiYScale*this.guiHeight});
			context.fillStyle = 'blue';
			context.font = '12px san-serif';
			context.fillText(this.markPos.y, this.guiOrigin.x - 19, this.guiOrigin.y - this.markPos.y*this.guiYScale + 10);
		}
		// plot
		let guiYs = [];
		for(let i=0; i<this.guiXs.length; i++) guiYs[i] = this.guiYScale * window.Altitude(this.guiXs[i], this.projectileSpeed, this.turretElevation);
		context.strokeStyle = 'red';
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(this.guiOrigin.x + this.guiXs[0], this.guiOrigin.y - guiYs[0]);
		for(let i=1; i<this.guiXs.length; i++) context.lineTo(this.guiOrigin.x + this.guiXs[i], this.guiOrigin.y - guiYs[i]);
		context.stroke();
		
		// horizontal labels
		context.fillStyle = 'red';
		context.font = '12px san-serif';
		for(let i=0; i<=this.guiWidth; i+=100){
			window.DrawLine(context, 'red', 1, {x: this.guiOrigin.x + i, y: this.guiOrigin.y}, {x: this.guiOrigin.x + i, y: this.guiOrigin.y + 8});
			context.fillText(i, this.guiOrigin.x + 2 + i, this.guiOrigin.y + 12);
		}
		
		// vertical labels
		for(let i=0; i<=this.guiHeight; i+=100){
			let y = this.guiOrigin.y - i*this.guiYScale;
			window.DrawLine(context, 'black', 1, {x: this.guiOrigin.x, y: y}, {x: this.guiOrigin.x + this.guiWidth, y: y});
			if(i) context.fillText(i, this.guiOrigin.x - 19, this.guiOrigin.y - i*this.guiYScale + 10);
		}
	}
	
	Fire(){
		this.fireSound.currentTime = 0.05;
		this.fireSound.play();
		
		let fireAngle = window.MPIPI(this.angle + this.turretRelativeAngle);
		new Projectile(this.game, this.position, this.projectileSpeed, fireAngle, 1500, this.turretElevation);
		fireAngle = window.MPIPI(fireAngle + 180);
		let knockBackAmount = this.turretKnockBackRatio * this.projectileSpeed * this.projectileMass / this.turretMass/1;
		this.turretKnockBack.x = knockBackAmount * Math.cos(fireAngle * window.TO_RADIANS);
		this.turretKnockBack.y = - knockBackAmount * Math.sin(fireAngle * window.TO_RADIANS);
	}
	
	Mark(){
		let mx = window.mousePos.x;
		let my = window.mousePos.y;
		this.marking = false;
		if(mx < this.guiOrigin.x) return;
		if(mx > this.guiOrigin.x + this.guiWidth) return;
		if(my > this.guiOrigin.y) return;
		if(my < this.guiOrigin.y - this.guiHeight*this.guiYScale) return;
		this.markPos = {x: mx - this.guiOrigin.x, y: (this.guiOrigin.y - my)/this.guiYScale/1};
		this.marking = true;
	}
}
