'use strict';

var ui = {};

/**
 * Música de fondo
 * @type {Audio}
 */
ui.backgroundMusic = null;

/**
 * Información del jugador directo de la API de Steam
 * @type {Object}
 */
ui.playerinfo = {};

/**
 * Componentes
 * @type {Object}
 */
ui.components = {};

/**
 * Objeto Vue
 * @type {Object}
 */
ui.vue = null;

ui.dragging = null;

/**
 * Información de la carga del nivel
 * @type {Object}
 */
ui.loading = {
    type: 'none',
    levelName: 'Unknown',
    progress: 0,
    statusText: 'Comenzando la carga...',
    error: false,
    failureReason: '',
    extendedReason: ''
};

/**
 * Preparamos la interfaz
 */
ui.loaded = function() {
    // Cargamos la información del jugador
    ui.loadPlayer();

    // Resize
    $(window).on('resize', ui.resize);
    ui.resize();
};

/**
 * Reedimensión de pantalla
 */
ui.resize = function() {
    var width = $(window).width();
    var height = $(window).height();
    $('body').width( width ).height( height );
};

/**
 * Carga la información del jugador
 */
ui.loadPlayer = function() {
    // Obtenemos la información mediante la API en XML
    $.get('http://steamcommunity.com/profiles/' + steam.playerID + '/?xml=1').done(function(response) {
        response = $(response);

        // Establecemos la información del jugador
        ui.playerinfo.steamid = response.find('steamID64').text();
        ui.playerinfo.onlineState = response.find('onlineState').text();
        ui.playerinfo.avatarIcon = response.find('avatarIcon').first().text();
        ui.playerinfo.avatarMedium = response.find('avatarMedium').first().text();
        ui.playerinfo.avatarFull = response.find('avatarFull').first().text();
        ui.playerinfo.vacBanned = response.find('vacBanned').text();
        ui.playerinfo.tradeBanState = response.find('tradeBanState').text();
        ui.playerinfo.isLimitedAccount = response.find('isLimitedAccount').text();

        // Creamos los componentes 
        ui.createComponents();        
    });
};

/**
 * Crea cualquier escucha por eventos
 */
ui.createListeners = function() {
    $('[data-command]').each(function() {
        let type = $(this).attr('type');
        let command = $(this).data('command');
        let value = engine.getCommand( command );

        $(this).val( value );
    });

    // Cualquier cambio en estos atributos lo aplicamos
    // al motor.
    $('[data-command]').change(function() {
        let command = $(this).data('command');
        let value = $(this).val();

        engine.command( command + ' ' + value );
    });

    // Traducimos desde el motor
    $('[data-translate]').each(function() {
        let string = $(this).data('translate');

        if ( string.length == 0 )
            string = $(this).text();

        let value = engine.translate( string );

        $(this).text( value );
    });

    /*
    Ivan: Esto no esta funcionando correctamente, el evento
    mouseup a veces no se captura.
    $('body').mousemove(function(e) {
        if ( ui.dragging ) {
            ui.dragging.offset({
                top: e.pageY,
                left: e.pageX
            });
        }
    });

    $('[data-draggable]').mousedown(function(e) {
        ui.dragging = $(this);
        console.log('mousedown');
    });

    $('[data-draggable]').mouseup(function(e) {
        ui.dragging = null;
        console.log('mouseup');
    });
    */

    // Transformamos los <select> con esta librería
    $('select').selectric();
};

/**
 * Crea y carga los componentes para Vue
 */
ui.createComponents = async function() {
    // Componentes del mod
    await modUi.createComponents();

    // Implementamos Vue.js
    ui.vue = new Vue({
        el: '#gameui',
        components: ui.components,
    });

    // Actualizamos la información del juego, steam y el jugador
    // en los componentes cada segundo
    setInterval(function() {
        for ( var it in ui.vue.$refs ) {
            if ( typeof ui.vue.$refs[it].steam == 'object' )
                ui.vue.$refs[it].steam = $.extend({}, steam);
            if ( typeof ui.vue.$refs[it].player == 'object' )
                ui.vue.$refs[it].player = $.extend({}, player);
            if ( typeof ui.vue.$refs[it].game == 'object' )
                ui.vue.$refs[it].game = $.extend({}, game);
            if ( typeof ui.vue.$refs[it].loading == 'object' )
                ui.vue.$refs[it].loading = $.extend({}, ui.loading);
        }
    }, 300);

    // Cargamos el ModUI
    modUi.loaded();

    // La plantilla ya se ha renderizado, hora
    // de crear los escuchas.
    ui.createListeners();
};

/**
 * Estalece el vídeo de fondo en el menú
 */
ui.setBackgroundVideo = function( file ) {
    let video = $('#background-video').get(0);

    // Establecemos el vídeo y lo reproducimos
    video.pause();
    video.src = '../../media/' + file; 
    video.play();    
};

/**
 * Estalece la música de fondo en el menú.
 * 
 * 
 */
ui.emitBackgroundMusic = function( file ) {
    if ( ui.backgroundMusic != null ) {
        ui.backgroundMusic.pause();
    }

    ui.backgroundMusic = ui.emitSound('music/' + file);
    ui.backgroundMusic.loop = true;
    ui.backgroundMusic.volume = 0.6;    
};

/**
 * Reproduce un sonido ideal para la interfaz.
 *
 * Use esta función solo si por alguna razón necesita
 * más control sobre el audio, ya que este método usa
 * la API Audio de JavaScript.
 *
 * De otra forma use la función [engine.emitSound] para
 * reproducir un SoundScript desde el motor. 
 */
ui.emitSound = function( file ) {
    let audio = new Audio();
    audio.src = '../../sound/' + file;
    audio.play();
    audio.volume = 0.2;

    return audio;
}

/**
 * Carga la plantilla especificada
 * @return {Promise}
 */
ui.template = function( name ) {
    return new Promise(resolve => {
        // Cargamos el HTML de la plantilla
        $.get( 'templates/' + name + '.html' ).done(function(response) {
            resolve( response ); 
        });  
    });
};

/**
 * Carga el contenido de un componente y lo crea.
 */
ui.component = function( name, options ) {
    if ( typeof options.data == 'undefined' )
        options.data = {};

    // Información del juego, steam y el jugador
    options.data.player     = $.extend({}, player);
    options.data.playerinfo = $.extend({}, ui.playerinfo);
    options.data.steam      = $.extend({}, steam);
    options.data.game       = $.extend({}, game);
    options.data.loading    = $.extend({}, ui.loading);

    return new Promise(resolve => {
        // Cargamos la plantilla
        ui.template( name ).then(function(template) {
            let data = options.data;

            options.template = template;
            options.data = function() { return data; }
            ui.components[name] = options;
            resolve();
        });
    });    
};

$(ui.loaded);