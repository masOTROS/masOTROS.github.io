/*!
 * mainJS 1.0.0
 * Author: Martin Pliego
 *
 * Events:
 * onWindowResize:{width: width, height: height})
 **/
define(['jquery', 'mousewheel'], function ($, main ,mousewheel, undefined) {
    var scrollTimer;
    var events = {
            onWindowResize: 'onWindowResize',
            onSideKickPageOpenStart: 'onSideKickPageOpenStart',
            onSideKickPageOpened: 'onSideKickPageOpened',
            onSideKickPageClosed: 'onSideKickPageClosed',
            onSideKickPageCloseStart: 'onSideKickPageCloseStart',
            onPageChanged: 'onPageChanged',
            onPageChangeStart: 'onPageChangeStart',
            onMapOpenStart: 'onMapOpenStart',
            onMapOpened: 'onMapOpened',
            onMapClosed: 'onMapClosed',
            onMapCloseStart: 'onMapCloseStart',
        },
        selector = {
            eventRepository: document,
            navigation: 'nav'
        },
        data = {
            windowDim: {
                width: undefined,
                height: undefined,
                scrollPos: 0
            },
            scroll: {
                enabled: true,
                active: false,
                finishWaitTime: 1000
            },
            currentSectionId: undefined
        };

    /**
     * Inicio del Modulo
     * No de deberian hacer operaciones muy costosas aqui
     */
    function init() {
        $(window).resize(getWindowDimensions);
        $(document).scrollTop(0);
        getWindowDimensions();
        $(document).mousewheel(onWindowScroll);
        registerInitEvents();
    }

    /**
     * Registra todos los eventos requeridos por el modulo.
     */
    function registerInitEvents() {
        registerEvent(events.onSideKickPageOpened, function () {
            data.shouldScroll = false;
        }, false);
        registerEvent(events.onSideKickPageClosed, function () {
            data.shouldScroll = true;
        }, false);
    }

    /**
     * Notifica un evento.
     * @param name nombre del evento.
     * @param obj informacion adicional referente al evento.
     */
    function triggerEvent(name, obj) {
        $(selector.eventRepository).trigger(name, obj);
    }

    /**
     * Registra un evento.
     * @param name nombre del evento.
     * @param callback funcion que se llamara al producirse el evento.
     * @param once en el caso de que se deba invocar una sola vez.
     */
    function registerEvent(name, callback, once) {
        var elem = $(window);
        if (once) {
            elem.one(name, callback);
        } else {
            elem.on(name, callback);
        }
    }

    /**
     * Controla los eventos posibles de scroll.
     *
     * @param event que incluye la logica de scroll deltaX, deltaY, deltaFactor.
     */
    function onWindowScroll(event) {
        if (data.scroll.enabled) {
            if (!data.scroll.active) {
                data.scroll.active = true;
                    if (event.deltaY == -1){ 
                        if($(window).scrollTop() >= $('#page-one').offset().top && $(window).scrollTop() < $('#page-two').offset().top){
                            jumpToSection('#page-two');
                        }
                       // else if($(window).scrollTop() >= $('#page-two').offset().top && $(window).scrollTop() < $('#page-three').offset().top){
                         //   jumpToSection('#page-three');
                       // }
                    } else if(event.deltaY == 1){
                        if($(window).scrollTop() >= $('#page-two').offset().top){
                            jumpToSection('#page-one');
                        }
                     //   else if($(window).scrollTop() >= $('#page-three').offset().top){
                      //      jumpToSection('#page-two');
                       // }
                    }
                clearTimeout(scrollTimer);
                scrollTimer=setTimeout(function () {
                    data.scroll.active = false;
                }, data.scroll.finishWaitTime);
            }
        }
        event.stopPropagation();
        event.preventDefault();

    }

    function jumpToSection(section){
        $('html,body').animate({scrollTop: $(section).offset().top},data.scroll.finishWaitTime);
        changeCurrentSection(section);
    }

    /**
     *
     * @param status (true) si
     */
    function enableScroll(status) {
        data.scroll.enabled = (status) ? true : false;
    }

    /**
     * Facilita la logica de recoleccion de las dimenciones de la pantalla.
     * @returns {{width: *, height: *}}
     */
    function getWindowDimensions() {
        var windowElem = $(window),
            dimensions = {
                width: windowElem.width(),
                height: windowElem.height()
            };
        if (dimensions.width != data.windowDim.width || dimensions.height != data.windowDim.height) {
            data.windowDim = dimensions;
            triggerEvent(events.onWindowResize, dimensions);
        }
        return dimensions;
    }

    /**
     * Obtiene el id de la seccion actual.
     * @return id de la seccion actual.
     */
    function getCurrentSection() {
        return data.currentSectionId;
    }

    /**
     * Establece el id de la seccion actual.
     * @param sectionId ID de la sección Actual.
     */
    function changeCurrentSection(sectionId) {
        if(sectionId!=data.currentSectionId){
            data.currentSectionId = sectionId;
            triggerEvent(events.onPageChanged,sectionId);
        }
    }

    init();
    return {
        events: events,
        registerEvent: registerEvent,
        triggerEvent: triggerEvent,
        getWindowDimensions: getWindowDimensions,
        getCurrentWebsite: getWindowDimensions,
        enableScroll: enableScroll,
        getCurrentSection: getCurrentSection,
        changeCurrentSection: changeCurrentSection,
        jumpToSection: jumpToSection
    };
});