import Upgrade from "/upgrade.js"

export default class Plane {
	constructor(game, path, range){
		this.game = game;
		this.game.UpdateMe(this);
		this.game.RenderMe(this);
		this.game.GUIRenderMe(this);
		
		this.position = {x: path.x, y: path.y};
		this.angle = path.bearing;
		this.altitude = path.altitude;
		
		this.life = range / path.speed/1;
		this.velocity = {x: path.speed * Math.cos(this.angle * window.TO_RADIANS), y: - path.speed * Math.sin(this.angle * window.TO_RADIANS)};
		
		this.sprite = window.MakeSprite(document.getElementById("img_plane"), 1);
		
		this.hitSound = document.getElementById("sound_hit");
		this.crashSound = document.getElementById("sound_crash");
		
		this.sqRad = 1024;
		this.verticalHalfThickness = 5;
	}
	
	Update(deltaTime){
		// moving
		this.position.x += this.velocity.x * deltaTime;
		this.position.y += this.velocity.y * deltaTime;
		
		// being hit by a projectile
		for(let projectile of this.game.projectiles){
			// horizontal collision
			let dx = projectile.position.x - this.position.x;
			let dy = projectile.position.y - this.position.y;
			if(dx*dx + dy*dy < this.sqRad){
				// vertical collison
				if(Math.abs(projectile.GetAltitude() - this.altitude) < this.verticalHalfThickness){
					projectile.Destroy();
					this.Hit();
					return;
				}
			}
		}
		
		// despawning
		this.life -= deltaTime;
		if(this.life <= 0){
			this.Destroy();
			return;
		}
	}
	Render(context){
		DrawSpriteRotated(context, this.position, this.angle, this.sprite);
	}
	GUIRender(context){
		window.DrawAltitudeLabel(context, {x: this.position.x + 22, y: this.position.y + 22}, this.altitude);
	}
	
	Hit(){
		this.hitSound.currentTime = 0;
		this.hitSound.play();
		this.crashSound.currentTime = 2;
		this.crashSound.play();
		
		new Upgrade(this.game, this.position, window.PickRandom([this.game.Upgrade.engine, this.game.Upgrade.turret, this.game.Upgrade.reload]));
		
		this.game.score += 1;
		
		this.Destroy();
	}
	
	Destroy(){
		this.game.DontUpdateMe(this);
		this.game.DontRenderMe(this);
		this.game.DontGUIRenderMe(this);
	}
}
