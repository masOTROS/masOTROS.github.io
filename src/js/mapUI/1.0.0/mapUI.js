/*!
 * mainJS 1.0.0
 * Author: Martin Pliego
 *
 * Events:
 * onWindowResize:{width: width, height: height})
 **/
define(['jquery', 'bindFirst' , 'main'], function ($, bindFirst, main, undefined) {
        var selector = {
                pageId: '#page-contact',
                container: '.map-container',
                sidekickButtons: 'nav > .footer-buttons-left > a'
            },
            data = {
                animationTime: 1000,
                clickedElem: undefined,
                mapOptions: {
                    center: new google.maps.LatLng(-34.588563, -58.426555),
                    zoom: 17,
                    styles:undefined
                },
                mapElement: undefined,
                markerOptions: {
                    position: new google.maps.LatLng(
                        -34.588563, -58.426555
                    ),
                    map: undefined,
                    icon: 'img/icons/map_marker.png'
                },
                markerElement: undefined,
                mapStyles: [
                    {
                        "featureType": "landscape.natural",
                        "stylers": [
                            { "color": "#313131" }
                        ]
                    },{
                        "featureType": "road",
                        "elementType": "geometry",
                        "stylers": [
                            { "color": "#1e1e1e" }
                        ]
                    },{
                        "elementType": "labels.text",
                        "stylers": [
                            { "color": "#777777" },
                            { "weight": 0.1 },
                            { "lightness": -4 }
                        ]
                    },{
                        "elementType": "labels.icon",
                        "stylers": [
                            { "visibility": "off" }
                        ]
                    },{
                        "featureType": "poi",
                        "stylers": [
                            { "visibility": "off" }
                        ]
                    },{
                    }
                ]
            }

        /**
         * Inicio del Modulo
         * No de deberian hacer operaciones muy costosas aqui
         */
        function init() {
            main.registerEvent(main.events.onSideKickPageOpened, onWindowOpen, false);
            main.registerEvent(main.events.onMapClosed, function () {
                $(data.clickedElem).trigger('click');
            });
            main.registerEvent(main.events.onMapOpened, initMap, true);
        }

        /**
         * Cuando se abre la hoja de contacto
         * se deberia abrir el mapa.
         */
        function onWindowOpen(event, pageId) {
            if (pageId == selector.pageId) {
                var mapContainer = $(selector.container);
                overrideClick(true);
                main.triggerEvent(main.events.onMapOpenStart, pageId);
                mapContainer.css("display", "none").css("visibility", "visible").css("height", "35%");
                mapContainer.finish().animate({
                    height: "toggle"
                }, data.animationTime, "easeOutQuint", function () {
                    main.triggerEvent(main.events.onMapOpened, pageId);
                });
            }
        }

        /**
         * Cuando se cierra la hoja de contacto
         * se deberia cerrar el mapa.
         */
        function onWindowClose(event, pageId) {
            if (pageId == selector.pageId) {
                var mapContainer = $(selector.container);
                main.triggerEvent(main.events.onMapCloseStart, pageId);
                mapContainer.finish().animate({
                    height: "toggle"
                }, data.animationTime, "easeInQuad", function () {
                    mapContainer.css("visibility", "hidden");
                    overrideClick(false);
                    main.triggerEvent(main.events.onMapClosed, pageId);
                });
            }
        }

        function overrideClick(status) {
            var elem = $(selector.sidekickButtons);
            if (status) {
                elem.bindFirst('click', onOverrideClick);
            } else {
                elem.unbind('click', onOverrideClick);
            }

        }

        function onOverrideClick(event) {
            data.clickedElem = event.target;
            onWindowClose({}, selector.pageId);
            event.stopImmediatePropagation();
            event.preventDefault();
        }

        function initMap() {
            data.mapOptions.styles =  data.mapStyles
            data.mapElement = new google.maps.Map($(selector.container).get(0), data.mapOptions);
            data.markerOptions.map = data.mapElement;
            data.markerElement = new google.maps.Marker(data.markerOptions);

        }

        init();
        return {

        };
    }
)
;