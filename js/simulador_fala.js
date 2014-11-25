(function (undefined) {
  "use strict";
  
  var root = this;

 
  var SpeechRecognition = root.SpeechRecognition ||
                          root.webkitSpeechRecognition ||
                          root.mozSpeechRecognition ||
                          root.msSpeechRecognition ||
                          root.oSpeechRecognition;

  if (!SpeechRecognition) {
    root.voz = null;
    return undefined;
  }

  var commandsList = [];
  var recognition;
  var callbacks = { start: [], error: [], end: [], result: [], resultMatch: [], resultNoMatch: [], errorNetwork: [], errorPermissionBlocked: [], errorPermissionDenied: [] };
  var autoRestart;
  var lastStartedAt = 0;
  var debugState = false;
  var debugStyle = 'font-weight: bold; color: #00f;';

  var optionalParam = /\s*\((.*?)\)\s*/g;
  var optionalRegex = /(\(\?:[^)]+\))\?/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#]/g;
  var commandToRegExp = function(command) {
    command = command.replace(escapeRegExp, '\\$&')
                  .replace(optionalParam, '(?:$1)?')
                  .replace(namedParam, function(match, optional) {
                    return optional ? match : '([^\\s]+)';
                  })
                  .replace(splatParam, '(.*?)')
                  .replace(optionalRegex, '\\s*$1?\\s*');
    return new RegExp('^' + command + '$', 'i');
  };

  var invokeCallbacks = function(callbacks) {
    callbacks.forEach(function(callback) {
      callback.callback.apply(callback.context);
    });
  };

  var initIfNeeded = function() {
    if (!isInitialized()) {
      root.voz.init({}, false);
    }
  };

  var isInitialized = function() {
    return recognition !== undefined;
  };

  root.voz = {
    init: function(commands, resetCommands) {

      if (resetCommands === undefined) {
        resetCommands = true;
      } else {
        resetCommands = !!resetCommands;
      }

      if (recognition && recognition.abort) {
        recognition.abort();
      }

      recognition = new SpeechRecognition();
      recognition.maxAlternatives = 15; //Maximo de alternativas
      recognition.continuous = root.location.protocol === 'http:';
      recognition.lang = 'pt-BR';

      recognition.onstart   = function()      { invokeCallbacks(callbacks.start); };
      recognition.onerror   = function(event) {
        invokeCallbacks(callbacks.error);
        switch (event.error) {
        case 'network':
          invokeCallbacks(callbacks.errorNetwork);
          break;
        case 'not-allowed':
        case 'service-not-allowed':
          autoRestart = false;
          if (new Date().getTime()-lastStartedAt < 200) {
            invokeCallbacks(callbacks.errorPermissionBlocked);
          } else {
            invokeCallbacks(callbacks.errorPermissionDenied);
          }
          break;
        }
      };

      recognition.onend = function() {
        invokeCallbacks(callbacks.end);
        if (autoRestart) {
          var timeSinceLastStart = new Date().getTime()-lastStartedAt;
          if (timeSinceLastStart < 1000) {
            setTimeout(root.voz.start, 1000-timeSinceLastStart);
          } else {
            root.voz.start();
          }
        }
      };

      recognition.onresult = function(event) {
        invokeCallbacks(callbacks.result);
        var results = event.results[event.resultIndex];
        var commandText;
        for (var i = 0; i< results.length; i++) { // Comandos Retornados
          commandText = results[i].transcript.trim();
          if (debugState) {
            root.console.log('Frase Reconhecida: %c'+commandText, debugStyle);
          }

          // try and match recognized text to one of the commands on the list
          for (var j = 0, l = commandsList.length; j < l; j++) {
            var result = commandsList[j].command.exec(commandText);
            if (result) {
              var parameters = result.slice(1);
              if (debugState) {
                root.console.log('Comando encontrado: %c'+commandsList[j].originalPhrase, debugStyle);
                if (parameters.length) {
                  root.console.log('com parametros', parameters);
                }
              }
              // execute the matched command
              commandsList[j].callback.apply(this, parameters);
              invokeCallbacks(callbacks.resultMatch);
              return true;
            }
          }
        }
        invokeCallbacks(callbacks.resultNoMatch);
        return false;
      };

      if (resetCommands) {
        commandsList = [];
      }
      if (commands.length) {
        this.addCommands(commands);
      }
    },

    start: function(options) {
      initIfNeeded();
      options = options || {};
      if (options.autoRestart !== undefined) {
        autoRestart = !!options.autoRestart;
      } else {
        autoRestart = true;
      }
      lastStartedAt = new Date().getTime();
      recognition.start();
    },

    abort: function() {
      autoRestart = false;
      if (isInitialized) {
        recognition.abort();
      }
    },

    debug: function(newState) {
      if (arguments.length > 0) {
        debugState = !!newState;
      } else {
        debugState = true;
      }
    },

    setLanguage: function(language) {
      initIfNeeded();
      recognition.lang = language;
    },

    addCommands: function(commands) {
      var cb,
          command;

      initIfNeeded();

      for (var phrase in commands) {
        if (commands.hasOwnProperty(phrase)) {
          cb = root[commands[phrase]] || commands[phrase];
          if (typeof cb !== 'function') {
            continue;
          }
          command = commandToRegExp(phrase);

          commandsList.push({ command: command, callback: cb, originalPhrase: phrase });
        }
      }
      if (debugState) {
        root.console.log('Comandos carregados: %c'+commandsList.length, debugStyle);
      }
    },


    removeCommands: function(commandsToRemove) {
      if (commandsToRemove === undefined) {
        commandsList = [];
        return;
      }
      commandsToRemove = Array.isArray(commandsToRemove) ? commandsToRemove : [commandsToRemove];
      commandsList = commandsList.filter(function(command) {
        for (var i = 0; i<commandsToRemove.length; i++) {
          if (commandsToRemove[i] === command.originalPhrase) {
            return false;
          }
        }
        return true;
      });
    },

    addCallback: function(type, callback, context) {
      if (callbacks[type]  === undefined) {
        return;
      }
      var cb = root[callback] || callback;
      if (typeof cb !== 'function') {
        return;
      }
      callbacks[type].push({callback: cb, context: context || this});
    }
  };

}).call(this);