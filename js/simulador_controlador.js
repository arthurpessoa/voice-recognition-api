/*
* Controlador
*/

if (voz) {

  //Definir uma linguagem
  voz.debug(true);
  voz.setLanguage('pt-BR');

  // Definir os comandos
  var commands = {
    'posição 1': function() {
      robot.move(100,100);
    },
    'Desligar': function() {
      voz.abort();
      open(location, '_self').close();
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
