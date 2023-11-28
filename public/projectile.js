export default class Projectile {
	constructor(game, position, speed /*pixels per second*/, angle, range /*pixels*/, elevation /*degrees*/){
		this.game = game;
		this.game.UpdateMe(this);
		this.game.RenderMe(this);
		this.game.AddProjectile(this);
		
		this.speed = speed;
		this.velocity = {x: this.speed * Math.cos(angle * window.TO_RADIANS), y: - this.speed * Math.sin(angle * window.TO_RADIANS)};
		
		this.position = {x: position.x, y: position.y};
		this.range = range;
		this.initElevation = elevation;
		
		this.travel = 0;
		this.lastDeltaTime = 0;
	}
	
	Update(deltaTime){
		this.lastDeltaTime = deltaTime;
		
		this.position.x += this.velocity.x * deltaTime;
		this.position.y += this.velocity.y * deltaTime;
		
		this.travel += this.speed * deltaTime;
		if(this.travel > this.range) this.Destroy();
	}
	Render(context){		
		window.DrawLine(context, 'brown', 2, this.position, {
			x: this.position.x + this.velocity.x*this.lastDeltaTime,
			y: this.position.y + this.velocity.y*this.lastDeltaTime
		});
	}
	
	GetAltitude(){
		return window.Altitude(this.travel, this.speed, this.initElevation);
	}
	
	Destroy(){
		this.game.DontUpdateMe(this);
		this.game.DontRenderMe(this);
		this.game.RemoveProjectile(this);
	}
}
