/*
* Arthur Pessoa de Souza
*/


//---------------------------
// Robô
//---------------------------
function Robot(){
    this.height = 50;
    this.width = 50;
    this.x = 10;
    this.y = 10;
    this.destY = this.y;
    this.destX = this.x;
    this.speed = 2;
    this.color = "#000000";

    this.setColor = function(color) {
      this.color = color;
    }

    this.setPosition = function(x, y) {
      this.x = x;
      this.y = y;
      this.destX = x;
      this.destY = y;
    }

    this.move = function(x, y) {
      this.destX = x;
      this.destY = y;
    }

    this.draw = function(ctx) {
      if(this.destY > this.y) {
        this.y += this.speed;  
      }else if(this.destY < this.y) {
        this.y -= this.speed;  
      } 

      if(this.destX > this.x) {
        this.x += this.speed;  
      }else if(this.destX < this.x) {
        this.x -= this.speed;  
      }
      ctx.fillStyle= this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    };
};

//configura o Robô
robot = new Robot();
robot.setColor("#FF0000");
robot.setPosition(200,200);



//----------------------------------------
//  Animação HTML 5 (Simulação)
//----------------------------------------
var canvas = document.getElementById('mainCanvas'),
ctx = canvas.getContext('2d');
ctx.canvas.width  = window.innerWidth  - 10;
ctx.canvas.height = window.innerHeight - 10;


function draw() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  robot.draw(ctx);
}

setInterval(draw, 1000/60); //fps