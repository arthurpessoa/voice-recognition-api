/*
* Controlador
*/

if (voz) {

  //Definir uma linguagem
  voz.debug(true);
  voz.setLanguage('pt-BR');

  // Definir os comandos
  var commands = {
    '(robô) (mova) (para) (a) posição :x(X) :y(Y) ': function(x,y) {
      robot.move(x,y);
    },
    'Desligar': function() {
      voz.abort();
      
    }
  };
  	// Add our commands to voz
	 voz.addCommands(commands);

  	// Start listening.
  	voz.start();

	window.onbeforeunload = function (event) {
	    voz.abort();
	};
}
