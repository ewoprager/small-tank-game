export default class Upgrade {
	constructor(game, position, type){
		this.game = game;
		this.position = {x: position.x, y: position.y};
		this.type = type;
		
		this.game.UpdateMe(this);
		this.game.RenderMe(this);
		this.game.AddUpgrade(this);
		
		this.sprite = window.MakeSprite(document.getElementById("img_upgrade"), 1);
		
		this.sqRad = 64;
		
		this.label = false;
	}
	
	Update(deltaTime){
		let dx = window.mousePos.x - this.position.x;
		let dy = window.mousePos.y - this.position.y;
		this.label = (dx*dx + dy*dy < this.sqRad);
	}
	
	Render(context){
		context.drawImage(this.sprite.img, this.position.x - this.sprite.ox, this.position.y - this.sprite.oy);
		if(this.label) window.DrawAltitudeLabel(context, this.position, this.type);
	}
	
	Destroy(){
		this.game.DontUpdateMe(this);
		this.game.DontRenderMe(this);
		this.game.RemoveUpgrade(this);
	}
}
