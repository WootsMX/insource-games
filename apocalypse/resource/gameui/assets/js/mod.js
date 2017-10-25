'use strict';

function randomString( length )
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

$.fn.extend({
    animateCss: function (animationName, callback) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);

            if ( typeof callback == 'function' )
                callback( $(this) );
        });
    }
});

var modUi = {};

modUi.writing = false;
modUi.writingTimer = null;
modUi.previewSoundId = -1;

/**
 * Preparamos la interfaz
 */
modUi.loaded = function() {
    //ui.setBackgroundVideo('scp173.webm');
    //ui.emitBackgroundMusic('SCP Ost [Menu Test01].wav');

    //engine.emitSound('Misc.MainUI');
    
    $('body').on('mouseenter', 'a', function() {
        //ui.emitSound('ui/ui_menu_button_beep_06.wav');
        ui.emitSound('ui/ui_menu_button_click_24.wav');        
    });

    $('body').on('click', 'a', function() {
        ui.emitSound('ui/ui_menu_button_beep_13.wav');
    });

    // Acciones
    $('body').on('click', '[data-action]', modUi.action );

    // Mostrar sección del menú
    $('body').on('click', '[data-section]', modUi.section );

    // Selección de modo de juego
    $('body').on('click', '[data-gamemode]', modUi.gamemode );

    // Empezar juego
    $('body').on('click', '#start-game-button', modUi.startGame );

    // Vista previa de la configuración de sonido
    $('#volume, #music-volume').change( modUi.previewSound );

    $('[data-close-window]').click(function() {
        let element = $(this).data('close-window');
        modUi.closeWindow( element );
    });

    $('[data-open-window]').click(function() {
        let element = $(this).data('open-window');
        modUi.openWindow( element );
    });

    // Texto de ayuda
    $('[data-help]').each(function() {
        let type = $(this).prop('tagName');

        if ( type == 'INPUT' || type == 'TEXTAREA' || type == 'SELECT' ) {
            $(this).focus( modUi.showHelp );
        }
        else {
            $(this).mouseenter( modUi.showHelp );
        }
    });

    modUi.consoleEffect('#console');
};

/**
 * Crea y carga los componentes para Vue
 */
modUi.createComponents = async function() {
    // Componentes principales
    await ui.component('main-menu', {});
    await ui.component('loading', {});
    await ui.component('paused-menu', {});
};

/**
 * Crea un efecto de escritura en consola
 */
modUi.consoleEffect = function( element ) {
    // Guardamos el contenido
    let content = $( element ).text();

    // Lo vaciamos
    $( element ).html('');

    modUi.writing = true;
    modUi.writingTimer = setInterval(function() {
        let character = content[0];

        if ( character == '\\' ) {
            character = '<br>';
        }

        $( element ).append( character );
        content = content.substring(1); 

        $('.console').scrollTop(20000);        

        if ( content.length == 0 ) {
            clearInterval( modUi.writingTimer );
            modUi.writing = false;
        }
    }, 15);
};

/**
 * [injectInConsole description]
 */
modUi.injectInConsole = function( text, speed ) {
    // Ya estabamos escribiendo, limpiamos
    if ( modUi.writing ) {
        clearInterval( modUi.writingTimer );
    }

    $('#console').html( '' ).scrollTop(20000);

    text = '> ' + text + '\\';

    modUi.writing = true;
    modUi.writingTimer = setInterval(function() {
        let character = text[0];

        if ( character == '\\' ) {
            character = '<br>';
        }

        $('#console').append( character ).scrollTop(20000);
        text = text.substring(1);        

        if ( text.length == 0 ) {
            clearInterval( modUi.writingTimer );
            modUi.writing = false;
        }
    }, speed); 
};

/**
 * Muestra el texto de ayuda en la "consola"
 */
modUi.showHelp = function() {
    let text = $(this).data('help');
    let translated = engine.translate( text );

    if ( text != translated )
        text = translated;

    modUi.injectInConsole( text, 20 );
};

/**
 * Abre una ventana modal
 */
modUi.openWindow = function( element ) {
    $(element).show().animateCss('bounceIn');
};

/**
 * Cierra una ventana modal
 */
modUi.closeWindow = function( element ) {
    $(element).animateCss('bounceOut', function(el) {
        el.hide();
    });
};

/**
 * Comienzo del juego
 */
modUi.startGame = function() {
    // 
    let seed = $('#gameseed').val();
    let gameSeed = '';

    // Debe haber una seed, sí o sí
    if ( seed.length == 0 ) {
        seed = randomString(6);
    } 

    // Transformamos cada caracter a su valor unicode
    for ( let it = 0; it < seed.length; ++it ) {
        let char = seed[it];
        gameSeed += char.charCodeAt(0);
    }

    // Establecemos la seed
    engine.command('sv_gameseed ' + gameSeed);

    // Mostramos la pantalla de carga
    ui.loading.type = 'fullscreen';

    // En 100ms empezamos a cargar
    setTimeout(function() {
        engine.command('map test_173');
    }, 500);
};

/**
 * [previewSound description]
 * @return {[type]} [description]
 */
modUi.previewSound = function() {
    let type = $(this).attr('id');

    setTimeout(function() {       
        // Paramos el sonido de prueba anterior
        if ( modUi.previewSoundId > 0 )
            engine.stopSound( modUi.previewSoundId );

        // Volumen del juego
        if ( type == 'volume' ) {
            modUi.previewSoundId = engine.emitSound('SCP173.TestSound');
        }
        else {
            modUi.previewSoundId = engine.emitSound('SCP173.TestMusic');
        }  
    }, 100);
   
};

/** 
 * Ejecuta una acción
 */
modUi.action = function() {
    let action = $(this).data('action');

    if ( action == 'quit' ) {

    }

    if ( action == 'reload' ) {
        document.location.reload();        
    }
};

/**
 * Hace visible una sección del menú
 */
modUi.section = function() {
    let section = $(this).data('section');

    $('.panel-content section').hide();
    $('.panel-content #' + section).show();

    if ( section == 'start-game' ) {
        $('.mode-select').show();
        $('.game-config').hide();
        $('#gameseed').val( randomString(6) );
    }
};

/** 
 * Se ha selccionado un modo de juego
 */
modUi.gamemode = function() {
    let gamemode = $(this).data('gamemode');
    let multiplayer = $(this).data('multiplayer');

    // Establecemos el modo de juego
    engine.command('sv_gamemode ' + gamemode);

    // 
    $('[data-visible]').hide();

    // Hacemos visible los campos de multijugador
    if ( multiplayer ) {
        $('[data-visible="multiplayer"]').show();
        engine.command('sv_lan 0');
    }
    else {
        engine.command('sv_lan 1');
    }

    $('.mode-select').hide();
    $('.game-config').show();
};