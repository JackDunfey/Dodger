const canvas = document.getElementById("canvas");
canvas.width = 400;
canvas.height = 600;
const ctx = canvas.getContext("2d");

class Renderer{
    constructor(context){
        this.ctx = context;
    }
    setContext(context){
        this.ctx = context;
    }
    fillRect(x,y,w,h,fill=null){
        this.ctx.save();
        this.ctx.beginPath();
        if(fill)
            this.ctx.fillStyle = fill;
        this.ctx.fillRect(x,y,w,h);
        this.ctx.restore();
    }
    fillCircle(x,y,r,fill=null){
        this.ctx.save();
        this.ctx.beginPath();
        if(fill)
            this.ctx.fillStyle = fill;
        this.ctx.arc(x,y,r,0,Math.PI*2);
        this.ctx.fill();
        this.ctx.restore();
    }
    line(x0,y0,x1,y1){
        this.ctx.beginPath();
        this.ctx.moveTo(x0,y0);
        this.ctx.lineTo(x1,y1);
        this.ctx.stroke();
    }
    clearframe(){
        this.ctx.clearRect(0,0,canvas.width,canvas.height);
    }
}

class Block{
    static MAX_SPEED = 3;
    static MIN_SPEED = 1.4;
    static MAX_SIZE = 60;
    static MIN_SIZE = 15;
    constructor(x,y, speed=null){
        this.x = x;
        this.y = y;

        this.speed = speed && !isNaN(speed) && speed > 0 ? speed : Math.random()*(Block.MAX_SPEED-Block.MIN_SPEED)+Block.MIN_SPEED;
        let c = Math.round((this.speed-Block.MIN_SPEED)/(Block.MAX_SPEED-Block.MIN_SPEED) * 230).toString(16);
        while(c.toString().length < 2)
            c = "0" + c;
        this.color = `#FF${c}00`;
        this.w = this.h = (this.speed-Block.MIN_SPEED)/(Block.MAX_SPEED-Block.MIN_SPEED) * (Block.MAX_SIZE - Block.MIN_SIZE) + Block.MIN_SIZE;
    }
    update(){
        this.y += this.speed;
    }
    show(){
        // Speed controls color (rainbow gradient)
        renderer.fillRect(this.x,this.y,this.w,this.h,this.color);
        // renderer.fillCircle(this.x,this.y,this.size,this.color);
    }
}

class Player{
    constructor(x,y,w=80,h=15){
        this.x = x, this.y = y, this.w = w, this.h = h;
        this.direction = 0;
        this.health = 3;
        this.healthSymbol = String.fromCharCode(10084);
        this.healthString = new Array(this.health).fill(this.healthSymbol).join(" ");
    }
    update(){
        this.x += this.direction * 4;
    }
    checkCollision(otherRect){
        return (this.x-this.w/2) < otherRect.x + otherRect.w &&
        this.x + this.w/2 > otherRect.x &&
        this.y < otherRect.y + otherRect.h &&
        this.h + this.y > otherRect.y
    }
    show(){
        renderer.fillRect(this.x - this.w/2,this.y,this.w,this.h,"#000");
        ctx.save();
        ctx.font = "14pt Arial"
        ctx.fillStyle = "red";
        ctx.fillText(this.healthString, canvas.width - this.health * 22, 18);
        ctx.restore();
    }
}

const renderer = new Renderer(ctx);

let blocks = [new Block(50,0)];
const BLOCKS = 10;

const player = new Player(canvas.width/2,canvas.height-20);
// canvas.addEventListener("mousemove", function(e){
//     let x = e.clientX - canvas.offsetLeft;
//     let y = e.clientY - canvas.offsetTop;
//     player.x = x;
// });
window.addEventListener("keydown", function(e){
    player.direction = e.key == "ArrowRight" ? 1 : e.key == "ArrowLeft" ? -1 : 0;
});
window.addEventListener("keyup", function(e){
    player.direction = 0;
});

const oofing_frames = 20;
let oofing_counter = 0;
let oofing = false;

let score = 0;
let game = true;
function anim(){
    renderer.clearframe();
    for(let i in blocks){
        blocks[i].update();
        if(player.checkCollision(blocks[i])){
            // blocks.splice(i,1);
            blocks[i].y = -Math.random() * 100 - 50;
            oofing = true;
            if(--player.health <= 0){
                game = false;
            }
        }
        if(blocks[i].y > canvas.height){
            // blocks.splice(i,1);
            blocks[i].y = -Math.random() * 100 - 50;
            score++;
        }
        blocks[i].show();
    }
    if(blocks.length < BLOCKS){
        blocks.push(new Block(Math.random() * (canvas.width - BLOCK_W), Math.random() * -10 - 20));
    }
    if(oofing){
        if(++oofing_counter >= oofing_frames){
            oofing_counter = 0;
            oofing = false;
        }
        ctx.save();
        ctx.font = "bold 32pt Arial";
        ctx.fillText("Oof", canvas.width/2 - 32, canvas.height/2);
        ctx.restore();
    }   
    player.update();
    player.show();
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, 5, 20);
    if(!game){
        clearInterval(gameInterval);
    }
}
function init(){
    for(let i = 0; i < 10; i++){
        blocks.push(new Block(Math.random() * canvas.width, i * -60 + Math.random() * 5 - 10));
    }
    score = 0;
    game = true;
    window.gameInterval = setInterval(anim, 1000 / 60 /*fps*/);
}
init();

// class MyRenderer extends CanvasRenderingContext2D{}