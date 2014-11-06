/*!
 * mainJS 1.0.0
 * Author: Martin Pliego
 *
 * Events:
 * onWindowResize:{width: width, height: height})
 **/
define(['jquery', 'main', 'skrollr'], function ($, main, skrollr, undefined) {
    moveToSection("#section-one");
    moveToSection("#section-two");
    var selector = {
            sections: 'section',
            noSideKickSections: 'section:not(.sidekick-page)',
            navigation: 'nav',
            containers: 'section > .container',
            images: 'section img',
            slider: '.slides',
            body: 'body',
            sidekickButtons: '.footer-buttons-left > .btn-nav-left.btn-sidekick-page',
            sideKickPages: '.sidekick-page',
            closeSideKickPages: '.sidekick-page.close',
            openSideKickPage: '.sidekick-page.open',
            sectionOne: '#page-one',
            sectionTwo: '#page-two',
            sectionThree: '#page-three',
            loopElement: '#loop-element',
            reelElement: '#reel-element',
            navBar : '#navbar'

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
        elem.css('visibility', 'visible');
        elem = $(selector.images);
        elem.attr('height', obj.height);
        elem.filter(selector.closeSideKickPages).css('left', obj.width);
    }


    /**
     * Nav Button click handler.
     * @param event click event.
     */
    function onNavItemClick(event) {
        event.preventDefault();
        var elem = $(event.target),
            href = elem.attr('href');
        itemId = selector.navBar;
        if (data.sideKick.pageOpened == undefined) {
            elem.addClass('selected');
            openSideKickPage(href, itemId);
        } else if (href == data.sideKick.pageOpened) {
            closeSideKickPage(itemId);
        } else {
            elem.addClass('selected');
            main.registerEvent(main.events.onSideKickPageClosed, function () {
                openSideKickPage(href);
            }, true);
            closeSideKickPage(itemId);
        }
    }

    /**
     * Abre una ventana agena al sitio.
     * @param pageId el id de la pagina(section) a abrir.
     */
    function openSideKickPage(pageId, itemId) {
        var page = $(pageId).first();
        if (page.length > 0) {
            if (data.sideKick.pageOpened == undefined || pageId != data.sideKick.pageOpened) {
                main.enableScroll(false);
                $(itemId).addClass("disabled");
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


    function closeSideKickPage(itemId) {
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
                $(itemId).removeClass("disabled");
                main.triggerEvent(main.events.onSideKickPageClosed, pageOpened);
            });
        }
    }

    function onPageChanged(event, sectionId) {
        if (sectionId == selector.sectionOne) {
            playVideo(true,"loopElement");
            $(selector.sectionTwo + ' .slides').superslides('stop');
            playVideo(false, "reelElement");
        } else if (sectionId == selector.sectionTwo) {
            playVideo(false,"loopElement");
            $(selector.sectionTwo + ' .slides').superslides('start');
            playVideo(false, "reelElement");
        } else if (sectionId == selector.sectionThree) {
            playVideo(false,"loopElement");
            $(selector.sectionTwo + ' .slides').superslides('stop');
            playVideo(true, "reelElement");
        } else {
            playVideo(false,"loopElement");
            $(selector.sectionTwo + ' .slides').superslides('stop');
            playVideo(false, "reelElement");
        }
    }

    function playVideo(status,element) {
        try {
            if(element == "loopElement"){
                if (status) {
                    $(selector.loopElement).get(0).play();
                } else {
                    $(selector.loopElement).get(0).pause();
                }
            } else{
                if (status) {
                    $(selector.reelElement).get(0).play();
                } else {
                    $(selector.reelElement).get(0).pause();
                }
            }
        } catch (e) {
        }
    }

    function moveToSection(section){
        var nextSection = $(section).data("section");
        $(section).click(function(){
            main.jumpToSection(nextSection);
        });
    }
    function initJarallax() {
        data.parallax.constants.element = skrollr.init({constants: data.parallax.constants,forceHeight:false});
    }

    init();
    return {
        selector: selector
    };
});