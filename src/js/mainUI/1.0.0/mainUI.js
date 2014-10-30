/*!
 * mainJS 1.0.0
 * Author: Martin Pliego
 *
 * Events:
 * onWindowResize:{width: width, height: height})
 **/
define(['jquery', 'main', 'skrollr'], function ($, main, skrollr, undefined) {

    var selector = {
            sections: 'section',
            noSideKickSections: 'section:not(.sidekick-page)',
            navigation: 'nav',
            containers: 'section > .container',
            images: 'section img',
            slider: '.slides',
            sliderOne: '#page-one .slides',
            sliderTwo: '#page-three .slides',
            body: 'body',
            sidekickButtons: '.footer-buttons-left > .btn-nav-left.btn-sidekick-page',
            sideKickPages: '.sidekick-page',
            closeSideKickPages: '.sidekick-page.close',
            openSideKickPage: '.sidekick-page.open',
            sectionOne: '#page-one',
            sectionTwo: '#page-two',
            sectionThree: '#page-three',
            videoElement: '#video-element'

        },
        data = {
            window: {
                width: 0,
                height: 0
            },
            sideKick: {
                pageOpened: undefined,
                animationTime: 900,
                lastSection: undefined
            },
            scroll: {
                animationTime: 900,
                startPos: 0,
                moveNextSectionAt: 0,
                deltaFactor: 0,
                actualDelta: 1,
                animating: false
            },
            slider: {
                easing: 'easeInOutQuad',
                animationTime: 2000,
                playTimeOut: 4500
            },
            parallax: {
                element: undefined,
                constants: {
                    sectionone: 0,
                    middleonetwo: function () {
                        return (data.parallax.constants.sectionone+data.parallax.constants.sectiontwo())/2;
                    },
                    sectiontwo: function () {
                        return data.window.height;
                    },
                    middletwothree: function () {
                        return (data.parallax.constants.sectiontwo()+data.parallax.constants.sectionthree())/2;
                    },
                    sectionthree: function () {
                        return data.window.height * 2;
                    }
                }
            },
            visibleSectionsNumber: 0
        };

    /**
     * Inicio del Modulo
     * No de deberian hacer operaciones muy costosas aqui
     */
    function init() {
        data.visibleSectionsNumber = $(selector.noSideKickSections).length;
        registerInitEvents();
        $(selector.slider).superslides({
            slide_easing: data.slider.easing,
            slide_speed: data.slider.animationTime,
            play: data.slider.playTimeOut,
            pagination: false,
            hashchange: false,
            scrollable: false
        });
        onPageChanged(event, selector.sectionOne);
        initJarallax();
    }

    /**
     * Registra todos los eventos requeridos por el modulo.
     */
    function registerInitEvents() {
        main.registerEvent(main.events.onWindowResize, onWindowResize, false);
        onWindowResize('', main.getWindowDimensions());
        $(selector.sidekickButtons).click(onNavItemClick);
        main.registerEvent(main.events.onSideKickPageOpenStart, function (event, selector) {
            data.sideKick.lastSection = main.getCurrentSection();
        }, false);
        main.registerEvent(main.events.onSideKickPageOpened, function (event, selector) {
            main.changeCurrentSection(selector);
        }, false);
        main.registerEvent(main.events.onSideKickPageClosed, function (event, selector) {
            main.changeCurrentSection(data.sideKick.lastSection);
            $('a[href=' + selector + ']').removeClass('selected');
        }, false);
        /*main.registerEvent(main.events.onScrollStarted, onScrollStarted, false); */
        main.registerEvent(main.events.onScroll, onScroll, false);
        main.registerEvent(main.events.onPageChanged, onPageChanged, false);
    }

    /**
     * Window Change Event Handler.
     */
    function onWindowResize(event, obj) {
        data.window.width = obj.width;
        data.window.height = obj.height;
        var elem = $(selector.sections + ', ' + selector.containers + ', ' + selector.navigation);
        elem.css('width', obj.width);
        elem.css('height', obj.height);
        elem = $(selector.images);
        elem.attr('height', obj.height);
        elem.filter(selector.closeSideKickPages).css('left', obj.width);
    }

    /**
     * Cambia la UI en base a la posicion del scroll.
     */
    function onScrollStarted(event, obj) {
        if (!data.scroll.animating) {
            data.scroll.actualDelta = obj.deltaY;
            var $divs = $(selector.noSideKickSections);
            var top = $.grep($divs, function (item) {
                var pos = $(document).scrollTop(),
                    itemPos = Math.floor($(item).position().top),
                    itemHeight = data.window.height;
                return (obj.deltaY < 0) ? pos < itemPos && itemPos <= pos + itemHeight : pos > itemPos && itemPos >= pos - itemHeight;
            });
            if (top.length > 0) {
                main.enableScroll(false);
                var movement = Math.ceil($(top).first().position().top);
                data.scroll.animating = true;
                $('html').animate({ scrollTop: movement }, data.scroll.animationTime / Math.abs(obj.deltaY),
                    "easeOutQuint", function () {
                        data.scroll.startPos = $(document).scrollTop();

                        var $divs = $(selector.noSideKickSections);
                        var top = $.grep($divs, function (item) {
                            return $(item).position().top <= data.scroll.startPos;
                        });

                        main.enableScroll(true);
                        data.scroll.animating = false;
                    });
            }
        }
    }

    /**
     * Cambia la UI en base a la posicion del scroll.
     */
    function onScroll(event, obj) {
        var winTop = $(document).scrollTop();
        var divs = $(selector.noSideKickSections);
        var top = $.grep(divs, function (item) {
            return $(item).position().top <= winTop;
        });
        if (top.length > 0) {
            main.changeCurrentSection('#' + $(top[top.length - 1]).attr('id'));
        }
    }


    /**
     * Nav Button click handler.
     * @param event click event.
     */
    function onNavItemClick(event) {
        event.preventDefault();
        var elem = $(event.target),
            href = elem.attr('href');
        if (data.sideKick.pageOpened == undefined) {
            elem.addClass('selected');
            openSideKickPage(href);
        } else if (href == data.sideKick.pageOpened) {
            closeSideKickPage();
        } else {
            elem.addClass('selected');
            main.registerEvent(main.events.onSideKickPageClosed, function () {
                openSideKickPage(href);
            }, true);
            closeSideKickPage();
        }
    }

    /**
     * Abre una ventana agena al sitio.
     * @param pageId el id de la pagina(section) a abrir.
     */
    function openSideKickPage(pageId) {
        var page = $(pageId).first();
        if (page.length > 0) {
            if (data.sideKick.pageOpened == undefined || pageId != data.sideKick.pageOpened) {
                main.enableScroll(false);
                data.sideKick.pageOpened = pageId;
                main.triggerEvent(main.events.onSideKickPageOpenStart, pageId);
                page.css('left', data.window.width + 'px');
                page.finish().animate({
                    left: "0px"
                }, data.sideKick.animationTime, "easeOutQuint", function () {
                    page.removeClass('close').addClass('open');
                    main.triggerEvent(main.events.onSideKickPageOpened, pageId);
                    main.triggerEvent(main.events.onPageChanged, pageId);
                });
            }
        }
    }


    function closeSideKickPage() {
        if (data.sideKick.pageOpened != undefined) {
            var page = $(data.sideKick.pageOpened),
                dimensions = main.getWindowDimensions();
            main.triggerEvent(main.events.onSideKickPageCloseStart, '#' + page.attr('id'));
            page.finish().animate({
                left: dimensions.width + "px"
            }, data.sideKick.animationTime, "easeOutQuint", function () {
                page.removeClass('open').addClass('close');
                var pageOpened = data.sideKick.pageOpened;
                data.sideKick.pageOpened = undefined;
                main.enableScroll(true);
                main.triggerEvent(main.events.onSideKickPageClosed, pageOpened);

            });
        }
    }

    function onPageChanged(event, sectionId) {
        if (sectionId == selector.sectionOne) {
            playVideo(true);
            $(selector.sectionTwo + ' .slides').superslides('stop');
            $(selector.sectionThree + ' .slides').superslides('stop');
        } else if (sectionId == selector.sectionTwo) {
            playVideo(false);
            $(selector.sectionTwo + ' .slides').superslides('start');
            $(selector.sectionThree + ' .slides').superslides('stop');
        } else if (sectionId == selector.sectionThree) {
            playVideo(false);
            $(selector.sectionTwo + ' .slides').superslides('stop');
            $(selector.sectionThree + ' .slides').superslides('start');
        } else {
            $(selector.sectionOne + ' .slides').superslides('stop');
            playVideo(false);
            $(selector.sectionThree + ' .slides').superslides('stop');
        }
    }

    function playVideo(status) {
        try {
            if (status) {
                $(selector.videoElement).get(0).play();
            } else {
                $(selector.videoElement).get(0).pause();
            }
        } catch (e) {
        }
    }

    function initJarallax() {
        data.parallax.constants.element = skrollr.init({constants: data.parallax.constants,forceHeight:false});
    }

    init();
    return {
        selector: selector
    };
});