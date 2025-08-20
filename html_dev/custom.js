const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

let graphqlLink = 'https://fkk-admin-171dd88da83e.herokuapp.com/shopify';

// Global function to activate blade guards when reaching step 6
window.activateBladeGuardsOnStep6 = function() {
    const bladeGuardSection = document.querySelector('.group-info.blade-guards');
    if (bladeGuardSection && !bladeGuardSection.classList.contains('disabled') && window.appData && window.appData.bladeGuardDefaults) {
        const { firstModel, firstColor } = window.appData.bladeGuardDefaults;
        if (firstModel && firstColor) {
            // Set first color as active
            const firstColorButton = document.querySelector(`[data-model-file="${firstModel.fileName}"][data-color="${firstColor}"]`);
            if (firstColorButton) {
                // Remove all active classes first
                document.querySelectorAll('.group-info.blade-guards .color-sample').forEach(btn => {
                    btn.classList.remove('color-sample-active');
                });
                // Add active class to first color
                firstColorButton.classList.add('color-sample-active');
            }
            
            // Send to React
            const nodeMaterials = window.createBladeGuardNodeMaterials ? window.createBladeGuardNodeMaterials(firstModel, firstColor) : {};
            const modelWithColor = {
                ...firstModel,
                selectedColor: firstColor,
                nodeMaterials: nodeMaterials
            };
            
            console.log('🚀 Sending blade guard to React:', {
                fileName: firstModel.fileName,
                textFileName: firstModel.textFileName,
                selectedColor: firstColor,
                nodeMaterials: nodeMaterials,
                modelType: firstModel.modelType
            });
            
            window.appData.currentModels.bladeGuard = modelWithColor;
            if (document.shopifyConnect) {
                document.shopifyConnect.triggerBladeGuardModelChange(modelWithColor);
            }
            
            console.log('Blade Guards activated for step 6:', firstModel.textFileName, firstColor);
        }
    }
};

$(function(){
    let htmlLang = document.documentElement.lang;
    let langUrlPart = '';
    if(htmlLang === 'es') {
        langUrlPart = '/es';
    }

    let wishProperties = ['Model', 'Steel', 'Blade Geometry', 'Blade Finish', 'Handle Leather', 'Bolster', 'Pommel', 'Handle Colours', 'Laser Etching'];
    if(document.documentElement.lang === 'es') {
        wishProperties = ['Modelo', 'Acero', 'Geometría de la Hoja', 'Acabado de la Hoja', 'Espaciadores de cuero', 'Virola', 'Pomo', 'Colores del Mango', 'Grabado láser'];
    }

    let cartLabels = {
        'addToCart': 'Add to cart',
        'remove': 'Remove',
        'close': 'Close',
        'cart': 'Cart',
        'checkout': 'Checkout',
        'subtotal': 'Subtotal',
        'wishlist': 'Wishlist',
    }
    if(document.documentElement.lang === 'es') {
        cartLabels = {
            'addToCart': 'Añadir al carrito',
            'remove': 'Eliminar',
            'close': 'Cerrar',
            'checkout': 'Finalizar compra',
            'subtotal': 'Subtotal',
            'cart': 'Carrito',
            'wishlist': 'Lista de deseos',
        }
    }

    let filterLabelsEs = {
        'small': 'Pequeño',
        'medium': 'Mediano',
        'large': 'Grande',
        'chopping and dicing': 'Cortar y picar',
        'dining': 'Comer',
        'filleting': 'Filetear',
        'mincing': 'Picar finamente',
        'peeling': 'Pelar',
        'slicing': 'Rebanar',
        'shucking': 'Desconchar',
        'spreading': 'Untar',
        'trimming': 'Recortar',
        'baked': 'Horneado',
        'fish': 'Pescado',
        'fruit and vegetables': 'Frutas y verduras',
        'meat': 'Carne',
        'black': 'Negro',
        'blue': 'Azul',
        'brown': 'Marrón',
        'green': 'Verde',
        'ivory': 'Marfil',
        'orange': 'Naranja',
        'pink': 'Rosa',
        'purple': 'Morado',
        'red': 'Rojo',
        'yellow': 'Amarillo'
    }


    let allProductsInfo;
    async function fetchAllProducts() {
        let allProducts = [];
        let cursor = null;
        let hasNextPage = true;

        while (hasNextPage) {
            let query = `
        query ($cursor: String) {
            products(first: 250, after: $cursor, reverse: true) {
                edges {
                    node {
                        id
                        title
                        handle
                        bodyHtml
                        featuredImage {
                          url
                        }
                        collections(first: 5) {
                            nodes {
                                handle
                                title
                                id
                            }
                        }
                        metafields(first: 20) {
                            edges {
                                node {
                                    namespace
                                    key
                                    value
                                }
                            }
                        }
                        priceRange {
                          maxVariantPrice {
                            amount
                          }
                          minVariantPrice {
                            amount
                          }
                        }
                        totalInventory
                        variants(first: 1) {
                          edges {
                            node {
                                id
                                price
                                presentmentPrices(first: 250) {
                                nodes {
                                  price {
                                    amount
                                    currencyCode
                                  }
                                }
                              }
                            }
                          }
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }`;

            let requestBody = JSON.stringify({
                query: query,
                variables: { cursor }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                mode: "no-cors",
                body: requestBody,
                redirect: "follow"
            };

            try {
                let response = await fetch(graphqlLink, requestOptions);
                let result = await response.json();

                if (result.errors) {
                    console.error("GraphQL Errors:", result.errors);
                    break;
                }

                let products = result.data.products.edges.map(edge => edge.node);
                allProducts.push(...products);

                hasNextPage = result.data.products.pageInfo.hasNextPage;
                cursor = result.data.products.pageInfo.endCursor;

            } catch (error) {
                console.error("Fetch Error:", error);
                break;
            }
        }

        allProductsInfo = allProducts;
        return allProducts;
    }

    let body = $('body');
    let wishlistItems = [];

    let relatedShow = false;

    $(window).on('load', function(){
        $('body').addClass('fully-loaded');
    })
    body.addClass('fadein');
    if('wishlist' in localStorage) {
        wishlistItems = JSON.parse(localStorage.getItem('wishlist'));

        buildWishlist();
    }else{
        $('.wishlist-bubble').text('0');
    }

    $('.fkk-wishlist').on('click', function(){
        $('body').addClass('wishlist-open');
    })
    $('.wishlistClose, .wishlistOverlay').on('click', function(){
        $('body').removeClass('wishlist-open');
    })

    setTimeout(function(){
        let languageUlWidth;
        if($(window).width() > 1024) {
            languageUlWidth = $('.header__icons form#HeaderLanguageForm .disclosure ul').outerWidth();
        }else{
            languageUlWidth = $('.drawer-switches form#HeaderLanguageForm .disclosure ul').outerWidth();
        }
        $('form#HeaderLanguageForm .disclosure ul').css('width', '0');
        $('form#HeaderLanguageForm .disclosure').css('opacity', '1');

        $('form#HeaderLanguageForm .disclosure > button').on('click', function(){
            if($('form#HeaderLanguageForm .disclosure').hasClass('open')) {
                $('form#HeaderLanguageForm .disclosure').removeClass('open');
                $('form#HeaderLanguageForm .disclosure ul').css('width', '0');
            }else{
                $('form#HeaderLanguageForm .disclosure').addClass('open');
                $('form#HeaderLanguageForm .disclosure ul').css('width', languageUlWidth);
            }
        })
    },500)

    let summaryQuery = `
            query {
              products(first: 250, reverse: true) {
                edges {
                  node {
                    id
                    title
                    handle
                    bodyHtml
                    status
                    collections(first: 5) {
                      nodes {
                        handle
                        title
                        id
                      }
                    }
                    metafields(first: 20) {
                        edges {
                          node {
                            namespace
                            key
                            value
                          }
                        }
                      }
                  }
                }
              }
            }`;
    const summaryGraphql = JSON.stringify({
        query: summaryQuery,
        variables: {
            "handle": 'all'
        }
    })
    const summaryRequestOptions = {
        method: "POST",
        headers: myHeaders,
        body: summaryGraphql,
        redirect: "follow"
    };

    fetch(graphqlLink, summaryRequestOptions)
        .then((response) => response.text())
        .then((result) => parseResultOne(result))
        .catch((error) => console.error(error));

    function parseResultOne(result){
        let resultJSON = JSON.parse(result);
        let resultData = resultJSON.data;

        let collectionProducts = resultData.products.edges;
        let collectionSizeArr = [];
        let collectionUseArr = [];
        let collectionFoodArr = [];
        let collectionColourArr = [];

        console.log(collectionProducts);

        familyCounts = {};
        for(let i = 0; i< collectionProducts.length; i++) {
            let currentProduct = collectionProducts[i];
            let currentProductJSON = currentProduct.node;

            let productMetafields = currentProductJSON.metafields.edges;
            let productFamily;

            for(let j = 0; j < productMetafields.length; j++){
                let metafieldJSON = productMetafields[j].node;

                let metafieldKey = metafieldJSON.key;
                let metafieldValue = metafieldJSON.value;

                if(metafieldKey === 'family') {
                    productFamily = metafieldValue;
                }
            }

            if(currentProductJSON.status === 'ACTIVE' && currentProductJSON.collections.nodes.length > 0 && currentProductJSON.collections.nodes[0].title !== 'Workshops') {
                const family = productFamily;
                if(family !== undefined) {
                    familyCounts[family] = (familyCounts[family] || 0) + 1;
                }
            }
        }

        function colorsQuantity($this){

        }

        $('.section.fkk-products .fkk-product__item').each(function(){
            let colorsQuantity = familyCounts[$(this).attr('data-family')];

            if(parseInt(colorsQuantity) > 0) {
                if(parseInt(colorsQuantity) > 1) {
                    if(htmlLang === 'es') {
                        $(this).find('.product-colors').html(colorsQuantity+' colores');
                    }else{
                        $(this).find('.product-colors').html(colorsQuantity+' colors');
                    }
                }else{
                    $(this).find('.product-colors').html(colorsQuantity+' color');
                }
                $(this).find('.divider:nth-child(4)').show();
            }
        })

        $('.related-product-list .fkk-product__item').each(function(){
            let colorsQuantity = familyCounts[$(this).attr('data-family')];

            if(parseInt(colorsQuantity) > 0) {
                if (parseInt(colorsQuantity) > 1) {
                    if (htmlLang === 'es') {
                        $(this).find('.product-colors').html(colorsQuantity + ' colores');
                    } else {
                        $(this).find('.product-colors').html(colorsQuantity + ' colors');
                    }
                } else {
                    $(this).find('.product-colors').html(colorsQuantity + ' color');
                }
                $(this).find('.divider:nth-child(4)').show();
            }
        })
    }

    // $('.announcement-bar-section .notifications-list .notification-subscribe > form, footer.footer .footer-block--newsletter form').attr('action', '/contact');

    // Localization popup
    let currencyButton = body.find('.fkk-country .disclosure__button');
    let currencyPopup = body.find('.localizationPopup');
    let chooseCountryDiv = currencyPopup.find('.countryPicker');
    let chooseCountryButton = currencyPopup.find('.countryPicker > span');
    let enterSite = currencyPopup.find('.localizationFooter > button');

    currencyButton.on('click', function(){
        body.addClass('chooseCurrency');
    })
    chooseCountryButton.on('click', function(){
        if(chooseCountryDiv.hasClass('open')) {
            chooseCountryDiv.removeClass('open');
        }else{
            chooseCountryDiv.addClass('open');
        }
    })
    enterSite.on('click', function(){
        body.removeClass('chooseCurrency');
    })


    // Drawer
    let menuDrawer = $('#menu-drawer');
    menuDrawer.find('nav > ul > li > div > summary').on('click', function(){
        let parentEl = $(this).parents('li');
        parentEl.siblings('li').each(function(){
            $(this).find('summary + div').slideUp();
        })
        if($(this).siblings('div').css('display') === 'block') {
            $('.menu-drawer-footer').slideDown();
        }else{
            $('.menu-drawer-footer').slideUp();
        }
        $(this).siblings('div').slideToggle();
    })


    const isDesktop = $(window).width() > 1024;
    const relatedContainer = isDesktop
        ? $('div.cart-drawer .drawer__related')
        : $('div.cart-drawer .drawer__related-mobile');


    // Megamenu Information
    let megamenuIndex = 0;
    let megamenuItem = $('header.header .header__inline-menu > ul > li');
    $('section.megamenu-images').each(function(){
        let infoHTML = $(this).find('.megamenu-left').html();
        let rightHTML = $(this).find('.megamenu-right').html();

        megamenuItem.eq(megamenuIndex).find('.mega-menu__left .mega-menu__info').html(infoHTML);
        menuDrawer.find('nav > ul > li').eq(megamenuIndex).find('summary + div').prepend(infoHTML);
        megamenuItem.eq(megamenuIndex).find('.mega-menu__content .mega-menu__right').html(rightHTML);

        megamenuIndex++
    })

    megamenuItem.find('.mega-menu__item').on('mouseenter', function(){
        body.addClass('megamenu-open');

        $('.mega-menu__content').removeClass('open');
        $(this).parent().find('.mega-menu__content').addClass('open');
    })
    $('.fkk-megamenu').on('mouseleave', function(){
        body.removeClass('megamenu-open');
        $('.mega-menu__content').removeClass('open');
    })
    megamenuItem.find('details summary span').on('click', function(){
        let $this = $(this);
        setTimeout(function (){
            if($this.parent().parent().attr('open') === undefined) {
                body.removeClass('megamenu-open');
            }else{
                body.addClass('megamenu-open');
            }
        },1)
    })


    // Footer
    let footerContactLink = $('.footer-contacts a');
    let footerNav = $('.footer-links');
    footerContactLink.on('mouseenter', function(){
        $(this).parents('.footer-contacts').addClass('hovered');
    })
    footerContactLink.on('mouseleave', function(){
        $(this).parents('.footer-contacts').removeClass('hovered');
    })

    let footerNewsletterForm = $('footer.footer .footer-block--newsletter form');
    footerNewsletterForm.find('input[type="email"]').on('propertychange input', function (e) {
        if($(this).val().indexOf('@') > -1) {
            footerNewsletterForm.addClass('show-submit');
        }else{
            footerNewsletterForm.removeClass('show-submit');
        }
    });
    if(htmlLang === 'es') {
        footerNewsletterForm.find('input[type="email"]').attr('placeholder', 'tucorreo@ejemplo.com');
    }


    // Showcases
    $('section.fkk-showcases .case').each(function(){
        let caseHeight = ($(this).attr('data-height')*100)/1920;
        let caseHeightMobile = $(this).attr('data-height')*.58;
        if($(window).width() > 1024) {
            $(this).css('height', caseHeight+'vw');
        }else{
            $(this).css('height', caseHeightMobile+'px');
        }
    })
    const showCaseSwiper = new Swiper('.swiper.cases', {
        slidesPerView: 'auto',
        loop: false,
        freeMode: true,
    });


    // Video (mute/unmute)
    const soundButton = document.querySelector('.fkk-video__sound');
    if(soundButton) {
        soundButton.addEventListener('click', function () {
            let player = this.parentElement.querySelector('.fkk-video__video video');

            if (player.muted) {
                player.muted = false;
                this.classList.add('unmuted');
                this.querySelector('span').innerText = 'Play Without Sound';
            } else {
                player.muted = true;
                this.classList.remove('unmuted');
                this.querySelector('span').innerText = 'Play With Sound';
            }
        });

    }

    let bespokeModuleStartFifteen;
    let bespokeModuleStart;
    let bespokeModuleFinish;
    let bespokeModuleFinishFifteen;

    if($('.bespoke-module').length) {
        setTimeout(function (){
            bespokeModuleStartFifteen = $('.bespoke-module').offset().top - 30;
            bespokeModuleStart = $('.bespoke-module').offset().top - 15;
            bespokeModuleFinish = $('.bespoke-module').offset().top + $('.bespoke-module').outerHeight(true) - $(window).height() + 15;
            bespokeModuleFinishFifteen = $('.bespoke-module').offset().top + $('.bespoke-module').outerHeight(true) - $(window).height() + 30;

            if($(window).width() > 1024 && $(window).scrollTop() > bespokeModuleStart && $(window).scrollTop() < bespokeModuleFinish) {
                body.addClass('bespoke-sticky');
            }
        },100)
    }
    // Header scroll
    var lastScrollTop = 0;
    $(window).scroll(function() {
        const scrollPosition = $(window).scrollTop();
        const windowHeight = $(window).height();
        const triggerPoint = windowHeight * 0.5;

        if (scrollPosition >= triggerPoint) {
            body.addClass('fkk-header-fixed');

            if (scrollPosition > lastScrollTop){
                body.removeClass('scrolling-up');
            } else {
                body.addClass('scrolling-up');
            }
        }else{
            body.removeClass('fkk-header-fixed');
        }
        lastScrollTop = scrollPosition;

        if($('.bespoke-module').length && $(window).width() > 1024) {
            if (scrollPosition < bespokeModuleStartFifteen || scrollPosition > bespokeModuleFinishFifteen) {
                body.removeClass('bespoke-sticky');
            } else {
                body.addClass('bespoke-sticky');

                if (scrollPosition < bespokeModuleFinish) {
                    $('.bespoke-module-top').css('height', '15px');
                }
                if (scrollPosition > bespokeModuleStart) {
                    $('.bespoke-module-bottom').css('height', '15px');
                }
            }
            if (scrollPosition > bespokeModuleStartFifteen && scrollPosition <= bespokeModuleStart) {
                let bottomPlankHeight = Math.ceil(scrollPosition - bespokeModuleStartFifteen);

                $('.bespoke-module-bottom').css('height', bottomPlankHeight);
            }
            if (scrollPosition > bespokeModuleFinish && scrollPosition <= bespokeModuleFinishFifteen) {
                let topPlankHeight = Math.ceil(bespokeModuleFinishFifteen - scrollPosition);

                $('.bespoke-module-top').css('height', topPlankHeight);
            }
        }

        if($('.fkk-filter').length  && scrollPosition > 80) {
            $('.fkk-filter').addClass('transparent');
        }else{
            $('.fkk-filter').removeClass('transparent');
        }
    });

    function setCookie(name, value, days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
        let expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + "; " + expires + "; path=/";
    }
    function getCookie(name) {
        let cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            let [key, value] = cookie.split("=");
            if (key === name) {
                return value; // Return the cookie value if found
            }
        }
        return null; // Return null if the cookie doesn't exist
    }



    // Notification badges
    let subscribeBadge = $('.notification-subscribe');
    let cookieBadge = $('.notification-cookie');
    subscribeBadge.on('click', function(){
        if(!subscribeBadge.hasClass('in-focus')) {
            subscribeBadge.addClass('in-focus');
        }
    })

    let notificationsHeight = 34;
    $('.notification-outer').each(function(){
        notificationsHeight += $(this).outerHeight(true) + 7;
        $(this).css('height', $(this).outerHeight(true));
        if(!getCookie('notification-'+$(this).index())) {
            $(this).show();
        }
    })
    $('.notification-outer span.close').on('click', function(){
        $(this).parents('.notification-outer').addClass('closed');
        // localStorage.setItem('notification-'+$(this).parents('.notification-outer').index(), 'shut');
        setCookie('notification-'+$(this).parents('.notification-outer').index(), "shut", 30);
    })
    $('.notification-cookie p span').on('click', function(){
        $('button#shopify-pc__banner__btn-accept').trigger('click');
        $(this).parents('.notification-outer').addClass('closed');
        // localStorage.setItem('notification-'+$(this).parents('.notification-outer').index(), 'shut');
        setCookie('notification-'+$(this).parents('.notification-outer').index(), "shut", 30);
    })
    const notificationOuters = document.querySelectorAll('.notification-outer');
    notificationOuters.forEach((notificationOuter, index) => {
        let startX;
        let endX;

        notificationOuter.addEventListener('touchstart', (event) => {
            startX = event.touches[0].clientX;

            notificationOuter.addEventListener('touchmove', (event) => {
                event.preventDefault();
                endX = event.touches[0].clientX;

                if (startX > endX) {
                    notificationOuter.classList.add('closed');
                    // sessionStorage.setItem('notification-'+index, 'shut');
                    setCookie('notification-'+index, "shut", 30);
                }
            });
        });

        // Reset on touchend for each notification
        notificationOuter.addEventListener('touchend', () => {
            notificationOuter.removeEventListener('touchmove');
        });
    });


    if($(window).width() < 1025) {
        menuDrawer.css('height', $(window).outerHeight());
        $('.section.fkk-video .video-section .fkk-video__video').css('height', $(window).outerHeight());
        $('section.fkk-video .video-section .fkk-video__content.position-middle').css('bottom', notificationsHeight);
        // $('section.fkk-video .video-section .fkk-video__content.position-middle').css('bottom', 0);

        footerNav.each(function(){
            let $this = $(this);
            $this.find('h4').on('click', function(){
                if(!$this.hasClass('opened')) {
                    footerNav.removeClass('opened');
                    footerNav.find('.footer__menu').slideUp();

                    $this.addClass('opened');
                    $this.find('.footer__menu').slideDown();
                }else{
                    $this.removeClass('opened');
                    $this.find('.footer__menu').slideUp();
                }
            })
        })

        // Product Item
        let productSwiper = new Swiper('.section.fkk-product .fkk-product-item.carousel-true .swiper', {
            slidesPerView: 'auto',
            loop: false,
            spaceBetween: 10,
        });

        // Collection
        let collectionSwiper = new Swiper('.section.fkk-collection .swiper.carousel-true', {
            slidesPerView: 'auto',
            loop: true,
            spaceBetween: 10,
        });

        // Gallery
        let gallerySwiper = new Swiper('.section.fkk-gallery .swiper.carousel-true', {
            slidesPerView: 'auto',
            loop: false,
            spaceBetween: 10,
        });

        const swiperElements = document.querySelectorAll('body.page-113697358072 .swiper');
        swiperElements.forEach(swiperElement => {
            new Swiper(swiperElement, {
                slidesPerView: 'auto',
                loop: false,
                spaceBetween: 10,
            });
        });
    }
    $(document).mouseup(function(e) {
        if (!chooseCountryDiv.is(e.target) && chooseCountryDiv.has(e.target).length === 0)
        {
            chooseCountryDiv.removeClass('open');
        }
        if (!currencyPopup.is(e.target) && currencyPopup.has(e.target).length === 0)
        {
            body.removeClass('chooseCurrency');
        }
    });

    // Collection page
    let collectionAllItems = $('.collection-product-grid');
    if(collectionAllItems.length) {
        assignFilterSettings();

        let productCollection = 'all';
        let currentCollection = window.location.pathname.split('collections/')[1];

        let allItemsQuery = `
            query {
              products(first: 250, reverse: true) {
                edges {
                  node {
                    id
                    title
                    handle
                    bodyHtml
                    status
                    collections(first: 5) {
                      nodes {
                        handle
                        title
                        id
                      }
                    }
                    metafields(first: 20) {
                        edges {
                          node {
                            namespace
                            key
                            value
                          }
                        }
                      }
                  }
                }
              }
            }`;
        const allItemsGraphql = JSON.stringify({
            query: allItemsQuery,
            variables: {
                "handle": productCollection
            }
        })
        const allItemsRequestOptions = {
            method: "POST",
            headers: myHeaders,
            body: allItemsGraphql,
            redirect: "follow"
        };

        fetch(graphqlLink, allItemsRequestOptions)
            .then((response) => response.text())
            .then((result) => parseFiltersResult(result))
            .catch((error) => console.error(error));


        body.on('click', '.filter-item > div', function(){
            if($(this).parent().hasClass('open')) {
                $('.filter-items').removeClass('open');
                $(this).parent().removeClass('open');
                $(this).parent().find('ul').css({
                    'width' : 0
                })
            }else{
                $('.filter-items').addClass('open');
                $(this).parents('.filter-items').find('.filter-item').removeClass('open');
                $(this).parents('.filter-items').find('.filter-item').find('ul').css({
                    'width' : '0'
                })
                $(this).parent().addClass('open');
                $(this).parent().find('ul').css({
                    'width' : $(this).parent().find('ul').attr('data-width')
                })
            }
        });
        body.on('click', '.filter-item > ul li', function(){
            let chosenHTML = $(this)[0].outerHTML;
            chosenHTML = $(chosenHTML).addClass('non-visible');
            $('.filter-chosen ul').append(chosenHTML);

            setTimeout(function(){
                $('.filter-chosen ul li').removeClass('non-visible');
            }, 10)
            $(this).addClass('chosen');

            $(this).parent().css({
                'width' : $(this).parent().outerWidth() - $(this).attr('data-width') - 3
            })
            $(this).parent().attr('data-width', $(this).parent().outerWidth() - $(this).attr('data-width') - 3);

            fkkFilter();
            $('html, body').animate({ scrollTop: 0 }, 'slow');
        });
        body.on('click', '.filter-chosen ul li', function(){
            let $this = $(this);
            let chosenItem = $(this).attr('data-item');
            let ulWidth = parseFloat($('.filter-item > ul li[data-item="'+chosenItem+'"]').parent().attr('data-width'));
            let liWidth = parseFloat($('.filter-item > ul li[data-item="'+chosenItem+'"]').attr('data-width'));

            $('.filter-item.open > ul li[data-item="'+chosenItem+'"]').parent().css({
                'width' :  ulWidth + liWidth + 3
            })
            $('.filter-item > ul li[data-item="'+chosenItem+'"]').parent().attr('data-width', ulWidth + liWidth + 3);
            $('.filter-item > ul li[data-item="'+chosenItem+'"]').removeClass('chosen');


            $this.addClass('non-visible');
            setTimeout(function(){
                $this.remove();
                fkkFilter();
            }, 150)
        });

        adjustFeaturedWidth();

        function parseFiltersResult(result){
            let resultJSON = JSON.parse(result);
            let resultData = resultJSON.data;

            let collectionProducts = resultData.products.edges;
            let collectionSizeArr = [];
            let collectionUseArr = [];
            let collectionFoodArr = [];
            let collectionColourArr = [];

            familyCounts = {};
            for(let i = 0; i< collectionProducts.length; i++) {
                let currentProduct = collectionProducts[i];
                let currentProductJSON = currentProduct.node;

                if(currentCollection === 'all') {
                    let productMetafields = currentProductJSON.metafields.edges;
                    let productFamily;

                    for(let j = 0; j < productMetafields.length; j++){
                        let metafieldJSON = productMetafields[j].node;

                        let metafieldKey = metafieldJSON.key;
                        let metafieldValue = metafieldJSON.value;

                        if(metafieldKey === 'family') {
                            productFamily = metafieldValue;
                        }
                        if(metafieldKey === 'size') {
                            let sizesArr = JSON.parse(metafieldValue);

                            if (collectionSizeArr.indexOf(sizesArr[0]) === -1) {
                                collectionSizeArr.push(sizesArr[0]);
                            }
                        }else if(metafieldKey === 'use') {
                            let useArr = JSON.parse(metafieldValue);

                            for (let k = 0; k < useArr.length; k++) {
                                if (collectionUseArr.indexOf(useArr[k]) === -1) {
                                    collectionUseArr.push(useArr[k]);
                                }
                            }
                        }else if(metafieldKey === 'food') {
                            let foodArr = JSON.parse(metafieldValue);

                            for (let k = 0; k < foodArr.length; k++) {
                                if (collectionFoodArr.indexOf(foodArr[k]) === -1) {
                                    collectionFoodArr.push(foodArr[k]);
                                }
                            }
                        }else if(metafieldKey === 'colour') {
                            let colourArr = JSON.parse(metafieldValue);

                            for(let k = 0; k < colourArr.length; k++){
                                if (collectionColourArr.indexOf(colourArr[k]) === -1) {
                                    collectionColourArr.push(colourArr[k]);
                                }
                            }
                        }
                    }

                    if(currentProductJSON.status === 'ACTIVE' && currentProductJSON.collections.nodes.length > 0 && currentProductJSON.collections.nodes[0].title !== 'Workshops') {
                        const family = productFamily;
                        familyCounts[family] = (familyCounts[family] || 0) + 1;

                        console.log('yes 2');
                    }
                } else {
                    if(currentProductJSON.collections.nodes.some(node => node.handle === currentCollection)) {
                        let productMetafields = currentProductJSON.metafields.edges;
                        let productFamily;

                        for(let j = 0; j < productMetafields.length; j++){
                            let metafieldJSON = productMetafields[j].node;

                            let metafieldKey = metafieldJSON.key;
                            let metafieldValue = metafieldJSON.value;

                            if(metafieldKey === 'family') {
                                productFamily = metafieldValue;
                            }
                            if(metafieldKey === 'size') {
                                let sizesArr = JSON.parse(metafieldValue);

                                if (collectionSizeArr.indexOf(sizesArr[0]) === -1) {
                                    collectionSizeArr.push(sizesArr[0]);
                                }
                            }else if(metafieldKey === 'use') {
                                let useArr = JSON.parse(metafieldValue);

                                for (let k = 0; k < useArr.length; k++) {
                                    if (collectionUseArr.indexOf(useArr[k]) === -1) {
                                        collectionUseArr.push(useArr[k]);
                                    }
                                }
                            }else if(metafieldKey === 'food') {
                                let foodArr = JSON.parse(metafieldValue);

                                for (let k = 0; k < foodArr.length; k++) {
                                    if (collectionFoodArr.indexOf(foodArr[k]) === -1) {
                                        collectionFoodArr.push(foodArr[k]);
                                    }
                                }
                            }else if(metafieldKey === 'colour') {
                                let colourArr = JSON.parse(metafieldValue);

                                for(let k = 0; k < colourArr.length; k++){
                                    if (collectionColourArr.indexOf(colourArr[k]) === -1) {
                                        collectionColourArr.push(colourArr[k]);
                                    }
                                }
                            }
                        }

                        if(currentProductJSON.status === 'ACTIVE' && currentProductJSON.collections.nodes.length > 0 && currentProductJSON.collections.nodes[0].title !== 'Workshops') {
                            const family = productFamily;
                            familyCounts[family] = (familyCounts[family] || 0) + 1;

                            console.log('yes 3');
                        }
                    }
                }
            }

            collectionSizeArr.sort((a, b) => b.localeCompare(a));
            collectionUseArr.sort();
            collectionFoodArr.sort();
            collectionColourArr.sort();

            let filterItems = $('.section.collection-product-grid .filter-items');
            let sizesHTML = '';
            let useHTML = '';
            let foodHTML = '';
            let colourHTML = '';

            arrayIntoItems(collectionSizeArr, sizesHTML, 'size');
            arrayIntoItems(collectionUseArr, useHTML, 'use');
            arrayIntoItems(collectionFoodArr, foodHTML, 'food');
            arrayIntoItems(collectionColourArr, colourHTML, 'colour');

            function arrayIntoItems(array, arrHTML, block){
                let filterSet = $('.filter-item.'+block);
                for(let i = 0; i < array.length; i++){
                    if(array[i].indexOf(' | ') > -1) {
                        let colourName = array[i].split(' | ')[0];
                        let colourCode = array[i].split(' | ')[1];

                        if(htmlLang === 'es') {
                            colourName = filterLabelsEs[colourName.toLowerCase()];
                        }

                        arrHTML += '<li class="colour" data-item="'+block+'_'+colourCode.split('#')[1].toLowerCase().split(' ').join('-')+'"><span class="close"><svg xmlns="http://www.w3.org/2000/svg" width="9.284" height="9.283" viewBox="0 0 9.284 9.283"><g id="Group_3954" data-name="Group 3954" transform="translate(-786.575 -235.858)"><path id="Path_1019" data-name="Path 1019" d="M0,0H11.927" transform="translate(787.001 236.283) rotate(45)" fill="#381409" stroke="#381409" stroke-width="1.2"/><path id="Path_38709" data-name="Path 38709" d="M0,0H11.927" transform="translate(795.434 236.283) rotate(135)" fill="#381409" stroke="#381409" stroke-width="1.2"/></g></svg></span>'+colourName+'<span class="circle" style="background:'+colourCode+'"></span></li>';
                    }else{
                        let filterlabel = array[i];
                        if(htmlLang === 'es') {
                            filterlabel = filterLabelsEs[array[i].toLowerCase()];
                        }
                        arrHTML += '<li data-item="'+block+'_'+array[i].toLowerCase().split(' ').join('-')+'"><span class="close"><svg xmlns="http://www.w3.org/2000/svg" width="9.284" height="9.283" viewBox="0 0 9.284 9.283"><g id="Group_3954" data-name="Group 3954" transform="translate(-786.575 -235.858)"><path id="Path_1019" data-name="Path 1019" d="M0,0H11.927" transform="translate(787.001 236.283) rotate(45)" fill="#381409" stroke="#381409" stroke-width="1.2"/><path id="Path_38709" data-name="Path 38709" d="M0,0H11.927" transform="translate(795.434 236.283) rotate(135)" fill="#381409" stroke="#381409" stroke-width="1.2"/></g></svg></span>'+filterlabel+'</li>';
                    }
                }
                if(arrHTML !== '') {
                    filterItems.find('.filter-item.'+block).append('<ul>'+arrHTML+'</ul>');
                    filterSet.find('ul').attr('data-width', $('.filter-item.'+block+' ul').outerWidth());
                    filterSet.find('ul li').each(function(){
                        $(this).attr('data-width', $(this).outerWidth());
                    })
                    filterSet.find('ul').css({
                        'width' : '0'
                    })
                } else {
                    filterItems.find('.filter-item.'+block).hide();
                }

                $('.fkk-filter').css({
                    'visibility' : 'visible',
                    'opacity' : '1'
                })

            }

            $('.shopify-section.collection-product-grid #product-grid li.grid__item').each(function(){
                let colorsQuantity = familyCounts[$(this).find('.card-wrapper').attr('data-family')];

                if(parseInt(colorsQuantity) > 0) {
                    if (parseInt(colorsQuantity) > 1) {
                        if (htmlLang === 'es') {
                            $(this).find('.product-colors').html(colorsQuantity + ' colores');
                        } else {
                            $(this).find('.product-colors').html(colorsQuantity + ' colors');
                        }
                    } else {
                        $(this).find('.product-colors').text(colorsQuantity + ' color');
                    }
                    $(this).find('.divider:nth-child(4)').show();
                }
            })
        }
        function fkkFilter(){
            let chosenFilterItems = $('.filter-chosen ul li');
            let chosenSizes = [];
            let chosenUsage = [];
            let chosenFoods = [];
            let chosenColours = [];

            $('.shopify-section.collection-product-grid:not(.past-editions) #product-grid').addClass('faded');

            setTimeout(function(){
                if(chosenFilterItems.length > 0){
                    chosenFilterItems.each(function(){
                        let filterItem = $(this).attr('data-item');
                        let filterItemType = filterItem.split('_')[0];

                        if(filterItemType === 'size') {
                            chosenSizes.push(filterItem);
                        }else if(filterItemType === 'use'){
                            chosenUsage.push(filterItem);
                        }else if(filterItemType === 'food'){
                            chosenFoods.push(filterItem);
                        }else if(filterItemType === 'colour'){
                            chosenColours.push(filterItem);
                        }
                    })
                }
                $('.shopify-section.collection-product-grid:not(.past-editions) #product-grid li.grid__item').each(function(){
                    let $thisDiv = $(this).find('.card-wrapper');
                    let shouldShow = true;

                    if(chosenSizes.length > 0) {
                        for (let i = 0; i < chosenSizes.length; i++) {
                            if(!$thisDiv.hasClass(chosenSizes[i])){
                                shouldShow = false;
                            }else{
                                shouldShow = true;
                                break;
                            }
                        }
                    }
                    if(shouldShow && chosenUsage.length > 0) {
                        for (let i = 0; i < chosenUsage.length; i++) {
                            if(!$thisDiv.hasClass(chosenUsage[i])){
                                shouldShow = false;
                            }else{
                                shouldShow = true;
                                break;
                            }
                        }
                    }
                    if(shouldShow && chosenFoods.length > 0) {
                        for (let i = 0; i < chosenFoods.length; i++) {
                            if(!$thisDiv.hasClass(chosenFoods[i])){
                                shouldShow = false;
                            }else{
                                shouldShow = true;
                                break;
                            }
                        }
                    }
                    if(shouldShow && chosenColours.length > 0) {
                        if(chosenColours.length === 1){
                            if(chosenColours[0] === 'colour_000000') {
                                let classes = $thisDiv.attr('class').split(/\s+/);
                                let colourClasses = classes.filter(c => c.startsWith('colour_'));

                                if(colourClasses.length === 1 && colourClasses[0] === 'colour_000000') {
                                    shouldShow = true;
                                }else{
                                    shouldShow = false;
                                }
                            }else{
                                for (let i = 0; i < chosenColours.length; i++) {
                                    if(!$thisDiv.hasClass(chosenColours[i])){
                                        shouldShow = false;
                                    }else{
                                        shouldShow = true;
                                        break;
                                    }
                                }
                            }
                        }else{
                            for (let i = 0; i < chosenColours.length; i++) {
                                if(!$thisDiv.hasClass(chosenColours[i])){
                                    shouldShow = false;
                                }else{
                                    shouldShow = true;
                                    break;
                                }
                            }
                        }



                        //
                        // if(chosenColours.length === 1 && colourClasses.length === 1 && chosenColours[0] === 'colour_000000'){
                        //     if($thisDiv.hasClass(chosenColours[0])){
                        //         shouldShow = true;
                        //     }else{
                        //         shouldShow = false;
                        //     }
                        // }else{
                        //
                        // }
                    }

                    if (shouldShow) {
                        if(chosenFilterItems.length > 0) {
                            $(this).show();
                        }else{
                            if($(this).attr('data-main')) {
                                $(this).show();
                            }else{
                                $(this).hide();
                            }
                        }
                    } else {
                        $(this).hide();
                    }
                })
                $('.shopify-section.collection-product-grid:not(.past-editions) #product-grid').removeClass('faded');
            }, 200);
        }
        function fkkFilterNoFade(){
            let chosenFilterItems = $('.filter-chosen ul li');
            let chosenSizes = [];
            let chosenUsage = [];
            let chosenFoods = [];
            let chosenColours = [];

            setTimeout(function(){
                if(chosenFilterItems.length > 0){
                    chosenFilterItems.each(function(){
                        let filterItem = $(this).attr('data-item');
                        let filterItemType = filterItem.split('_')[0];

                        if(filterItemType === 'size') {
                            chosenSizes.push(filterItem);
                        }else if(filterItemType === 'use'){
                            chosenUsage.push(filterItem);
                        }else if(filterItemType === 'food'){
                            chosenFoods.push(filterItem);
                        }else if(filterItemType === 'colour'){
                            chosenColours.push(filterItem);
                        }
                    })
                }
                $('.shopify-section.collection-product-grid:not(.past-editions) #product-grid li.grid__item').each(function(){
                    let $thisDiv = $(this).find('.card-wrapper');
                    let shouldShow = true;

                    if(chosenSizes.length > 0) {
                        for (let i = 0; i < chosenSizes.length; i++) {
                            if(!$thisDiv.hasClass(chosenSizes[i])){
                                shouldShow = false;
                            }else{
                                shouldShow = true;
                                break;
                            }
                        }
                    }
                    if(shouldShow && chosenUsage.length > 0) {
                        for (let i = 0; i < chosenUsage.length; i++) {
                            if(!$thisDiv.hasClass(chosenUsage[i])){
                                shouldShow = false;
                            }else{
                                shouldShow = true;
                                break;
                            }
                        }
                    }
                    if(shouldShow && chosenFoods.length > 0) {
                        for (let i = 0; i < chosenFoods.length; i++) {
                            if(!$thisDiv.hasClass(chosenFoods[i])){
                                shouldShow = false;
                            }else{
                                shouldShow = true;
                                break;
                            }
                        }
                    }
                    if(shouldShow && chosenColours.length > 0) {
                        for (let i = 0; i < chosenColours.length; i++) {
                            if(!$thisDiv.hasClass(chosenColours[i])){
                                shouldShow = false;
                            }else{
                                shouldShow = true;
                                break;
                            }
                        }
                    }

                    if (shouldShow) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                })
                console.log('test');
                $('.collection-product-grid:not(.past-editions) #product-grid li.grid__item.lazy-loaded').removeClass('lazy-loaded');
            }, 200);
        }
    }


    // Product item - Colors section (under development)
    let productGallery = $('.product .product__media-wrapper');
    if(productGallery.length) {
        if($('product-info .product').attr('data-template') !== 'workshop') {

            const items = productGallery.find('ul li.product__media-item');
            let rowCount = 0;

            items.each(function(index) {
                const $item = $(this);
                const ratio = parseFloat($item.find('.product-media-container').attr('data-ratio'));

                // Default is half-width
                let className = 'half-width';

                if (ratio > 1) {
                    // Landscape: always full width
                    className = 'full-width';
                    rowCount = 0; // reset because it's its own row
                } else {
                    // Portrait: count as half-width
                    rowCount++;

                    // Last portrait with no partner
                    if (rowCount === 1 && index === items.length - 1) {
                        className = 'full-width';
                    }

                    // Reset row count when we get two halves
                    if (rowCount === 2) {
                        rowCount = 0;
                    }
                }

                $item.addClass(className);
            });




            // let mediaLength = productGallery.find('ul li.product__media-item').length;
            // let hasVideo = 0;
            //
            // productGallery.find('ul li.product__media-item').each(function(){
            //     if($(this).find('video').length) {
            //         hasVideo++;
            //     }
            // })
            // if((mediaLength-hasVideo) % 2 === 1) {
            //     if(hasVideo > 0) {
            //         productGallery.find('ul li.product__media-item').eq(mediaLength-1).addClass('full-width');
            //     }else{
            //         // productGallery.find('ul li.product__media-item').eq(mediaLength).addClass('full-width');
            //     }
            // }
        }
        //
        // productGallery.find('ul li.product__media-item').each(function(){
        //     let imageRatio = $(this).find('.product-media-container').attr('data-ratio');
        //     if(parseFloat(imageRatio) > 1) {
        //         $(this).addClass('full-width');
        //     }
        // })

        if($(window).width() < 1025) {
            let mediaSwiper = new Swiper('slider-component.swiper', {
                slidesPerView: 'auto',
                loop: false,
                spaceBetween: 12,
                followFinger: false,
            });
        }
    }
    if($('product-info').length) {
        let productCollection = $('product-info').attr('data-collection');
        let currentURL = window.location.pathname;
        let currentTitle = $('.product__title h1');
        let addonsHtml = '';

        if(htmlLang === 'es') {
            $('.product__tab').each(function(){
                let tabTitle = $(this).find('h4').attr('data-title-es');
                $(this).find('h4').text(tabTitle);
            })
        }

        async function fetchProductData(productId) {
            let productQuery = `query GetProductsById($id: ID!) {
                product(id: $id) {
                    title
                    descriptionHtml
                    featuredImage {
                        url
                    }
                    metafields(first: 20) {
                        edges {
                            node {
                                namespace
                                key
                                value
                            }
                        }
                    }
                    priceRange {
                        maxVariantPrice {
                            amount
                        }
                        minVariantPrice {
                            amount
                        }
                    }
                    totalInventory
                    variants(first: 1) {
                        edges {
                            node {
                                id
                                price
                                presentmentPrices(first: 250) {
                                    nodes {
                                        price {
                                            amount
                                            currencyCode
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }`;

            const productGraphql = JSON.stringify({
                query: productQuery,
                variables: { id: productId }
            });

            const productRequestOptions = {
                method: "POST",
                headers: myHeaders,
                body: productGraphql,
                redirect: "follow"
            };

            try {
                const response = await fetch(graphqlLink, productRequestOptions);
                const resultJSON = await response.json();
                return resultJSON.data.product;
            } catch (error) {
                console.error(`Error fetching product ${productId}:`, error);
                return null;
            }
        }
        async function loadAddons() {
            console.log('load addons');
            let currentBladeGuards = Array.from(document.querySelectorAll('.hidden_addons li'))
                .map(item => `gid://shopify/Product/${item.innerText.trim()}`);

            if (!currentBladeGuards.length) {
                // $('div.product.product--large .product__info-wrapper .product__info-container').addClass('faded');
                return;
            }

            const productDataArray = await Promise.all(currentBladeGuards.map(fetchProductData));

            for (const resultData of productDataArray) {
                if (!resultData) continue;

                let addonFamily = '';
                let addonExcerpt = '';
                let addonPrice = Math.round(resultData.variants.edges[0].node.price);
                let addonId = resultData.variants.edges[0].node.id.split('/')[4];

                resultData.metafields.edges.forEach(edge => {
                    if (edge.node.key === 'family') {
                        addonFamily = edge.node.value;
                    }
                    if (edge.node.key === 'excerpt') {
                        addonExcerpt = edge.node.value;
                    }
                });

                let addonImage = resultData.featuredImage
                    ? `<span class="addon-image"><img src="${resultData.featuredImage.url}" alt="${resultData.title}"></span>`
                    : '';

                let addonPrices = resultData.variants.edges[0].node.presentmentPrices.nodes;
                for (let price of addonPrices) {
                    if (price.price.currencyCode === window.currency) {
                        addonPrice = price.price.amount;
                    }
                }

                if (resultData.title === 'Laser engraving') {
                    addonsHtml += `
                <div class="addon-item product-engraving">
                    <input type="checkbox" id="${resultData.title.split(' ').join('-').toLowerCase()}" name="${resultData.title}">
                    <label data-id="${addonId}" for="${resultData.title.split(' ').join('-').toLowerCase()}">
                        <span class="addon-title">${resultData.title}</span>
                        <input type="text" placeholder="Type your engraving here" style="display:none;"/>
                        <span class="addon-price"><p>+${window.currency_symbol}${addonPrice}</p></span>
                    </label>
                </div>`;
                } else {
                    addonsHtml += `
                <div class="addon-item" data-family="${addonFamily}">
                    <input type="checkbox" id="${resultData.title.split(' ').join('-').toLowerCase()}" name="${resultData.title}">
                    <label data-id="${addonId}" for="${resultData.title.split(' ').join('-').toLowerCase()}">
                        <span class="addon-title">${resultData.title}</span>
                        <span class="addon-description"><p>${addonExcerpt}</p></span>
                        <span class="addon-price"><p>+${window.currency_symbol}${addonPrice}</p></span>
                        ${addonImage}
                    </label>
                </div>`;
                }
            }

            $('.product__addons .product__addons-list').prepend(addonsHtml);

            if ($(window).width() < 1025) {
                body.on('click', '.addon-item:not(.product-engraving)', function () {
                    const checkbox = $(this).find('input');
                    if (checkbox.prop('checked')) {
                        $(this).find('.addon-image').slideDown();
                    } else {
                        $(this).find('.addon-image').slideUp();
                    }
                });
            } else {
                body.on('mouseenter', '.addon-item:not(.product-engraving)', function () {
                    $('.product__addon-image').html('<img src="' + $(this).find('.addon-image img').attr('src') + '" alt="">');
                    $('.product__media-wrapper').css('opacity', '.5');
                });
                body.on('mouseleave', '.addon-item:not(.product-engraving)', function () {
                    $('.product__addon-image').html('');
                    $('.product__media-wrapper').css('opacity', '1');
                });
            }
            $('div.product.product--large .product__info-wrapper .product__info-container').addClass('faded');
            setTimeout(function(){
                $('div.product.product--large .product__info-wrapper .product__info-container').addClass(' shown');
            }, 300)
        }

        // Call the function to load addons
        loadAddons();


        if($('#knifeOptions').length && currentTitle.text().split('(').length > 1) {
            currentTitle.html(currentTitle.text().split('(')[0] + '<span>(' + currentTitle.text().split('(')[1].split(')')[0]+')</span>');
        }

        let collectionQuery = `
        query Collection($handle: String!, $first: Int = 250) {
            collectionByHandle(handle: $handle) {
                products(first: $first, sortKey: TITLE) {
                pageInfo {
                    hasNextPage
                }
                edges {
                    cursor
                        node {
                            id
                            status
                            title
                            handle
                            bodyHtml
                            metafields(first: 20) {
                                edges {
                                  node {
                                    namespace
                                    key
                                    value
                                  }
                                }
                              }
                        }
                    }
                }
            }
        }`;
        const collectionGraphql = JSON.stringify({
            query: collectionQuery,
            variables: {
                "handle": productCollection
            }
        })
        const collectionRequestOptions = {
            method: "POST",
            headers: myHeaders,
            body: collectionGraphql,
            redirect: "follow"
        };

        setTimeout(function(){
            fetch(graphqlLink, collectionRequestOptions)
                .then((response) => response.text())
                .then((result) => parseResultTwo(result))
                .catch((error) => console.error(error));
        },500)

        function parseResultTwo(result){
            console.log('load colors');
            let resultJSON = JSON.parse(result);
            let resultData = resultJSON.data;

            if(resultData.collectionByHandle !== undefined) {
                let collectionProducts = resultData.collectionByHandle.products.edges;

                if($('#knifeOptions').length) {
                    let knifeGeometries = '';
                    let knifeColours = '';
                    let productGeometry;
                    let hasGeometry;
                    let productFamily = $('product-info').attr('data-family');

                    for(let i = 0; i< collectionProducts.length; i++){
                        let currentProduct = collectionProducts[i];
                        let currentProductJSON = currentProduct.node;
                        let currentFamily;
                        hasGeometry = false;

                        if(currentProductJSON.status.toLowerCase() === 'active') {
                            let productHandle = currentProductJSON.handle;
                            let productMetafields = currentProductJSON.metafields.edges;

                            for(let j = 0; j < productMetafields.length; j++) {
                                if(productMetafields[j].node.key === 'family') {
                                    currentFamily = productMetafields[j].node.value;
                                }
                                if(productMetafields[j].node.key === 'geometry') {
                                    hasGeometry = true;
                                    productGeometry = JSON.parse(productMetafields[j].node.value);
                                }
                                // if(productMetafields[j].node.key === 'blade_guard' && currentURL === '/products/'+productHandle) {
                                //     currentBladeGuards = JSON.parse(productMetafields[j].node.value);
                                // }
                            }

                            if(!hasGeometry) {
                                productGeometry = '';
                            }

                            if(productFamily === currentFamily) {
                                if(productGeometry && hasGeometry) {
                                    $('.knifeGeometry').css('display', 'flex');
                                }
                                for(let j = 0; j < productMetafields.length; j++){
                                    let metafieldJSON = productMetafields[j].node;


                                    let metafieldNamespace = metafieldJSON.namespace;
                                    let metafieldKey = metafieldJSON.key;
                                    let metafieldValue = metafieldJSON.value;
                                    if(metafieldKey === 'geometry') {
                                        let substringGeometry = '<li class="'+productGeometry[0].split(' ').join('-').split('#').join('').toLowerCase()+'"><a href="#">'+productGeometry[0]+'</a></li>';
                                        if(!knifeGeometries.includes(substringGeometry)) {
                                            knifeGeometries += substringGeometry;
                                        }
                                    }
                                    if(metafieldKey === 'colour') {
                                        let productColors = JSON.parse(metafieldValue);

                                        let colourName = '';
                                        let colourBox = '';

                                        for(let k = 0; k < productColors.length; k++){
                                            colourBox += '<span data-colour="'+productColors[k].split(' | ')[0]+'" style="background:'+productColors[k].split(' | ')[1]+'"></span>';

                                            if(k !== 0){
                                                colourName += '/'+productColors[k].split(' | ')[0];
                                            }else{
                                                colourName += productColors[k].split(' | ')[0];
                                            }
                                        }
                                        let colorboxActive = '';
                                        if(currentURL === langUrlPart+'/products/'+productHandle) {
                                            colorboxActive = 'active';
                                        }
                                        if(productGeometry && hasGeometry) {
                                            knifeColours += '<div class="colourBox ' + colorboxActive + '" data-geometry="' + productGeometry[0].split(' ').join('-').split('#').join('').toLowerCase() + '" data-colors="' + productColors.length + '"><a href="/products/' + productHandle + '">' + colourBox + '</a></div>';
                                        }else{
                                            knifeColours += '<div class="colourBox ' + colorboxActive + '" data-colors="' + productColors.length + '"><a href="'+langUrlPart+'/products/' + productHandle + '">' + colourBox + '</a></div>';
                                        }
                                    }
                                }
                            }
                        }
                    }

                    $('#knifeOptions .knifeGeometry .geometryList').html(knifeGeometries);
                    if(knifeColours !== '') {
                        $('#knifeOptions .knifeColours .coloursList').html(knifeColours);
                        $('#knifeOptions .knifeColours').css({'display':'flex'});
                        setTimeout(function(){
                            $('#knifeOptions .knifeColours').css({'display':'flex', 'opacity':'1'});
                        },200)
                    }

                    if(knifeGeometries !== '') {
                        let chosenGeometry = JSON.parse($('#knifeOptions').attr('data-geometry'))[0].split(' ').join('-').split('#').join('').toLowerCase();
                        $('.knifeGeometry ul li').each(function(){
                            $(this).find('a').attr('href', currentURL.split(chosenGeometry)[0]+$(this).attr('class').split('#').join(''));
                        })
                        $('.knifeGeometry ul li.'+chosenGeometry).addClass('active');
                        $('#knifeOptions .knifeColours .colourBox[data-geometry="'+chosenGeometry+'"]').show();
                    }else{
                        $('#knifeOptions .knifeColours .colourBox').show();
                    }
                }else if($('#workshopOptions').length) {
                    let currentWorkshop = $('#workshopOptions').attr('data-title');
                    let currentDate = $('#workshopOptions').attr('data-date');
                    let workshopDates = '';

                    for(let i = 0; i< collectionProducts.length; i++){
                        let currentProduct = collectionProducts[i];
                        let currentProductJSON = currentProduct.node;

                        let productMetafields = currentProductJSON.metafields.edges;
                        if(currentProductJSON.status === 'ACTIVE') {
                            for(let j = 0; j < productMetafields.length; j++) {
                                if(productMetafields[j].node.namespace === 'workshop' && productMetafields[j].node.key === 'title' && productMetafields[j].node.value === currentWorkshop) {
                                    let rightProductMetafields = currentProduct.node.metafields.edges;

                                    for(let k = 0; k < rightProductMetafields.length; k++) {
                                        if(rightProductMetafields[k].node.namespace === 'workshop' && productMetafields[k].node.key === 'dates') {
                                            let workshopDate = productMetafields[k].node.value;
                                            // const dateObject = new Date(workshopDate);
                                            // const formattedDate = dateObject.toLocaleDateString('en-US', {
                                            //     month: 'short',
                                            //     day: 'numeric',
                                            //     year: 'numeric'
                                            // });

                                            if(workshopDate === currentDate) {
                                                workshopDates += '<li class="current">'+workshopDate+'</li>';
                                            }else{
                                                workshopDates += '<li><a href="/products/'+currentProductJSON.handle+'">'+workshopDate+'</a></li>';
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    $('#workshopOptions').find('.workshopDates ul').html(workshopDates);
                    $('div.product.product--large .product__info-wrapper .product__info-container').addClass('faded');
                    setTimeout(function(){
                        $('div.product.product--large .product__info-wrapper .product__info-container').addClass(' shown');
                    }, 300)
                }

            }
        }


        $('.product__tab > h4').on('click', function (){
            let productTab = $(this).parent();
            if(productTab.hasClass('open')){
                productTab.removeClass('open');
                productTab.find('.product__tab-content').slideUp();
            }else{
                productTab.siblings().removeClass('open');
                productTab.siblings().find('div.product__tab-content').slideUp();
                productTab.addClass('open');
                productTab.find('.product__tab-content').slideDown();
            }
        })
        $('.product__tab.product__description > h4').trigger('click');

        let currentVariant = $('product-info .add-to-wishlist').attr('data-id');
        for(let i = 0; i< wishlistItems.length; i++){
            if(wishlistItems[i].split(' || ')[0] === currentVariant){
                $('div.product').addClass('in-wishlist');
            }
        }

        $('product-info .add-to-wishlist').on('click', function(){
            if($(this).parents('div.product').hasClass('in-wishlist')) {
                for(let j = 0; j < wishlistItems.length; j++) {
                    let currentId = wishlistItems[j].split(' || ')[0];

                    if(currentId === $(this).attr('data-id')){
                        $(this).parents('div.product').removeClass('in-wishlist');

                        wishlistItems.splice(j, 1);
                        localStorage.setItem('wishlist', JSON.stringify(wishlistItems));

                        buildWishlist();
                    }
                }
            }else{
                $(this).parents('div.product').addClass('in-wishlist');

                let productHandle = $(this).parents('div.product').attr('data-handle');
                let productTitle = $(this).parents('div.product').find('.product__title h1').html();
                let productPrice = $(this).parents('div.product').find('.fkk-product-price .price-item--regular').text();
                let productImage = $(this).parents('div.product').find('.product__media-wrapper ul li:first-child .product__media img').attr('src');
                let productId = $(this).attr('data-id');

                let addItem = true;

                if(wishlistItems.length > 0) {
                    for(let j = 0; j < wishlistItems.length; j++) {
                        if(wishlistItems[j].split(' || ')[0] === $(this).attr('data-id')) {
                            addItem = false;
                        }
                    }
                }
                if(addItem) {
                    wishlistItems.push(productId + ' || ' + productTitle + ' || ' + productPrice + ' || '+productImage + ' || ' + productHandle);
                    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));

                    buildWishlist();
                    $('.fkk-wishlist').trigger('click');
                }
            }
        })

        $('.product__info-container .fkk-product-price').after($('.product-rating > div:first-child'));
    }


    // BESPOKE INTRO
    const bespokeIntro = document.querySelector('body.bespoke-intro');
    if(bespokeIntro) {
        document.querySelector('body.bespoke-intro').style.minHeight = `${window.innerHeight}px`;
        document.querySelector('body.bespoke-intro #MainContent').style.minHeight = `${window.innerHeight}px`;

        document.querySelector('.bespoke-start')?.addEventListener('click', () => {
            // document.querySelector('body.bespoke-intro #MainContent .bespoke-choice .swiper-wrapper .bespoke-product:first-child').click();
            document.querySelector('body').classList.add('header-hide');
            document.querySelector('#MainContent > .bespoke-brown').classList.add('non-visible');
            document.querySelector('.bespoke-start').classList.add('non-visible');
            setTimeout(function(){
                document.querySelector('.bespoke-list').classList.add('no-opacity');
            },100);
            document.querySelector('.bespoke-choice').style.display = 'block';
            document.querySelector('.bespoke-choice .bespoke-choice-footer').classList.add('show', 'inactive');
        });
        document.querySelector('.bespoke-initial span.all-models')?.addEventListener('click', () => {
            document.querySelector('.bespoke-choice .bespoke-initial .bespoke-initial_one').classList.remove('hide');
            document.querySelector('.bespoke-choice .bespoke-initial .bespoke-initial_two').classList.remove('show');

            if (window.innerWidth > 1024) {
                document.querySelector('.bespoke-choice .bespoke-choice-footer').classList.remove('show', 'inactive');
                document.querySelector('#MainContent > .bespoke-brown').classList.remove('non-visible');

                document.querySelector('.bespoke-product.active').classList.remove('active');
            }else{
                document.querySelector('body.bespoke-intro .bespoke-list .swiper-wrapper .swiper-slide.active').classList.remove('active');
                document.querySelector('.bespoke-choice .bespoke-choice-footer').classList.add('inactive');
            }
            document.body.classList.remove('bespoke-chosen');
            document.querySelector('.swiper-wrapper').classList.remove('chosen');
            window.history.pushState('page2', 'Title', langUrlPart+'/pages/bespoke');
            document.querySelector('body').classList.remove('mobile-model');
            document.querySelector('.bespoke-knife-description').style.visibility = `hidden`;
            document.querySelector('.bespoke-choice-footer').classList.remove('show-summary');

            // document.querySelector('.bespoke-start').classList.remove('non-visible');
            // document.querySelector('.bespoke-choice').style.display = 'none';
            // document.querySelector('.bespoke-list').classList.remove('no-opacity');
        });
        document.querySelector('.bespoke-time span.close')?.addEventListener('click', () => {
            document.querySelector('.bespoke-choice .bespoke-choice-footer').classList.remove('show', 'inactive');
            document.querySelector('#MainContent > .bespoke-brown').classList.remove('non-visible');
            document.querySelector('body').classList.remove('header-hide');
            document.querySelector('.bespoke-start').classList.remove('non-visible');
            document.querySelector('.bespoke-choice').style.display = 'none';
            document.querySelector('.bespoke-list').classList.remove('no-opacity');
        });
        document.querySelector('.bespoke-initial .bespoke-initial_one span.close')?.addEventListener('click', () => {
            document.querySelector('.bespoke-choice .bespoke-choice-footer').classList.remove('show', 'inactive');
            document.querySelector('#MainContent > .bespoke-brown').classList.remove('non-visible');
            document.querySelector('body').classList.remove('header-hide');
            document.querySelector('.bespoke-start').classList.remove('non-visible');
            document.querySelector('.bespoke-choice').style.display = 'none';
            document.querySelector('.bespoke-list').classList.remove('no-opacity');
        });
        document.querySelector('.customizer-header-mobile .ch-right div.ch-close')?.addEventListener('click', () => {
            document.querySelector(".customizer-header-mobile .ch-change").click();
            document.querySelector('.bespoke-choice .bespoke-choice-footer').classList.remove('show', 'inactive');
            document.querySelector('#MainContent > .bespoke-brown').classList.remove('non-visible');
            document.querySelector('body').classList.remove('header-hide');
            document.querySelector('.bespoke-start').classList.remove('non-visible');
            document.querySelector('.bespoke-choice').style.display = 'none';
            document.querySelector('.bespoke-list').classList.remove('no-opacity');
        });

        document.querySelectorAll('.bespoke-list .bespoke-product:not(.bespoke-item-coming-soon)').forEach(product => {
            product.addEventListener('click', function() {
                document.querySelector('.bespoke-choice-footer').classList.add('show-summary');
                document.querySelector('.bespoke-choice .bespoke-initial .bespoke-initial_one').classList.add('hide');
                document.querySelector('.bespoke-choice .bespoke-initial .bespoke-initial_two').classList.add('show');

                let footer = document.querySelector('.bespoke-choice .bespoke-choice-footer');
                let mainContent = document.querySelector('#MainContent > .bespoke-brown');

                footer.classList.add('loading');

                let chosenHandle = product.getAttribute('data-handle');
                document.getElementById('bladeGeometry').innerHTML = '';
                $('.canvas-engraving').text('');

                if (!window.location.search || windowLocationUsed) {
                    window.history.pushState('page2', 'Title', langUrlPart+'/pages/bespoke/?knife=' + chosenHandle);
                }
                const parentElement = this.parentElement;
                parentElement.classList.add('chosen');

                const bespokeProductActive = parentElement.querySelector('.bespoke-product.active');
                bespokeProductActive?.classList.remove('active');
                this.classList.add('active');

                let leadTime = document.querySelector('.bespoke-knife[data-knife="'+product.getAttribute('data-handle')+'"]').getAttribute('data-lead');
                document.querySelector('.bespoke-time span:nth-child(1) span').textContent = leadTime;
                if(htmlLang === 'es') {
                    leadTime = document.querySelector('.bespoke-knife[data-knife="'+product.getAttribute('data-handle')+'"]').getAttribute('data-lead-es');
                    document.querySelector('.bespoke-time span.es span').textContent = leadTime;
                }


                let chosenTitle = product.querySelector('.bp-title')?.innerHTML || null;
                let chosenShortDescription = product.querySelector('.bp-short')?.innerHTML || null;
                let chosenDescription = product.querySelector('.bp-description')?.innerHTML || null;

                if(chosenDescription) {
                    if(chosenShortDescription){
                        document.querySelector('.bespoke-knife-description').innerHTML = '<div class="bc-title">'+chosenTitle+' '+chosenShortDescription+'</div>'+'<div class="bc-description">'+chosenDescription+'</div>';
                    }else{
                        document.querySelector('.bespoke-knife-description').innerHTML = '<div class="bc-title">'+chosenTitle+'</div>'+'<div class="bc-description">'+chosenDescription+'</div>';
                    }
                }else{
                    if(chosenShortDescription){
                        document.querySelector('.bespoke-knife-description').innerHTML = '<div class="bc-title">'+chosenTitle+' '+chosenShortDescription+'</div>';
                    }else{
                        document.querySelector('.bespoke-knife-description').innerHTML = '<div class="bc-title">'+chosenTitle+'</div>';
                    }
                }
                document.querySelector('body').classList.add('mobile-model');
                document.querySelector('.bespoke-knife-description').style.visibility = `visible`;


                let knifeAddons = '';
                
                if (document.querySelectorAll('.bespoke-product.active .bp-addons .bp-addon').length > 0) {
                    const bespokeProduct = document.querySelector('.bespoke-product.active');
                    const addonsContainer = document.querySelector('.bespoke-addons-images');
                    const optionalAddonsSection = document.querySelector('#optionalAddons .section-content');
                    let knifeAddons = '';

                    if (bespokeProduct) {
                        const addons = bespokeProduct.querySelectorAll('.bp-addons .bp-addon');

                        addons.forEach(addon => {
                            const imageSrc = addon.getAttribute('data-image');
                            const dataId = addon.getAttribute('data-id');
                            const dataTitle = addon.getAttribute('data-title');
                            const dataPrice = parseInt(addon.getAttribute('data-price')) / 100;
                            const dataInventory = addon.getAttribute('data-inventory');
                            const description = addon.querySelector('.description')?.innerHTML || '';

                            // Append image
                            if (addonsContainer) {
                                const imgElement = document.createElement('img');
                                imgElement.src = imageSrc;
                                imgElement.setAttribute('data-id', dataId);
                                imgElement.alt = dataTitle;
                                addonsContainer.appendChild(imgElement);
                            }

                            // Create addon entry
                            knifeAddons += `
                            <div class="addon" data-price="${dataPrice}" data-id="${dataId}" data-image="${imageSrc}">
                                <input type="checkbox" name="addon" id="${dataId}" data-inventory="${dataInventory}">
                                <label for="${dataId}">
                                    <span class="addon-title">${dataTitle}</span>
                                    <span class="addon-description">${description}</span>
                                    <span class="addon-price">+${dataPrice}</span>
                                    <span class="out-of-stock" style="display: none;">Out of stock</span>
                                </label>
                            </div>`;
                        });
                    }

                    if(optionalAddonsSection){
                        let bladeGuardsHtml = '';
                        
                        // Add Blade Guards if they exist in collection
                        if (window.appData && window.appData.currentCollection) {
                            const bladeGuardModels = window.getModelsByType(window.appData.currentCollection, "bladeGuards");
                            if (bladeGuardModels.length > 0) {
                                let bladeGuardTitle = 'Blade Guards';
                                let noGuardText = 'No Guard';
                        if(htmlLang === 'es') {
                                    bladeGuardTitle = 'Protectores de hoja';
                                    noGuardText = 'Sin protector';
                                }
                                
                                bladeGuardsHtml = `
                                    <div class="group-info blade-guards" data-type="Blade Guards">
                                        <h3>${bladeGuardTitle}</h3>
                                        <div class="colors-container">
                                `;
                                
                                let firstModel = null;
                                let firstColor = null;
                                let isFirstColor = true;
                                
                                bladeGuardModels.forEach((model, index) => {
                                    // Get colors from model refGroups
                                    if (model.refGroups && model.refGroups.length > 0) {
                                        const group = model.refGroups[0];
                                        if (group.groupedNodes && group.groupedNodes.length > 0) {
                                            const groupedNode = group.groupedNodes[0];
                                            if (groupedNode.settingsData && groupedNode.settingsData.difmaps) {
                                                groupedNode.settingsData.difmaps.forEach((difmap) => {
                                                    if (difmap.colors && difmap.colors.length > 0) {
                                                        difmap.colors.forEach((color) => {
                                                            const colorValue = typeof color === 'string' ? color : (color?.value || color?.color || '#000000');
                                                            const colorId = `bladeguard-${model.fileName}-${colorValue.toString().replace('#', '')}`;
                                                            
                                                            // Store first model and color for auto-selection
                                                            if (isFirstColor) {
                                                                firstModel = model;
                                                                firstColor = colorValue;
                                                                isFirstColor = false;
                                                            }
                                                            
                                                            const isFirstColorButton = firstModel === model && firstColor === colorValue;
                                                            bladeGuardsHtml += `
                                                                <button class="color-sample ${isFirstColorButton ? 'color-sample-active' : ''}" 
                                                                        style="background-color: ${colorValue};" 
                                                                        data-model-file="${model.fileName}"
                                                                        data-model-name="${model.textFileName}"
                                                                        data-color="${colorValue}"
                                                                        title="${model.textFileName} - ${colorValue}">
                                                                </button>
                                                            `;
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });
                                
                                bladeGuardsHtml += `
                                        </div>
                                    </div>
                                `;
                                
                                // Store first model and color for step 6 activation
                                window.appData.bladeGuardDefaults = {
                                    firstModel: firstModel,
                                    firstColor: firstColor
                                };
                            }
                        }
                        
                        if(htmlLang === 'es') {
                            optionalAddonsSection.innerHTML = `<h3>Selecciona todos los que quieras:</h3>${bladeGuardsHtml}<div class="addons-list">${knifeAddons}</div>`;
                        }else{
                            optionalAddonsSection.innerHTML = `<h3>Choose as many as you'd like:</h3>${bladeGuardsHtml}<div class="addons-list">${knifeAddons}</div>`;
                        }
                        
                        // Add event listener for blade guard header toggle
                        const bladeGuardHeader = document.querySelector('.group-info.blade-guards h3');
                        const bladeGuardSection = document.querySelector('.group-info.blade-guards');
                        
                        if (bladeGuardHeader && bladeGuardSection) {
                            bladeGuardHeader.addEventListener('click', function() {
                                if (bladeGuardSection.classList.contains('disabled')) {
                                    // Enable blade guards
                                    bladeGuardSection.classList.remove('disabled');
                                    window.appData.bladeGuardsEnabled = true;
                                    
                                    // Auto-select first color when enabling
                                    if (window.appData.bladeGuardDefaults) {
                                        const { firstModel, firstColor } = window.appData.bladeGuardDefaults;
                                        if (firstModel && firstColor) {
                                            // Find and activate first color button
                                            const firstColorButton = document.querySelector(`[data-model-file="${firstModel.fileName}"][data-color="${firstColor}"]`);
                                            if (firstColorButton) {
                                                // Remove all active classes first
                                                document.querySelectorAll('.group-info.blade-guards .color-sample').forEach(btn => {
                                                    btn.classList.remove('color-sample-active');
                                                });
                                                // Add active class to first color
                                                firstColorButton.classList.add('color-sample-active');
                                                
                                                // Send model to React
                                                const nodeMaterials = window.createBladeGuardNodeMaterials ? window.createBladeGuardNodeMaterials(firstModel, firstColor) : {};
                                                const modelWithColor = {
                                                    ...firstModel,
                                                    selectedColor: firstColor,
                                                    nodeMaterials: nodeMaterials
                                                };
                                                
                                                console.log('🔄 Re-enabling blade guard with first color:', firstModel.textFileName, firstColor);
                                                
                                                window.appData.currentModels.bladeGuard = modelWithColor;
                                                if (document.shopifyConnect) {
                                                    document.shopifyConnect.triggerBladeGuardModelChange(modelWithColor);
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    // Disable blade guards
                                    bladeGuardSection.classList.add('disabled');
                                    window.appData.bladeGuardsEnabled = false;
                                    window.appData.currentModels.bladeGuard = null;
                                    if (document.shopifyConnect) {
                                        document.shopifyConnect.triggerBladeGuardModelChange(null);
                                    }
                                }
                            });
                        }

                        // Add event listeners for blade guard colors
                        document.querySelectorAll('.group-info.blade-guards .color-sample').forEach(colorButton => {
                            colorButton.addEventListener('click', function() {
                                if (bladeGuardSection.classList.contains('disabled')) return; // Don't allow color change if disabled
                                
                                // Remove active class from all blade guard colors
                                document.querySelectorAll('.group-info.blade-guards .color-sample').forEach(btn => {
                                    btn.classList.remove('color-sample-active');
                                });
                                
                                // Add active class to clicked color
                                this.classList.add('color-sample-active');
                                
                                // Update blade guard model
                                const modelFile = this.getAttribute('data-model-file');
                                const modelName = this.getAttribute('data-model-name');
                                const selectedColor = this.getAttribute('data-color');
                                
                                if (window.appData && window.appData.currentCollection) {
                                    const bladeGuardModels = window.getModelsByType(window.appData.currentCollection, "bladeGuards");
                                    const selectedModel = bladeGuardModels.find(model => model.fileName === modelFile);
                                    
                                    if (selectedModel) {
                                        const nodeMaterials = window.createBladeGuardNodeMaterials ? window.createBladeGuardNodeMaterials(selectedModel, selectedColor) : {};
                                        const modelWithColor = {
                                            ...selectedModel,
                                            selectedColor: selectedColor,
                                            nodeMaterials: nodeMaterials
                                        };
                                        
                                        console.log('🎨 User selected blade guard color (location 2):', {
                                            fileName: selectedModel.fileName,
                                            textFileName: selectedModel.textFileName,
                                            selectedColor: selectedColor,
                                            nodeMaterials: nodeMaterials,
                                            modelType: selectedModel.modelType
                                        });
                                        
                                        window.appData.currentModels.bladeGuard = modelWithColor;
                                        if (document.shopifyConnect) {
                                            document.shopifyConnect.triggerBladeGuardModelChange(modelWithColor);
                                        }
                                    }
                                }
                            });
                        });

                    }

                    const addonsList = document.querySelector('.addons-list');
                    const addonsImagesContainer = document.querySelector('.bespoke-addons-images');

                    if (addonsList && addonsImagesContainer) {
                        if (window.innerWidth > 1100) {
                            addonsList.addEventListener('mouseenter', function (event) {
                                const target = event.target.closest('.addon');
                                if (target) {
                                    addonsImagesContainer.style.display = 'block';
                                    const image = addonsImagesContainer.querySelector(`img[data-id="${target.getAttribute('data-id')}"]`);
                                    if (image) {
                                        image.classList.add('show');
                                    }
                                }
                            }, true);
                            addonsList.addEventListener('mouseleave', function () {
                                addonsImagesContainer.style.display = 'none';
                                addonsImagesContainer.querySelectorAll('img').forEach(img => img.classList.remove('show'));
                            }, true);
                        }else{
                            addonsList.addEventListener('click', function (event) {
                                const target = event.target.closest('.addon'); // Find the closest .addon element
                                if (event.target.tagName.toLowerCase() === 'label') {
                                    if (target) {
                                        const image = addonsImagesContainer.querySelector(`img[data-id="${target.getAttribute('data-id')}"]`);

                                        if (image) {
                                            if (target.classList.contains('selected')) {
                                                // Remove 'selected' from addon and 'show' from image
                                                target.classList.remove('selected');
                                                image.classList.remove('show');
                                            } else {
                                                // Add 'selected' to addon and 'show' to image
                                                target.classList.add('selected');
                                                image.classList.add('show');
                                                addonsImagesContainer.style.display = 'block'; // Show container if hidden
                                            }
                                        }
                                    }
                                }
                            }, true);
                        }
                    }

                    document.querySelectorAll('.addons-list .addon input[type="checkbox"]').forEach(checkbox => {
                        checkbox.addEventListener('change', function () {
                            if (typeof chosenProductVariants !== 'undefined' && chosenProductVariants) {
                                setTimeout(function(){
                                    getNewPrice(getBespokeVariant());
                                }, 100)
                            }
                        });
                    });
                }else{
                    const optionalAddonsContent = document.querySelector('#optionalAddons .section-content');
                    if (optionalAddonsContent) {
                        optionalAddonsContent.innerHTML = '';
                    }
                }

                let targetCollectionName = this.getAttribute('data-title');
                TARGET_COLLECTION_ID = appData.collections.find(item => item.name === targetCollectionName)?.id;

                if (document.body.classList.contains('bespoke-chosen')) {
                    document.body.classList.remove('bespoke-chosen');
                    footer.classList.add('show', 'inactive');

                    setTimeout(() => initializeApp(), 200);
                    setTimeout(() => {
                        setPosition(1);
                        if (window.innerWidth > 1024) {
                            document.body.classList.add('bespoke-chosen');
                        }
                        getKnifeInfo();
                    }, 300);
                } else {
                    initializeApp();

                    if (mainContent) {
                        if (window.innerWidth > 1024) {
                            mainContent.classList.add('non-visible');
                        }
                    }

                    setTimeout(() => {
                        if (window.innerWidth > 1024) {
                            document.body.classList.add('bespoke-chosen');
                        }
                        footer.classList.add('show');
                        getKnifeInfo();
                    }, 100);
                }
                let productInitialPrice;

                let bpQuery = `query ($handle: String!) {
                       productByHandle(handle: $handle) {
                        variants(first: 100) {
                            nodes {
                              id
                              title
                              price
                              presentmentPrices(first: 250) {
                                nodes {
                                  price {
                                    amount
                                    currencyCode
                                  }
                                }
                              }
                            }
                        }
                      }
                    }`;
                const bpGraphql = JSON.stringify({
                    query: bpQuery,
                    variables: {
                        "handle": chosenHandle
                    }
                })
                const bpRequestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: bpGraphql,
                    redirect: "follow"
                };

                fetch(graphqlLink, bpRequestOptions)
                    .then((response) => response.text())
                    .then((result) => parseResultFour(result))
                    .catch((error) => console.error(error));

                function parseResultFour(result){
                    let resultJSON = JSON.parse(result);
                    let resultData = resultJSON.data;

                    if(htmlLang === 'es') {
                        document.querySelectorAll('.customizer-header .ch-back .ch-step, .customizer-header-mobile .ch-back .ch-step')
                            .forEach(el => {
                                el.innerHTML = el.innerHTML.replace(/Step(?![^<]*>)/, 'Paso');
                            });
                        document.querySelectorAll('.customizer-header .ch-right .ch-change, .customizer-header-mobile .ch-right .ch-change')
                            .forEach(el => {
                                el.innerHTML = el.innerHTML.replace(/Change knife(?![^<]*>)/i, 'Cambiar cuchillo');
                            });
                        document.querySelectorAll('.customizer-header .ch-right .ch-save, .customizer-header-mobile .ch-right .ch-save')
                            .forEach(el => {
                                el.innerHTML = el.innerHTML.replace(/Save(?![^<]*>)/i, 'Guardar');
                            });
                        document.querySelectorAll('.customizer-header .ch-right .ch-share, .customizer-header-mobile .ch-right .ch-share')
                            .forEach(el => {
                                el.innerHTML = el.innerHTML.replace(/Share(?![^<]*>)/i, 'Compartir')
                                    .replace(/Copy link(?![^<]*>)/i, 'Copiar enlace')
                                    .replace(/Link copied(?![^<]*>)/i, 'Enlace copiado');
                            });
                    }

                    chosenProductVariants = resultData.productByHandle.variants.nodes;

                    for (let i = 0; i < chosenProductVariants.length; i++) {
                        if (firstVariant.toLowerCase() === chosenProductVariants[i].title.toLowerCase()) {
                            let productPrices = chosenProductVariants[i].presentmentPrices.nodes;

                            for (let j = 0; j < productPrices.length; j++) {
                                if (productPrices[j].price.currencyCode === window.currency) {
                                    productInitialPrice = window.currency_symbol + parseInt(productPrices[j].price.amount);
                                }
                            }
                        }
                    }

                    document.querySelectorAll('[lang="es"] .cf-subtotal').forEach(el => {
                        el.innerHTML = el.innerHTML.replace('Subtotal (Inc. VAT)', 'Subtotal (IVA incluido)');
                    });
                    document.querySelectorAll('[lang="es"] .bcf-subtotal span').forEach(el => {
                        el.innerHTML = el.innerHTML.replace(/\bFrom\b/g, "Desde");
                    });
                    ['.bcf-subtotal span span', '.cf-subtotal span.subtotal-price'].forEach(selector => {
                        const element = document.querySelector(selector);
                        if (element) element.textContent = productInitialPrice;
                    });
                    // document.querySelector('.bcf-subtotal').classList.add('show');
                    document.querySelector('.bcf-subtotal > span').style.opacity = 1;

                    footer.classList.remove('inactive');
                    footer.classList.remove('loading');
                    setPosition(1);

                    // if(window.location.search && window.location.search.indexOf('&') === -1) {
                    //     let currentKnife = document.querySelector('.bespoke-product.active').getAttribute('data-handle');
                    //     if(sessionStorage.getItem(currentKnife) !== null) {
                    //         let chosenVersion = sessionStorage.getItem(currentKnife).split('&');

                    //         let knife = chosenVersion[0].split('=')[1];

                    //         setTimeout(function(){
                    //             for(let i = 1; i < chosenVersion.length; i++) {
                    //                 let knifeEl = chosenVersion[i].split('=');

                    //                 console.log(knifeEl[0]);

                    //                 if(knifeEl[0] === 'steel') {
                    //                     stepInit = 'steel';
                    //                     document.querySelector('#bladeSteel label[for="'+knifeEl[1]+'"]').click();
                    //                 }
                    //                 if(knifeEl[0] === 'geometry') {
                    //                     stepInit = 'geometry';
                    //                     document.querySelector('#bladeGeometry label[for="'+knifeEl[1]+'"]').click();
                    //                 }
                    //                 if(knifeEl[0] === 'finish') {
                    //                     stepInit = 'finish';
                    //                     document.querySelector('#bladeFinish label[for="'+knifeEl[1]+'"]').click();
                    //                 }
                    //                 if(knifeEl[0] === 'logic') {
                    //                     stepInit = 'logic';
                    //                     document.querySelector('#handleDesign label[for="'+knifeEl[1]+'"]').click();
                    //                 }

                    //                 if (knifeEl[0] === 'leather') {
                    //                     document
                    //                         .querySelector('.group-info[data-type="Leather Spacers"] .color-sample-active')
                    //                         ?.classList.remove('active');

                    //                     let leatherList = knifeEl[1].split('_');

                    //                     leatherList.forEach(label => {
                    //                         stepInit = 'leather';
                    //                         let button = document.querySelector(`.group-info[data-type="Leather Spacers"] button[data-name="${label}"]:not(.color-sample-active)`);
                    //                         button?.click();
                    //                     });
                    //                 }
                    //                 if (knifeEl[0] === 'colors') {
                    //                     document
                    //                         .querySelector('.group-info[data-type="Discs"] .color-sample-active')
                    //                         ?.classList.remove('active');

                    //                     let colorsList = knifeEl[1].split('_');

                    //                     colorsList.forEach(color => {
                    //                         stepInit = 'colors';
                    //                         let formattedColor = color.split('%20').join(' '); // Replace '%20' with spaces
                    //                         let button = document.querySelector(`.group-info[data-type="Discs"] button[data-name="${formattedColor}"]:not(.color-sample-active)`);
                    //                         button?.click();
                    //                     });
                    //                 }
                    //                 if(knifeEl[0] === 'pommel') {
                    //                     stepInit = 'pommel';
                    //                     $('.group-info[data-type="Pommel"] button[data-name="'+knifeEl[1]+'"]:not(.color-sample-active)').trigger('click');
                    //                 }
                    //                 if(knifeEl[0] === 'bolster') {
                    //                     stepInit = 'bolster';
                    //                     $('.group-info[data-type="Bolster"] button[data-name="'+knifeEl[1]+'"]:not(.color-sample-active)').trigger('click');
                    //                 }
                    //                 if (knifeEl[0] === 'laser') {
                    //                     if (knifeEl[1] !== 'no-engraving') {
                    //                         let label = document.querySelector('#laserEngraving label[for="laser-engraving"]');
                    //                         let input = document.querySelector('#laserEngraving label[for="laser-engraving"] input');

                    //                         label?.click();
                    //                         if (input) input.value = knifeEl[1];
                    //                         $('.canvas-engraving').text(knifeEl[1]);
                    //                     }
                    //                 }

                    //                 if (knifeEl[0] === 'addons') {
                    //                     let addonsItems = knifeEl[1].split('_');

                    //                     addonsItems.forEach(addon => {
                    //                         document.querySelector(`#optionalAddons .addons-list label[for="${addon}"]`)?.click();
                    //                     });
                    //                 }
                    //             }
                    //             setTimeout(function(){
                    //                 if(chosenProductVariants) {
                    //                     getNewPrice(getBespokeVariant());
                    //                 }
                    //             }, 100)
                    //             // document.querySelector('.bcf-cat')?.click();
                    //         },500)
                    //     }
                    // }
                }
            });
        });
        document.querySelectorAll('.bespoke-list .bespoke-product.bespoke-item-coming-soon').forEach(product => {
            if(product.getAttribute('data-handle') === window.location.search.split('=')[1]) {
                product.addEventListener('click', function() {
                    let footer = document.querySelector('.bespoke-choice .bespoke-choice-footer');
                    let mainContent = document.querySelector('#MainContent > .bespoke-brown');

                    footer.classList.add('loading');

                    let chosenHandle = product.getAttribute('data-handle');
                    document.getElementById('bladeGeometry').innerHTML = '';
                    $('.canvas-engraving').text('');

                    if (!window.location.search || windowLocationUsed) {
                        window.history.pushState('page2', 'Title', langUrlPart+'/pages/bespoke/?knife=' + chosenHandle);
                    }
                    const parentElement = this.parentElement;
                    parentElement.classList.add('chosen');

                    const bespokeProductActive = parentElement.querySelector('.bespoke-product.active');
                    bespokeProductActive?.classList.remove('active');
                    this.classList.add('active');

                    console.log(product.getAttribute('data-handle'));
                    console.log(document.querySelector('.bespoke-knife[data-knife="'+product.getAttribute('data-handle')+'"]'));
                    let leadTime = document.querySelector('.bespoke-knife[data-knife="'+product.getAttribute('data-handle')+'"]').getAttribute('data-lead');
                    document.querySelector('.bespoke-time span:nth-child(1) span').textContent = leadTime;
                    if(htmlLang === 'es') {
                        leadTime = document.querySelector('.bespoke-knife[data-knife="'+product.getAttribute('data-handle')+'"]').getAttribute('data-lead-es');
                        document.querySelector('.bespoke-time span.es span').textContent = leadTime;
                    }

                    let knifeAddons = '';
                    if (document.querySelectorAll('.bespoke-product.active .bp-addons .bp-addon').length > 0) {
                        const bespokeProduct = document.querySelector('.bespoke-product.active');
                        const addonsContainer = document.querySelector('.bespoke-addons-images');
                        const optionalAddonsSection = document.querySelector('#optionalAddons .section-content');
                        let knifeAddons = '';

                        if (bespokeProduct) {
                            const addons = bespokeProduct.querySelectorAll('.bp-addons .bp-addon');

                            addons.forEach(addon => {
                                const imageSrc = addon.getAttribute('data-image');
                                const dataId = addon.getAttribute('data-id');
                                const dataTitle = addon.getAttribute('data-title');
                                const dataPrice = parseInt(addon.getAttribute('data-price')) / 100;
                                const dataInventory = addon.getAttribute('data-inventory');
                                const description = addon.querySelector('.description')?.innerHTML || '';

                                // Append image
                                if (addonsContainer) {
                                    const imgElement = document.createElement('img');
                                    imgElement.src = imageSrc;
                                    imgElement.setAttribute('data-id', dataId);
                                    imgElement.alt = dataTitle;
                                    addonsContainer.appendChild(imgElement);
                                }

                                // Create addon entry
                                knifeAddons += `
                                <div class="addon" data-price="${dataPrice}" data-id="${dataId}" data-image="${imageSrc}">
                                    <input type="checkbox" name="addon" id="${dataId}" data-inventory="${dataInventory}">
                                    <label for="${dataId}">
                                        <span class="addon-title">${dataTitle}</span>
                                        <span class="addon-description">${description}</span>
                                        <span class="addon-price">+${dataPrice}</span>
                                        <span class="out-of-stock" style="display: none;">Out of stock</span>
                                    </label>
                                </div>`;
                            });
                        }

                        if (optionalAddonsSection) {
                            let bladeGuardsHtml = '';
                            
                            // Add Blade Guards if they exist in collection
                            if (window.appData && window.appData.currentCollection) {
                                const bladeGuardModels = window.getModelsByType(window.appData.currentCollection, "bladeGuards");
                                if (bladeGuardModels.length > 0) {
                                    let bladeGuardTitle = 'Blade Guards';
                                    let noGuardText = 'No Guard';
                            if(htmlLang === 'es') {
                                        bladeGuardTitle = 'Protectores de hoja';
                                        noGuardText = 'Sin protector';
                                    }
                                    
                                    bladeGuardsHtml = `
                                        <div class="group-info blade-guards" data-type="Blade Guards">
                                            <h3>${bladeGuardTitle}</h3>
                                            <div class="colors-container">
                                    `;
                                    
                                    let firstModel = null;
                                    let firstColor = null;
                                    let isFirstColor = true;
                                    
                                    bladeGuardModels.forEach((model, index) => {
                                        // Get colors from model refGroups
                                        if (model.refGroups && model.refGroups.length > 0) {
                                            const group = model.refGroups[0];
                                            if (group.groupedNodes && group.groupedNodes.length > 0) {
                                                const groupedNode = group.groupedNodes[0];
                                                if (groupedNode.settingsData && groupedNode.settingsData.difmaps) {
                                                    groupedNode.settingsData.difmaps.forEach((difmap) => {
                                                        if (difmap.colors && difmap.colors.length > 0) {
                                                            difmap.colors.forEach((color) => {
                                                                const colorValue = typeof color === 'string' ? color : (color?.value || color?.color || '#000000');
                                                                const colorId = `bladeguard-${model.fileName}-${colorValue.toString().replace('#', '')}`;
                                                                
                                                                // Store first model and color for auto-selection
                                                                if (isFirstColor) {
                                                                    firstModel = model;
                                                                    firstColor = colorValue;
                                                                    isFirstColor = false;
                                                                }
                                                                
                                                                const isFirstColorButton = firstModel === model && firstColor === colorValue;
                                                                bladeGuardsHtml += `
                                                                    <button class="color-sample ${isFirstColorButton ? 'color-sample-active' : ''}" 
                                                                            style="background-color: ${colorValue};" 
                                                                            data-model-file="${model.fileName}"
                                                                            data-model-name="${model.textFileName}"
                                                                            data-color="${colorValue}"
                                                                            title="${model.textFileName} - ${colorValue}">
                                                                    </button>
                                                                `;
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });
                                    
                                    bladeGuardsHtml += `
                                            </div>
                                        </div>
                                    `;
                                    
                                    // Store first model and color for step 6 activation  
                                    window.appData.bladeGuardDefaults = {
                                        firstModel: firstModel,
                                        firstColor: firstColor
                                    };
                                }
                            }
                            
                            if(htmlLang === 'es') {
                                optionalAddonsSection.innerHTML = `<h3>Selecciona todos los que quieras:</h3>${bladeGuardsHtml}<div class="addons-list">${knifeAddons}</div>`;
                            }else{
                                optionalAddonsSection.innerHTML = `<h3>Choose as many as you'd like:</h3>${bladeGuardsHtml}<div class="addons-list">${knifeAddons}</div>`;
                            }
                            
                            // Add event listener for blade guard header toggle  
                            const bladeGuardHeader = document.querySelector('.group-info.blade-guards h3');
                            const bladeGuardSection = document.querySelector('.group-info.blade-guards');
                            
                            if (bladeGuardHeader && bladeGuardSection) {
                                bladeGuardHeader.addEventListener('click', function() {
                                    if (bladeGuardSection.classList.contains('disabled')) {
                                        // Enable blade guards
                                        bladeGuardSection.classList.remove('disabled');
                                        window.appData.bladeGuardsEnabled = true;
                                        
                                        // Auto-select first color when enabling
                                        if (window.appData.bladeGuardDefaults) {
                                            const { firstModel, firstColor } = window.appData.bladeGuardDefaults;
                                            if (firstModel && firstColor) {
                                                // Find and activate first color button
                                                const firstColorButton = document.querySelector(`[data-model-file="${firstModel.fileName}"][data-color="${firstColor}"]`);
                                                if (firstColorButton) {
                                                    // Remove all active classes first
                                                    document.querySelectorAll('.group-info.blade-guards .color-sample').forEach(btn => {
                                                        btn.classList.remove('color-sample-active');
                                                    });
                                                    // Add active class to first color
                                                    firstColorButton.classList.add('color-sample-active');
                                                    
                                                    // Send model to React
                                                    const nodeMaterials = window.createBladeGuardNodeMaterials ? window.createBladeGuardNodeMaterials(firstModel, firstColor) : {};
                                                    const modelWithColor = {
                                                        ...firstModel,
                                                        selectedColor: firstColor,
                                                        nodeMaterials: nodeMaterials
                                                    };
                                                    
                                                    console.log('🔄 Re-enabling blade guard with first color (location 2):', firstModel.textFileName, firstColor);
                                                    
                                                    window.appData.currentModels.bladeGuard = modelWithColor;
                                                    if (document.shopifyConnect) {
                                                        document.shopifyConnect.triggerBladeGuardModelChange(modelWithColor);
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        // Disable blade guards
                                        bladeGuardSection.classList.add('disabled');
                                        window.appData.bladeGuardsEnabled = false;
                                        window.appData.currentModels.bladeGuard = null;
                                        if (document.shopifyConnect) {
                                            document.shopifyConnect.triggerBladeGuardModelChange(null);
                                        }
                                    }
                                });
                            }

                            // Add event listeners for blade guard colors
                            document.querySelectorAll('.group-info.blade-guards .color-sample').forEach(colorButton => {
                                colorButton.addEventListener('click', function() {
                                    if (bladeGuardSection && bladeGuardSection.classList.contains('disabled')) return; // Don't allow color change if disabled
                                    
                                    // Remove active class from all blade guard colors
                                    document.querySelectorAll('.group-info.blade-guards .color-sample').forEach(btn => {
                                        btn.classList.remove('color-sample-active');
                                    });
                                    
                                    // Add active class to clicked color
                                    this.classList.add('color-sample-active');
                                    
                                    // Update blade guard model
                                    const modelFile = this.getAttribute('data-model-file');
                                    const modelName = this.getAttribute('data-model-name');
                                    const selectedColor = this.getAttribute('data-color');
                                    
                                    if (window.appData && window.appData.currentCollection) {
                                        const bladeGuardModels = window.getModelsByType(window.appData.currentCollection, "bladeGuards");
                                        const selectedModel = bladeGuardModels.find(model => model.fileName === modelFile);
                                        
                                        if (selectedModel) {
                                            const nodeMaterials = window.createBladeGuardNodeMaterials ? window.createBladeGuardNodeMaterials(selectedModel, selectedColor) : {};
                                            const modelWithColor = {
                                                ...selectedModel,
                                                selectedColor: selectedColor,
                                                nodeMaterials: nodeMaterials
                                            };
                                            
                                            console.log('🎨 User selected blade guard color:', {
                                                fileName: selectedModel.fileName,
                                                textFileName: selectedModel.textFileName,
                                                selectedColor: selectedColor,
                                                nodeMaterials: nodeMaterials,
                                                modelType: selectedModel.modelType
                                            });
                                            
                                            window.appData.currentModels.bladeGuard = modelWithColor;
                                            if (document.shopifyConnect) {
                                                document.shopifyConnect.triggerBladeGuardModelChange(modelWithColor);
                                            }
                                        }
                                    }
                                });
                            });

                        }

                        const addonsList = document.querySelector('.addons-list');
                        const addonsImagesContainer = document.querySelector('.bespoke-addons-images');

                        if (addonsList && addonsImagesContainer) {
                            if (window.innerWidth > 1100) {
                                addonsList.addEventListener('mouseenter', function (event) {
                                    const target = event.target.closest('.addon');
                                    if (target) {
                                        addonsImagesContainer.style.display = 'block';
                                        const image = addonsImagesContainer.querySelector(`img[data-id="${target.getAttribute('data-id')}"]`);
                                        if (image) {
                                            image.classList.add('show');
                                        }
                                    }
                                }, true);
                                addonsList.addEventListener('mouseleave', function () {
                                    addonsImagesContainer.style.display = 'none';
                                    addonsImagesContainer.querySelectorAll('img').forEach(img => img.classList.remove('show'));
                                }, true);
                            }else{
                                addonsList.addEventListener('click', function (event) {
                                    const target = event.target.closest('.addon'); // Find the closest .addon element
                                    if (event.target.tagName.toLowerCase() === 'label') {
                                        if (target) {
                                            const image = addonsImagesContainer.querySelector(`img[data-id="${target.getAttribute('data-id')}"]`);

                                            if (image) {
                                                if (target.classList.contains('selected')) {
                                                    // Remove 'selected' from addon and 'show' from image
                                                    target.classList.remove('selected');
                                                    image.classList.remove('show');
                                                } else {
                                                    // Add 'selected' to addon and 'show' to image
                                                    target.classList.add('selected');
                                                    image.classList.add('show');
                                                    addonsImagesContainer.style.display = 'block'; // Show container if hidden
                                                }
                                            }
                                        }
                                    }
                                }, true);
                            }
                        }

                        document.querySelectorAll('.addons-list .addon input[type="checkbox"]').forEach(checkbox => {
                            checkbox.addEventListener('change', function () {
                                if (typeof chosenProductVariants !== 'undefined' && chosenProductVariants) {
                                    setTimeout(function(){
                                        getNewPrice(getBespokeVariant());
                                    }, 100)
                                }
                            });
                        });
                    }else{
                        const optionalAddonsContent = document.querySelector('#optionalAddons .section-content');
                        if (optionalAddonsContent) {
                            optionalAddonsContent.innerHTML = '';
                        }
                    }

                    let targetCollectionName = this.getAttribute('data-title');
                    TARGET_COLLECTION_ID = appData.collections.find(item => item.name === targetCollectionName)?.id;

                    if (document.body.classList.contains('bespoke-chosen')) {
                        document.body.classList.remove('bespoke-chosen');
                        footer.classList.add('show', 'inactive');

                        setTimeout(() => initializeApp(), 200);
                        setTimeout(() => {
                            setPosition(1);
                            if (window.innerWidth > 1024) {
                                document.body.classList.add('bespoke-chosen');
                            }
                            getKnifeInfo();
                        }, 300);
                    } else {
                        initializeApp();

                        if (mainContent) {
                            if (window.innerWidth > 1024) {
                                mainContent.classList.add('non-visible');
                            }
                        }

                        setTimeout(() => {
                            if (window.innerWidth > 1024) {
                                document.body.classList.add('bespoke-chosen');
                            }
                            footer.classList.add('show');
                            getKnifeInfo();
                        }, 100);
                    }
                    let productInitialPrice;

                    let bpQuery = `query ($handle: String!) {
                           productByHandle(handle: $handle) {
                            variants(first: 100) {
                                nodes {
                                  id
                                  title
                                  price
                                  presentmentPrices(first: 250) {
                                    nodes {
                                      price {
                                        amount
                                        currencyCode
                                      }
                                    }
                                  }
                                }
                            }
                          }
                        }`;
                    const bpGraphql = JSON.stringify({
                        query: bpQuery,
                        variables: {
                            "handle": chosenHandle
                        }
                    })
                    const bpRequestOptions = {
                        method: "POST",
                        headers: myHeaders,
                        body: bpGraphql,
                        redirect: "follow"
                    };

                    fetch(graphqlLink, bpRequestOptions)
                        .then((response) => response.text())
                        .then((result) => parseResultFour(result))
                        .catch((error) => console.error(error));

                    function parseResultFour(result){
                        let resultJSON = JSON.parse(result);
                        let resultData = resultJSON.data;

                        if(htmlLang === 'es') {
                            document.querySelectorAll('.customizer-header .ch-back .ch-step, .customizer-header-mobile .ch-back .ch-step')
                                .forEach(el => {
                                    el.innerHTML = el.innerHTML.replace(/Step(?![^<]*>)/, 'Paso');
                                });
                            document.querySelectorAll('.customizer-header .ch-right .ch-change, .customizer-header-mobile .ch-right .ch-change')
                                .forEach(el => {
                                    el.innerHTML = el.innerHTML.replace(/Change knife(?![^<]*>)/i, 'Cambiar cuchillo');
                                });
                            document.querySelectorAll('.customizer-header .ch-right .ch-save, .customizer-header-mobile .ch-right .ch-save')
                                .forEach(el => {
                                    el.innerHTML = el.innerHTML.replace(/Save(?![^<]*>)/i, 'Guardar');
                                });
                            document.querySelectorAll('.customizer-header .ch-right .ch-share, .customizer-header-mobile .ch-right .ch-share')
                                .forEach(el => {
                                    el.innerHTML = el.innerHTML.replace(/Share(?![^<]*>)/i, 'Compartir')
                                        .replace(/Copy link(?![^<]*>)/i, 'Copiar enlace')
                                        .replace(/Link copied(?![^<]*>)/i, 'Enlace copiado');
                                });
                        }

                        chosenProductVariants = resultData.productByHandle.variants.nodes;

                        for (let i = 0; i < chosenProductVariants.length; i++) {
                            if (firstVariant.toLowerCase() === chosenProductVariants[i].title.toLowerCase()) {
                                let productPrices = chosenProductVariants[i].presentmentPrices.nodes;

                                for (let j = 0; j < productPrices.length; j++) {
                                    if (productPrices[j].price.currencyCode === window.currency) {
                                        productInitialPrice = window.currency_symbol + parseInt(productPrices[j].price.amount);
                                    }
                                }
                            }
                        }

                        document.querySelectorAll('[lang="es"] .cf-subtotal').forEach(el => {
                            el.innerHTML = el.innerHTML.replace('Subtotal (Inc. VAT)', 'Subtotal (IVA incluido)');
                        });
                        document.querySelectorAll('[lang="es"] .bcf-subtotal span').forEach(el => {
                            el.innerHTML = el.innerHTML.replace(/\bFrom\b/g, "Desde");
                        });
                        ['.bcf-subtotal span span', '.cf-subtotal span.subtotal-price'].forEach(selector => {
                            const element = document.querySelector(selector);
                            if (element) element.textContent = productInitialPrice;
                        });
                        // document.querySelector('.bcf-subtotal').classList.add('show');
                        document.querySelector('.bcf-subtotal > span').style.opacity = 1;

                        footer.classList.remove('inactive');
                        footer.classList.remove('loading');
                        setPosition(1);

                        // if(window.location.search && window.location.search.indexOf('&') === -1) {
                        //     let currentKnife = document.querySelector('.bespoke-product.active').getAttribute('data-handle');
                        //     if(sessionStorage.getItem(currentKnife) !== null) {
                        //         let chosenVersion = sessionStorage.getItem(currentKnife).split('&');
                        //
                        //         let knife = chosenVersion[0].split('=')[1];
                        //
                        //         setTimeout(function(){
                        //             for(let i = 1; i < chosenVersion.length; i++) {
                        //                 let knifeEl = chosenVersion[i].split('=');
                        //
                        //                 if(knifeEl[0] === 'steel') {
                        //                     stepInit = 'steel';
                        //                     document.querySelector('#bladeSteel label[for="'+knifeEl[1]+'"]').click();
                        //                 }
                        //                 if(knifeEl[0] === 'geometry') {
                        //                     stepInit = 'geometry';
                        //                     document.querySelector('#bladeGeometry label[for="'+knifeEl[1]+'"]').click();
                        //                 }
                        //                 if(knifeEl[0] === 'finish') {
                        //                     stepInit = 'finish';
                        //                     document.querySelector('#bladeFinish label[for="'+knifeEl[1]+'"]').click();
                        //                 }
                        //                 if(knifeEl[0] === 'logic') {
                        //                     stepInit = 'logic';
                        //                     document.querySelector('#handleDesign label[for="'+knifeEl[1]+'"]').click();
                        //                 }
                        //
                        //                 if (knifeEl[0] === 'leather') {
                        //                     document
                        //                         .querySelector('.group-info[data-type="Leather Spacers"] .color-sample-active')
                        //                         ?.classList.remove('active');
                        //
                        //                     let leatherList = knifeEl[1].split('_');
                        //
                        //                     leatherList.forEach(label => {
                        //                         stepInit = 'leather';
                        //                         let button = document.querySelector(`.group-info[data-type="Leather Spacers"] button[data-name="${label}"]:not(.color-sample-active)`);
                        //                         button?.click();
                        //                     });
                        //                 }
                        //                 if (knifeEl[0] === 'colors') {
                        //                     document
                        //                         .querySelector('.group-info[data-type="Discs"] .color-sample-active')
                        //                         ?.classList.remove('active');
                        //
                        //                     let colorsList = knifeEl[1].split('_');
                        //
                        //                     colorsList.forEach(color => {
                        //                         stepInit = 'colors';
                        //                         let formattedColor = color.split('%20').join(' '); // Replace '%20' with spaces
                        //                         let button = document.querySelector(`.group-info[data-type="Discs"] button[data-name="${formattedColor}"]:not(.color-sample-active)`);
                        //                         button?.click();
                        //                     });
                        //                 }
                        //                 if(knifeEl[0] === 'pommel') {
                        //                     stepInit = 'pommel';
                        //                     $('.group-info[data-type="Pommel"] button[data-name="'+knifeEl[1]+'"]:not(.color-sample-active)').trigger('click');
                        //                 }
                        //                 if(knifeEl[0] === 'bolster') {
                        //                     stepInit = 'bolster';
                        //                     $('.group-info[data-type="Bolster"] button[data-name="'+knifeEl[1]+'"]:not(.color-sample-active)').trigger('click');
                        //                 }
                        //                 if (knifeEl[0] === 'laser') {
                        //                     if (knifeEl[1] !== 'no-engraving') {
                        //                         let label = document.querySelector('#laserEngraving label[for="laser-engraving"]');
                        //                         let input = document.querySelector('#laserEngraving label[for="laser-engraving"] input');
                        //
                        //                         label?.click();
                        //                         if (input) input.value = knifeEl[1];
                        //                         $('.canvas-engraving').text(knifeEl[1]);
                        //                     }
                        //                 }
                        //
                        //                 if (knifeEl[0] === 'addons') {
                        //                     let addonsItems = knifeEl[1].split('_');
                        //
                        //                     addonsItems.forEach(addon => {
                        //                         document.querySelector(`#optionalAddons .addons-list label[for="${addon}"]`)?.click();
                        //                     });
                        //                 }
                        //             }
                        //             setTimeout(function(){
                        //                 if(chosenProductVariants) {
                        //                     getNewPrice(getBespokeVariant());
                        //                 }
                        //             }, 100)
                        //             // document.querySelector('.bcf-cat')?.click();
                        //         },500)
                        //     }
                        // }
                    }
                });
            }
        });

        document.querySelector('.bcf-cat')?.addEventListener('click', () => {
            const bcTitle = document.querySelector('.bc-title');

            if (bcTitle) {
                const firstPart = bcTitle.innerText.split(' — ')[0]; // take only first part
                document.querySelectorAll('.customizer-header .ch-name, .customizer-header-mobile .ch-name')
                    .forEach(el => el.innerText = firstPart);
            }

            document.querySelector('.bespoke-choice').classList.add('non-visible');
            document.querySelector('.bespoke-customizer').classList.add('show');

            setPosition(2);
            if (window.innerWidth < 1025) {
                document.body.classList.add('bespoke-chosen');
            }
            setTimeout(function(){
                document.querySelector('.bespoke-knife-description').style.visibility = `hidden`;
            },500)
        });
        document.querySelectorAll('.fkk-bespoke-images').forEach(fkkImage => {
            fkkImage.querySelectorAll('.bespoke__images-item').forEach(item => {
                if (parseFloat(item.getAttribute('data-ratio')) > 1) {
                    item.classList.add('image-landscape');
                }
            });
        });

        document.querySelectorAll(".ch-save").forEach(button => {
            button.addEventListener("click", () => {
                let saveElements = buildUrl().split('&');
                let saveKnife = saveElements[0].split('=')[1];

                getBespokeVariant();
                const foundVariant = chosenProductVariants.find(
                    (variant) => {
                        return variant.title.toLowerCase() === getBespokeVariant().toLowerCase();
                    }
                );

                let productId = foundVariant.id.split('/')[4];

                let productTitle = document.querySelector('div.bespoke-product.active .bp-title')?.textContent || '';
                let productPrice = document.querySelector('.customizer-footer .subtotal-price')?.textContent || '';
                let productImage = document.querySelector('div.bespoke-product.active img')?.getAttribute('src') || '';

                let laserId = document.querySelector('.bespoke-list .bespoke-laser')?.getAttribute('data-id') || '';

                let addons_names = [];
                document.querySelectorAll('#optionalAddons .addon').forEach(addon => {
                    const addonTitle = addon.querySelector('input:checked + label .addon-title')?.textContent;
                    if (addonTitle && addonTitle !== '') {
                        addons_names.push(addonTitle);
                    }
                });

                wishlistItems.push(
                    productId + ' || ' +
                    productTitle + ' || ' +
                    productPrice + ' || ' +
                    productImage + ' || ' +
                    saveKnife + ' || ' +
                    buildUrl() + ' || ' +
                    laserId + ' || ' +
                    addons_names.join(' -- ')
                );

                localStorage.setItem('wishlist', JSON.stringify(wishlistItems));

                buildWishlist();
                document.querySelector('.fkk-wishlist')?.click();
            });
        });

        if (window.innerWidth < 1025) {
            bespokeSwiper = new Swiper('.bespoke-list.swiper', {
                slidesPerView: 'auto',
                loop: false,
                spaceBetween: 10,
                freeMode: true,
            });
        }
    }


    let fkkCollaborators = $('.fkk-collaborators');
    if(fkkCollaborators.length) {
        let collaboratorsLength = fkkCollaborators.find('.collaborators-item').length;
        fkkCollaborators.find('.collaborators-item:nth-child(-n+8)').addClass('shown');

        if(collaboratorsLength > 8) {
            fkkCollaborators.addClass('has-more');
        }

        fkkCollaborators.find('.collaborators-item').each(function(){
            let currentPosition = $(this).index() + 1;
            currentPosition < 10 ? $(this).find('.collaborators-item-number').text('0'+currentPosition) : $(this).find('.collaborators-item-number').text(currentPosition)
        })

        $('.fkk-collaborators.has-more div.view-collaborators button').on('click', function(){
            let collaboratorsLeft = fkkCollaborators.find('.collaborators-item:not(.shown)').length;
            let collaboratorsShown = fkkCollaborators.find('.collaborators-item.shown').length;
            if(collaboratorsLeft > 8) {
                for(let i = collaboratorsShown; i < collaboratorsShown+8; i++) {
                    fkkCollaborators.find('.collaborators-item').eq(i).slideDown().addClass('shown');
                }
            }else{
                fkkCollaborators.find('.collaborators-item:not(.shown)').slideDown().addClass('shown');
                fkkCollaborators.removeClass('has-more');
            }
        })
    }

    let fkkFaq =  $('.fkk-faq');
    if(fkkFaq.length) {
        fkkFaq.find('.faq-item').on('click', function () {
            if($(this).hasClass('open')) {
                $(this).removeClass('open');
                $(this).find('.answer').slideUp();
            }else{
                $(this).siblings().removeClass('open');
                $(this).siblings().find('.answer').slideUp();

                $(this).addClass('open');
                $(this).find('.answer').slideDown();
            }
        })
    }

    if(window.location.pathname != '/blogs/latest') {
        let fkkDiscover =  $('.discover-list');
        if(fkkDiscover.length) {
            let secondItemHeight = fkkDiscover.find('.discover-item').eq(2).outerHeight(true)
            fkkDiscover.find('.discover-item.discover-empty').css('height', secondItemHeight);

            fkkDiscover.masonry({
                itemSelector: '.discover-item',
                percentPosition: true,
                gutter: 12
            });
            $('body.template-blog').addClass('show-page');
        }
    }

    /* LATEST BLOGS */
    if(window.location.pathname === '/blogs/latest') {
        const blogsRequestOptions = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
                query: `query {
              blogs(first: 50)  {
                edges {
                  node {
                    title
                    handle
                    articles(first: 250) {
                      edges {
                        node {
                          title
                          handle
                          publishedAt
                          isPublished
                          summary
                          body
                          image {
                            src
                            width
                            height
                          }
                        metafield(namespace: "custom", key: "first_image") {
                          reference {
                            ... on MediaImage {
                              image {
                                originalSrc
                                width
                                height
                              }
                            }
                          }
                        }
                        metafields(first: 10) {
                            edges {
                              node {
                                namespace
                                value
                                key
                              }
                            }
                        }
                          tags
                        }
                      }
                    }
                  }
                }
              }
            }`,
                variables: {}
            }),
            redirect: "follow"
        };

        fetch(graphqlLink, blogsRequestOptions)
            .then((response) => response.text())
            .then((result) => parseResultFive(result))
            .catch((error) => console.error(error));

        function parseResultFive(result){
            let resultJSON = JSON.parse(result);
            let resultData = resultJSON.data;

            let blogs = resultData.blogs.edges;

            let latestArticles = [];
            let latestBlogs = [];

            for (let i = 0; i < blogs.length; i++) {
                let blogTitle = blogs[i].node.title;
                let blogHandle = blogs[i].node.handle;
                let articles = blogs[i].node.articles.edges;

                if(blogTitle !== 'Latest' && blogTitle !== 'Glossary') {
                    for (let j = 0; j < articles.length; j++) {
                        latestArticles.push(articles[j].node);
                        latestBlogs.push(blogHandle);
                    }
                }
            }

            let latestItems = '';
            for(let i = 0; i < latestArticles.length; i++) {
                let article = latestArticles[i];
                let articleBlog = latestBlogs[i];
                let articleTitle = article.title;
                let articleDate = article.publishedAt;
                let articleHandle = article.handle;
                let articleSummary;
                if(article.summary != '') {
                    articleSummary = article.summary;
                }else{
                    // articleSummary = cropString(article.body, 500);
                    articleSummary = '';
                }
                let articleTags = article.tags;
                let articleMetafields = article.metafields.edges;
                let articleSubInfo = '';
                let articleFeatured = '';
                let articleImageFormat = 'landscape';
                let articleImage = '';


                if(article.isPublished) {
                    if(article.metafield != null) {
                        let firstImage = article.metafield.reference.image;
                        articleImage = '<img src="'+firstImage.originalSrc+'" alt="'+articleTitle+'" loading="lazy">';
                        if(firstImage.height > firstImage.width) {
                            articleImageFormat = 'portrait';
                        }
                    } else {
                        articleImage = '<img src="'+article.image.src+'" alt="'+articleTitle+'" loading="lazy">';
                        if(article.image.height > article.image.width) {
                            articleImageFormat = 'portrait';
                        }
                    }

                    if(articleTags.length > 0) {
                        articleSubInfo = '<span class="discover-item__tags">'+articleTags[0]+'</span>';
                    }else{
                        let date = new Date(articleDate);
                        let formattedDate = date.toLocaleString('en-US', { month: 'long', day: 'numeric' });
                        articleSubInfo = '<span class="discover-item__date">'+formattedDate+'</span>';
                    }

                    if(articleMetafields.length > 0) {
                        for(let j = 0; j < articleMetafields.length; j++) {
                            if(articleMetafields[j].node.key === 'featured') {
                                articleFeatured = 'featured';
                            }
                        }
                    }

                    latestItems += '<div class="discover-item image-'+articleImageFormat+' '+articleFeatured+'" data-date="'+new Date(articleDate)+'">' +
                        '<div class="discover-item__image">' +
                        '<a href="/blogs/'+articleBlog+'/'+articleHandle+'">'+articleImage+'</a>' +
                        '</div>' +
                        '<div class="discover-item__content">' +
                        '<div class="discover-item__info">' + articleSubInfo + '</div>' +
                        '<h3 class="discover-item__heading">' +
                        '<a href="/blogs/'+articleBlog+'/'+articleHandle+'">'+articleTitle+'</a>' +
                        '</h3>' +
                        '<div class="discover-item__excerpt">'+articleSummary+'</div>'+
                        '</div>' +
                        '</div>';
                }
            }

            let fkkDiscover = $('.discover-list');
            fkkDiscover.html('<div class="discover-item discover-empty"></div><div class="discover-item discover-empty"></div>'+latestItems);

            // Get all .discover-item elements
            const items = $('.discover-list .discover-item').get();

            // Sort the items by date in descending order
            items.sort((a, b) => {
                const dateA = new Date($(a).attr('data-date'));
                const dateB = new Date($(b).attr('data-date'));
                return dateB - dateA;
            });

            // Append the sorted items to their parent
            const parent = items[0].parentElement;
            $(parent).empty().append(items);

            let secondItemHeight = fkkDiscover.find('.discover-item').eq(2).outerHeight(true)
            fkkDiscover.find('.discover-item.discover-empty').css('height', secondItemHeight);

            fkkDiscover.masonry({
                itemSelector: '.discover-item',
                percentPosition: true,
                gutter: 12
            });
            $('body.template-blog').addClass('show-page');
        }
    }

    let fkkArticle = $('body.template-article');
    if(fkkArticle.length) {
        let articleContent = fkkArticle.find('.article-content');
        let articleNavigationTrue = fkkArticle.find('.article-template').attr('data-navigation');
        if(articleNavigationTrue) {
            let articleNavigation = fkkArticle.find('.article-navigation');
            setTimeout(function(){
                let navigationItems = '';
                articleContent.children('h2').each(function(){
                    let h2Title = $(this).text();
                    let h2Offset = $(this).offset().top - 100;
                    $(this).attr('data-title', h2Title);

                    navigationItems += '<li data-title="'+h2Title+'" data-offset="'+h2Offset+'">'+h2Title+'</li>';
                });

                if($(window).width() > 1024) {
                    articleNavigation.append('<ul>'+navigationItems+'</ul>');
                }else{
                    $('.article-main').prepend('<div class="article-navigation"><ul>'+navigationItems+'</ul></div>');
                }


                // Scroll to anchor on navigation item click
                articleNavigation.find('li').on('click', function() {
                    let target = parseFloat($(this).attr('data-offset'));
                    $('html, body').animate({
                        scrollTop: target
                    }, 1000);

                    articleNavigation.find('li').removeClass('active');
                    $(this).addClass('active');
                });
            },500)

            // function updateActiveNavItem() {
            //     let scrollPos = $(window).scrollTop();
            //     let sections = articleContent.children('h2');
            //
            //     sections.each(function() {
            //         let sectionTitle = $(this).text();
            //         let sectionTop = articleNavigation.find('li[data-title="'+sectionTitle+'"]').attr('data-offset') - $(window).height() + 200;
            //
            //         // if
            //         // (scrollPos >= sectionTop && scrollPos <= sectionBottom) {
            //         //     articleNavigation.find('li').removeClass('active');
            //         //     articleNavigation.find('li[data-title="'+sectionTitle+'"]').addClass('active');
            //         // }
            //     });
            // }

            // // Update active navigation item on initial load
            // updateActiveNavItem();
            //
            // // Update active navigation item on scroll
            // $(window).on('scroll', function() {
            //     updateActiveNavItem();
            // });
        }
    }

    let fkkGlossary = $('section.section-glossary');
    if(fkkGlossary.length > 0) {
        let glossaryItems = [];
        fkkGlossary.find('.glossary-item').each(function(){
            glossaryItems.push($(this).find('.glossary-title').text()+' // '+$(this).attr('data-id'));
        })

        // Sort the array based on the alphabetic part, ignoring case sensitivity
        glossaryItems.sort(function(a, b) {
            let aText = a.split(' // ')[0].toLowerCase();
            let bText = b.split(' // ')[0].toLowerCase();
            return aText.localeCompare(bText);
        });

        for(let i = 0; i < glossaryItems.length; i++) {
            let itemId = glossaryItems[i].split(' // ')[1];
            fkkGlossary.find('.glossary-item[data-id="'+itemId+'"]').css('order', i);

            if(i+1 < 10) {
                fkkGlossary.find('.glossary-item[data-id="'+itemId+'"] .glossary-title sup').text('0'+(i+1));
            }else{
                fkkGlossary.find('.glossary-item[data-id="'+itemId+'"] .glossary-title sup').text(i+1);
            }
        }

        fkkGlossary.find('.glossary-item').on('mouseenter', function(e) {
            $(this).addClass('hovered');
        })
        fkkGlossary.find('.glossary-item').on('mouseleave', function(e) {
            $(this).removeClass('hovered');
        })

        $(document).mousemove(function(e) {
            let hoveredItemOffsetTop = fkkGlossary.find('.glossary-item.hovered').offset().top;
            let hoveredItemOffsetLeft = fkkGlossary.find('.glossary-item.hovered').offset().left;

            fkkGlossary.find('.glossary-item.hovered .glossary-image').css({
                left: (e.pageX - hoveredItemOffsetLeft),
                top: (e.pageY - hoveredItemOffsetTop) + 20
            });
        });
    }

    let fkkKnifeGuide = $('body.page-113697358072');
    if(fkkKnifeGuide.length) {
        let navigationHtml = '';

        $('section:not(.section-mainpage):not(.fkk-gallery)').each(function(){
            let section = $(this);
            let sectionTitle = section.find('.section-title').text();
            let sectionSubNavigation = '';

            if(section.hasClass('fkk-tasks')) {
                section.find('.point-title').each(function(){
                    sectionSubNavigation += '<li class="navSectionItem" data-title="'+$(this).text()+'">'+$(this).text()+'</li>';
                })
            }else if(section.hasClass('fkk-steel')) {
                section.find('.steel-title').each(function(){
                    sectionSubNavigation += '<li class="navSectionItem" data-title="'+$(this).text()+'">'+$(this).text()+'</li>';
                })
            }else if(section.hasClass('fkk-blade-geometry')) {
                section.find('.blade-geometry__title').each(function(){
                    sectionSubNavigation += '<li class="navSectionItem" data-title="'+$(this).text()+'">'+$(this).text()+'</li>';
                })
            }

            navigationHtml += '<div class="navSection"><div class="navSectionTitle" data-title="'+sectionTitle+'">'+sectionTitle+'</div><div class="navSectionBody"><ul>'+sectionSubNavigation+'</ul></div></div>';
        })
        $('#MainContent').append('<div id="guideNavigation">'+navigationHtml+'</div>');


        // Scroll to anchor on navigation item click
        body.on('click', '#guideNavigation .navSectionTitle', function() {
            if(!$(this).parent().hasClass('active')) {
                let titleCodename = $(this).attr('data-title');
                let titleTop = parseFloat($('.section-title[data-title="'+titleCodename+'"]').offset().top)-100;

                $('html, body').animate({
                    scrollTop: titleTop
                }, 1000);

                $(this).parent().parent().find('.navSection').removeClass('active');
                $(this).parent().parent().find('.navSection .navSectionBody').slideUp();

                $(this).parent().addClass('active');
                $(this).siblings().slideDown();
                $(this).parent().find('.navSectionBody .navSectionItem').eq(0).addClass('active');
            }else{
                $(this).parent().removeClass('active');
                $(this).siblings().slideUp();
                $(this).parent().find('.navSectionBody .navSectionItem').eq(0).removeClass('active');
            }
        });
        body.on('click', '#guideNavigation .navSectionBody .navSectionItem', function() {
            let titleCodename = $(this).attr('data-title');
            let titleTop = parseFloat($('.section-content [data-title="'+titleCodename+'"]').offset().top)-100;

            $('html, body').animate({
                scrollTop: titleTop
            }, 1000);

            $(this).parent().find('.navSectionItem').removeClass('active');
            $(this).addClass('active');
        });
    }

    let currentWorkshop = $('body.template-page.page-111443542264');
    if(currentWorkshop.length && $(window).width() < 1025) {
        let currentPageTitle = currentWorkshop.find('section.section-mainpage h1').text();
        $('section.section-mainpage + section.fkk-video .fkk-video__content > div').prepend('<div class="page-title">'+currentPageTitle+'</div>');
    }

    let oneWorkshops = $('body.template-page.page-112511189240');
    if(oneWorkshops.length) {
        // Assuming you have a button with the ID "submit-button"
        const submitButton = document.querySelector('.fkk-contact > .page-width > .contact .contact__button button[type="submit"]');

        // Function to check if all required fields are filled
        function validateForm() {
            const requiredFields = document.querySelectorAll('#ContactForm .form-grid > .field [aria-required="true"]');
            let isValid = true;

            requiredFields.forEach(field => {
                if(field.value === '')
                {
                    isValid = false;
                }
            });

            return isValid;
        }

        // Initial validation on page load
        submitButton.disabled = !validateForm();

        // Add event listeners to required fields
        const requiredFields = document.querySelectorAll('.field [aria-required="true"]');
        requiredFields.forEach(field => {
            field.addEventListener('input', () => {
                submitButton.disabled = !validateForm();
            });
        });

        if(htmlLang === 'es') {
            oneWorkshops.find('section.fkk-contact form .form-grid > .field').eq(0).find('input').attr('placeholder', 'Nombre*');
            oneWorkshops.find('section.fkk-contact form .form-grid > .field').eq(1).find('input').attr('placeholder', 'Número de personas*');
            oneWorkshops.find('section.fkk-contact form .form-grid > .field').eq(2).find('input').attr('placeholder', 'Fecha preferida*');
            oneWorkshops.find('section.fkk-contact form .form-grid > .field').eq(4).find('textarea').attr('placeholder', 'Notas*');
            oneWorkshops.find('section.fkk-contact label[for="ContactForm-newsletter"]').text(' Suscríbete a nuestro boletín');
            oneWorkshops.find('section.fkk-contact label[for="ContactForm-newsletter"] + p').html('Al hacer clic en "Enviar", aceptas nuestra <a href="/policies/privacy-policy" target="_blank">Política de Privacidad</a> + <a href="/policies/terms-of-service" target="_blank">Términos y Condiciones</a>');
            oneWorkshops.find('section.fkk-contact form button[type="submit"]').html('Enviar<svg xmlns="http://www.w3.org/2000/svg" width="18.466" height="12.782" viewBox="0 0 18.466 12.782"><g id="Group_3784" data-name="Group 3784" transform="translate(0 0.354)"><line id="Line_1756" data-name="Line 1756" x2="18.112" transform="translate(0 6.037)" fill="none" stroke="#f4f4f4" stroke-width="1"></line><line id="Line_1757" data-name="Line 1757" y1="6.037" x2="6.037" transform="translate(12.075 6.037)" fill="none" stroke="#f4f4f4" stroke-width="1"></line><line id="Line_1758" data-name="Line 1758" x2="6.037" y2="6.037" transform="translate(12.075)" fill="none" stroke="#f4f4f4" stroke-width="1"></line></g></svg>');
        }
    }

    let manyWorkshops = $('body.template-page.page-112518430968');
    if(manyWorkshops.length) {
        // Assuming you have a button with the ID "submit-button"
        const submitButton = document.querySelector('.fkk-contact > .page-width > .contact .contact__button button[type="submit"]');

        // Function to check if all required fields are filled
        function validateForm() {
            const requiredFields = document.querySelectorAll('#ContactForm .form-grid > .field [aria-required="true"]');
            let isValid = true;

            requiredFields.forEach(field => {
                if(field.value === '')
                {
                    isValid = false;
                }
            });

            return isValid;
        }

        // Initial validation on page load
        submitButton.disabled = !validateForm();

        // Add event listeners to required fields
        const requiredFields = document.querySelectorAll('.field [aria-required="true"]');
        requiredFields.forEach(field => {
            field.addEventListener('input', () => {
                submitButton.disabled = !validateForm();
            });
        });

        if(htmlLang === 'es') {
            manyWorkshops.find('section.fkk-contact form .form-grid > .field').eq(0).find('input').attr('placeholder', 'Nombre de la empresa*');
            manyWorkshops.find('section.fkk-contact form .form-grid > .field').eq(1).find('input').attr('placeholder', 'Persona de contacto*');
            manyWorkshops.find('section.fkk-contact form .form-grid > .field').eq(2).find('input').attr('placeholder', 'Número de personas*');
            manyWorkshops.find('section.fkk-contact form .form-grid > .field').eq(3).find('input').attr('placeholder', 'Fecha preferida*');
            manyWorkshops.find('section.fkk-contact form .form-grid > .field').eq(5).find('textarea').attr('placeholder', 'Notas*');
            manyWorkshops.find('section.fkk-contact label[for="ContactForm-newsletter"]').text(' Suscríbete a nuestro boletín');
            manyWorkshops.find('section.fkk-contact label[for="ContactForm-newsletter"] + p').html('Al hacer clic en "Enviar", aceptas nuestra <a href="/policies/privacy-policy" target="_blank">Política de Privacidad</a> + <a href="/policies/terms-of-service" target="_blank">Términos y Condiciones</a>');
            manyWorkshops.find('section.fkk-contact form button[type="submit"]').html('Enviar<svg xmlns="http://www.w3.org/2000/svg" width="18.466" height="12.782" viewBox="0 0 18.466 12.782"><g id="Group_3784" data-name="Group 3784" transform="translate(0 0.354)"><line id="Line_1756" data-name="Line 1756" x2="18.112" transform="translate(0 6.037)" fill="none" stroke="#f4f4f4" stroke-width="1"></line><line id="Line_1757" data-name="Line 1757" y1="6.037" x2="6.037" transform="translate(12.075 6.037)" fill="none" stroke="#f4f4f4" stroke-width="1"></line><line id="Line_1758" data-name="Line 1758" x2="6.037" y2="6.037" transform="translate(12.075)" fill="none" stroke="#f4f4f4" stroke-width="1"></line></g></svg>');
        }
    }

    let sectionPastEditions = $('.shopify-section.section.collection-product-grid.past-editions');
    if(sectionPastEditions.length) {
        let childCount = sectionPastEditions.find('ul#product-grid').children('li').length;
        if(childCount === 0) {
            sectionPastEditions.prev('.shopify-section').remove();
        }
    }

    const parentElement = document.body; // or any other existing parent element

    parentElement.addEventListener('click', function(event) {
        const instagramCont = event.target.closest('.tb_mc_post_container');
        if (instagramCont) {
            const instagramLink = parentElement.querySelector('.instagram-link a');
            if (instagramLink) {
                instagramLink.click();
            }
        }
    });

    body.on('click', '.product.wishlist-product .product-remove', function (){
        for(let j = 0; j < wishlistItems.length; j++) {
            let currentId = wishlistItems[j].split(' || ')[0];

            if(currentId === $(this).parent().find('.product-add-to-cart').attr('data-id')){
                $(this).parents('div.product').removeClass('in-wishlist');

                wishlistItems.splice(j, 1);
                localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
                buildWishlist();
            }
        }
    })
    body.on('click', '.product.wishlist-product .product-add-to-cart', function(){
        let wishlistItemId = $(this).attr('data-id');
        let wishlistItemQuantity = $(this).parent().find('.product-quantity input').val();

        let wishlistItem;

        if($(this).parents('.wishlist-product').find('.product-properties').length){
            let wishData = {items: []};

            if($(this).parents('.wishlist-product').find('.product-properties .cartItemLaserEtching').attr('data-laser') !== undefined) {
                let laserProduct = {
                    quantity: 1,
                    id: $(this).parents('.wishlist-product').find('.product-properties .cartItemLaserEtching').attr('data-laser')
                }
                wishData.items.push(laserProduct);
            }
            if($(this).parents('.wishlist-product').find('.product-properties .cartItemAddons').length) {
                $(this).parents('.wishlist-product').find('.product-properties .cartItemAddons > span').each(function(){
                    let addonProduct = {
                        quantity: 1,
                        id: $(this).attr('data-addon')
                    }
                    wishData.items.push(addonProduct);
                })
            }

            wishlistItem = {
                quantity: wishlistItemQuantity,
                id: wishlistItemId,
                properties: {
                    'Name': $(this).parents('.wishlist-product').find('.product-title a').text(),
                    'Model': $(this).parents('.wishlist-product').find('.product-properties .cartItemModel span').text(),
                    'Steel': $(this).parents('.wishlist-product').find('.product-properties .cartItemSteel span').text(),
                    'Geometry': $(this).parents('.wishlist-product').find('.product-properties .cartItemGeometry span').text(),
                    'Finish': $(this).parents('.wishlist-product').find('.product-properties .cartItemFinish span').text(),
                    'Leather': $(this).parents('.wishlist-product').find('.product-properties .cartItemLeather span').text(),
                    'Pommel': $(this).parents('.wishlist-product').find('.product-properties .cartItemPommel span').text(),
                    'Bolster': $(this).parents('.wishlist-product').find('.product-properties .cartItemBolster span').text(),
                    'Colours': $(this).parents('.wishlist-product').find('.product-properties .cartItemColours span').text(),
                    'Laser Etching': $(this).parents('.wishlist-product').find('.product-properties .cartItemLaserEtching span').text(),
                    'Notes': '',
                }
            };
            wishData.items.push(wishlistItem);

            jQuery.ajax({
                type: 'POST',
                url: '/cart/add.js',
                data: wishData,
                dataType: 'json',
                success: function() {
                    buildCartWishlist();
                },
                error: function(response) {
                    console.log(response);
                }
            });
        }else{
            wishlistItem = {
                quantity: wishlistItemQuantity,
                id: wishlistItemId
            };


            jQuery.ajax({
                type: 'POST',
                url: '/cart/add.js',
                data: wishlistItem,
                dataType: 'json',
                success: function() {
                    buildCartWishlist();
                },
                error: function(response) {
                    console.log(response);
                }
            });
        }

    })

    relatedProductsBuild();

    if($(window).width() > 1024) {
        const dateInputs = document.querySelectorAll('input#ContactForm-date');
        dateInputs.forEach(input => {
            input.type = 'text';
            input.addEventListener('focus', () => {
                input.type = 'date';
            });

            input.addEventListener('blur', () => {
                input.type = 'text';
            });
        });
    }

    document.addEventListener("addEvent", function(event) {
        relatedShow = true;

        const checkedAddons = [...document.querySelectorAll('.product__addons-list .addon-item input:checked')]
            .map(input => {
                const addonItem = input.closest('.addon-item');
                const addonId = addonItem.querySelector('label')?.dataset.id;
                const addonMain = document.querySelector('div.product .product__info-container .product__title h1').innerText;
                const engravingText = addonItem.classList.contains('product-engraving')
                    ? addonItem.querySelector('input[type="text"]')?.value || ''
                    : null;

                return engravingText !== null ? { id: addonId, engraving: engravingText, main: addonMain } : addonId;
            })
            .filter(Boolean);

        let formData;

        console.log(checkedAddons.length);
        if(checkedAddons.length > 0) {
            document.getElementById('CartDrawer').classList.add('invisible-results');
            if(checkedAddons.length === 1) {
                if(checkedAddons[0].id !== undefined ) {
                    if(checkedAddons[0].engraving.length > 0) {
                        formData = {
                            quantity: 1,
                            id: checkedAddons[0].id,
                            properties: {
                                'Knife': checkedAddons[0].main,
                                'Engraving': checkedAddons[0].engraving,
                            }
                        };
                    }
                }else{
                    formData = {
                        quantity: 1,
                        id: checkedAddons[0]
                    };
                }
            }else{
                formData = {items: []};
                console.log(checkedAddons);
                checkedAddons.forEach(item => {
                    if(item.id !== undefined) {
                        if(item.engraving.length > 0) {
                            formData.items.push({
                                quantity: 1,
                                id: item.id,
                                properties: {
                                    'Knife': item.main,
                                    'Engraving': item.engraving,
                                }
                            });
                        }
                    }else{
                        formData.items.push({
                            quantity: 1,
                            id: item
                        });
                    }

                });
                console.log(formData);
            }

            jQuery.ajax({
                type: 'POST',
                url: '/cart/add.js',
                data: formData,
                dataType: 'json',
                success: function() {
                    buildCartWishlist();
                },
                error: function(response) {
                    console.log(response);
                }
            });

            setTimeout(function (){
                document.getElementById('CartDrawer').classList.remove('invisible-results');
            }, 700)
        }else{
            document.getElementById('CartDrawer').classList.remove('invisible-results');
        }
        relatedProductsBuild();
    });
    document.addEventListener("removeEvent", function(event) {
        relatedShow = false;
        setTimeout(function(){
            relatedProductsBuild();
        }, 500)
    });

    if (document.querySelector('.cart-drawer__empty-content .button')) {

        document.querySelector('.cart-drawer__empty-content .button').addEventListener('click', function(){
            this.closest('cart-drawer').close()
        })
    }

    if(document.querySelector('#view-more p')) {
        document.querySelector('#view-more p').addEventListener('click', function(){
            ScrollExecute();

            setTimeout(function(){
                $('.collection-product-grid:not(.past-editions) #product-grid li.grid__item').each(function(){
                    let colorsQuantity = familyCounts[$(this).find('.card-wrapper').attr('data-family')];

                    if(parseInt(colorsQuantity) > 0) {
                        if (parseInt(colorsQuantity) > 1) {
                            if (htmlLang === 'es') {
                                $(this).find('.product-colors').html(colorsQuantity + ' colores');
                            } else {
                                $(this).find('.product-colors').html(colorsQuantity + ' colors');
                            }
                        } else {
                            $(this).find('.product-colors').text(colorsQuantity + ' color');
                        }
                        $(this).find('.divider:nth-child(4)').show();
                    }
                })
                assignFilterSettings();
                if($('.filter-chosen ul li').length) {
                    fkkFilterNoFade();
                }else{
                    setTimeout(function(){
                        adjustFeaturedWidth();
                        $('.collection-product-grid:not(.past-editions) #product-grid li.grid__item').each(function(){
                            $(this).removeClass('lazy-loaded');
                        })
                    },500)
                }
            },200)
        })
    }
    if(document.querySelector('#view-more-past p')) {
        document.querySelector('#view-more-past p').addEventListener('click', function(){
            ScrollExecutePast();

            setTimeout(function(){
                $('.collection-product-grid.past-editions #product-grid li.grid__item').each(function(){
                    let colorsQuantity = familyCounts[$(this).find('.card-wrapper').attr('data-family')];

                    if(parseInt(colorsQuantity) > 0) {
                        if (parseInt(colorsQuantity) > 1) {
                            if (htmlLang === 'es') {
                                $(this).find('.product-colors').html(colorsQuantity + ' colores');
                            } else {
                                $(this).find('.product-colors').html(colorsQuantity + ' colors');
                            }
                        } else {
                            $(this).find('.product-colors').text(colorsQuantity + ' color');
                        }
                        $(this).find('.divider:nth-child(4)').show();
                    }
                })
            },300)
        })
    }

    function lazyLoadCollection() {
        let element = document.getElementById("view-more");
        if (element) {
            let scrollTop = window.scrollY || document.documentElement.scrollTop;
            let windowHeight = window.innerHeight;
            let mainCollectionHeight = document.querySelector('.collection-product-grid:not(.past-editions)').offsetHeight;

            if(scrollTop > (mainCollectionHeight-windowHeight-(windowHeight/2)) && canLoad) {
                document.querySelector('#view-more p').click();
                canLoad = false;
            }
        }
    }

    window.addEventListener("scroll", lazyLoadCollection);

    function buildCartWishlist() {
        $.ajax({
            type: 'GET',
            url: '/cart.js',
            cache: false,
            dataType: 'json',
            success: function(cart) {
                console.log('cart is building');
                updateCartDrawer(cart);
            }
        });
    }

    function updateCartDrawer(cart) {
        const cartSubtotal = cart.total_price / 100;
        const cartCount = cart.item_count;
        const cartItemsHtml = generateCartItemsHtml(cart.items);

        const cartDrawer = document.querySelector('cart-drawer');
        if (!cartDrawer) return;

        updateCartContents(cartDrawer, cartItemsHtml);
        updateCartHeader(cartDrawer, cartCount);
        updateCartSubtotal(cartDrawer, cartSubtotal);
        enableCheckoutButton(cartDrawer);
        addCartEventListeners(cartDrawer);
    }
    function generateCartItemsHtml(cartItems) {
        return cartItems.map(cartItem => {
            const { id, title, image, final_line_price, properties, quantity } = cartItem;
            const cartItemTitle = properties?.Name || title;
            const cartItemPropertiesHtml = generateCartItemProperties(properties);
            const cartImageHtml = image ? `<div class="cartImage"><img src="${image}" alt="${cartItemTitle}"></div>` : '';

            // console.log(cartItem.properties);

            return `
            <div class="cartItem" data-product-id="${cartItem.product_id}" data-id="${id}">
                <div class="cartInfo">
                    <div class="cartItemTitle">${cartItemTitle}</div>
                    <div class="cartItemPrice">${window.currency_symbol}${final_line_price / 100}</div>
                    ${cartItemPropertiesHtml}
                    <div class="cartItemFooter">
                        <div class="cartItemQuantity">
                            <button name="minus"></button>
                            <input type="number" value="${quantity}">
                            <button name="plus"></button>
                        </div>
                        <div class="cartItemRemove"> / <button class="remove">Remove</button></div>
                    </div>
                </div>
                ${cartImageHtml}
            </div>
        `;
        }).join('');
    }
    function generateCartItemProperties(properties) {
        if (!properties || Object.keys(properties).length <= 1) return '';

        return `
        <div class="cartItemProperties">
            ${Object.entries(properties).map(([key, value]) =>
            `<div class="cartItem${key.replace(/\s+/g, '')}">${key}: ${value}</div>`
        ).join('')}
        </div>
    `;
    }
    function updateCartContents(cartDrawer, cartItemsHtml) {
        const cartItemsContainer = cartDrawer.querySelector('cart-drawer-items #CartDrawer-CartItems');
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = `<div class="cart-items">${cartItemsHtml}</div>`;
        }
        cartDrawer.querySelector('.drawer__inner-empty')?.remove();
        cartDrawer.querySelector('cart-drawer-items')?.classList.remove('is-empty');
        cartDrawer.classList.remove('is-empty');
    }
    function updateCartHeader(cartDrawer, cartCount) {
        document.querySelector('header.header .header__icons a.header__icon.header__icon--cart > .cart-count-bubble span:first-child').textContent = cartCount;
        document.querySelector('div.cart-drawer .drawer__inner .drawer__header h2.drawer__heading').textContent = `Cart (${cartCount})`;
    }
    function updateCartSubtotal(cartDrawer, cartSubtotal) {
        const cartSubtotalElement = cartDrawer.querySelector('div.cart-drawer .drawer__inner .drawer__footer .totals > p');
        if (cartSubtotalElement) {
            cartSubtotalElement.innerHTML = `${window.currency_symbol}${cartSubtotal}`;
        }
    }
    function enableCheckoutButton(cartDrawer) {
        const checkoutButton = cartDrawer.querySelector('#CartDrawer-Checkout');
        if (checkoutButton) {
            checkoutButton.removeAttribute('disabled');
        }
    }
    function addCartEventListeners(cartDrawer) {
        document.querySelector('#CartDrawer .cart-items').addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const target = e.target;
            const cartItemId = target.closest('.cartItem')?.getAttribute('data-id');
            if (!cartItemId) return;

            if (target.classList.contains('remove')) {
                updateCartItemQuantity(cartItemId, 0);
            } else if (target.matches('button[name="minus"]')) {
                adjustCartItemQuantity(target, cartItemId, -1);
            } else if (target.matches('button[name="plus"]')) {
                adjustCartItemQuantity(target, cartItemId, 1);
            }
        });
    }
    function adjustCartItemQuantity(button, cartItemId, change) {
        const inputField = button.parentElement.querySelector('input[type="number"]');
        let currentQuantity = parseInt(inputField.value);
        if (currentQuantity + change > 0) {
            updateCartItemQuantity(cartItemId, currentQuantity + change);
        }
    }
    function updateCartItemQuantity(cartItemId, quantity) {
        $.ajax({
            url: '/cart/change.js',
            method: 'POST',
            data: { quantity, id: cartItemId },
            success: function() {
                buildCartWishlist();
            }
        });
    }

    function adjustFeaturedWidth() {
        let items = document.querySelectorAll(".shopify-section.collection-product-grid:not(.past-editions) #product-grid li");
        let regularCount = 0;

        items.forEach((item) => {
            if (item.classList.contains("featured-true")) {
                if (regularCount % 2 !== 0) {
                    item.classList.add("half-width");
                    regularCount = 0; // Скидаємо лічильник
                }
            } else {
                regularCount++;
            }
        });
    }

    function assignFilterSettings(){
        $('.collection-product-grid:not(.past-editions)').find('li.grid__item .product-card-wrapper').each(function(){
            let $this = $(this);
            let itemMetafields = $(this).find('.metafields');
            if($(this).attr('data-collection') !== 'accessories') {
                let metafieldSize = [];
                if(itemMetafields.find('.metafield-size').html() !== '' && JSON.parse(itemMetafields.find('.metafield-size').html())[0] !== undefined) {
                    metafieldSize = JSON.parse(itemMetafields.find('.metafield-size').html())[0].toLowerCase();
                }

                let metafieldUse = [];
                if(itemMetafields.find('.metafield-use').html() !== '') {
                    metafieldUse = JSON.parse(itemMetafields.find('.metafield-use').html());
                }

                let metafieldFood = [];
                if(itemMetafields.find('.metafield-food').html() !== '') {
                    metafieldFood = JSON.parse(itemMetafields.find('.metafield-food').html());
                }

                let metafieldColour = [];
                if(itemMetafields.find('.metafield-colour').html() !== '') {
                    metafieldColour = JSON.parse(itemMetafields.find('.metafield-colour').html());
                }
                let metafieldColours = [];

                $(this).addClass('size_'+metafieldSize);
                for(let i = 0; i < metafieldUse.length; i++){
                    $this.addClass('use_'+metafieldUse[i].split(' ').join('-').toLowerCase());
                }
                for(let i = 0; i < metafieldFood.length; i++){
                    $this.addClass('food_'+metafieldFood[i].split(' ').join('-').toLowerCase());
                }
                for(let i = 0; i < metafieldColour.length; i++){
                    let colourCode = metafieldColour[i].split(' | ')[1].split('#')[1];
                    metafieldColours.push(colourCode);
                    $this.addClass('colour_'+colourCode.toLowerCase());
                }
            }else{
                if(itemMetafields.find('.metafield-colour').html() !== '') {
                    let metafieldColour = JSON.parse(itemMetafields.find('.metafield-colour').html());
                    let metafieldColours = [];

                    for(let i = 0; i < metafieldColour.length; i++){
                        let colourCode = metafieldColour[i].split(' | ')[1].split('#')[1];
                        metafieldColours.push(colourCode);
                        $this.addClass('colour_'+colourCode.toLowerCase());
                    }
                }
            }
        })
    }

    function relatedProductsBuild(){
        jQuery.ajax({
            type: 'GET',
            url: '/cart.js',
            dataType: 'json',
            success: function(data) {
                let cart_items = data.items;
                let relatedProducts = [];
                let relatedProductsHTML = '';

                let step = 0;
                for(let i = 0; i<cart_items.length; i++){
                    let productQuery = `query ($handle: String!) {
                       productByHandle(handle: $handle) {
                        id
                        title
                        metafields(first: 250) {
                            edges {
                                node {
                                    namespace
                                    key
                                    value
                                }
                            }
                        }
                      }
                    }`;
                    const productGraphql = JSON.stringify({
                        query: productQuery,
                        variables: {
                            "handle": cart_items[i].handle
                        }
                    })
                    const productRequestOptions = {
                        method: "POST",
                        headers: myHeaders,
                        body: productGraphql,
                        redirect: "follow"
                    };

                    fetch(graphqlLink, productRequestOptions)
                        .then((response) => response.text())
                        .then((result) => parseResultSix(result))
                        .catch((error) => console.error(error));

                    function parseResultSix(result){
                        let resultJSON = JSON.parse(result);
                        let resultData = resultJSON.data;
                        let productMetafields = resultData.productByHandle.metafields.edges;

                        let productIds = [];

                        document.querySelectorAll('.cartItem').forEach(item => {
                            let productId = item.getAttribute('data-product-id');
                            if (productId) {
                                productIds.push(productId);
                            }
                        });

                        for(let j = 0; j < productMetafields.length; j++) {
                            if(productMetafields[j].node.key === 'related_products') {
                                let relatedItems = productMetafields[j].node.value.split('["')[1].split('"]')[0].split('","');

                                for( let k = 0; k < relatedItems.length; k++){
                                    if (!productIds.includes(relatedItems[k].split('/')[4])) {
                                        relatedProducts.push(relatedItems[k]);
                                    }
                                }
                            }
                        }


                        if(cart_items.length - 1 === step) {
                            relatedProductsHTML = '';

                            if(relatedProducts.length !== 0) {
                                let stepTwo = 0;

                                for(let j = 0; j < relatedProducts.length; j++) {
                                    let productQuery = `query GetProductsById($id: ID!) {
                                  product(id: $id) {
                                    title
                                    handle
                                    featuredImage {
                                      url
                                    }
                                    priceRange {
                                      maxVariantPrice {
                                        amount
                                      }
                                      minVariantPrice {
                                        amount
                                      }
                                    }
                                    totalInventory
                                    variants(first: 1) {
                                      edges {
                                        node {
                                            id
                                        }
                                      }
                                    }
                                  }
                                }`;
                                    const productGraphql = JSON.stringify({
                                        query: productQuery,
                                        variables: {
                                            "id": relatedProducts[j]
                                        }
                                    })
                                    const productRequestOptions = {
                                        method: "POST",
                                        headers: myHeaders,
                                        body: productGraphql,
                                        redirect: "follow"
                                    };

                                    fetch(graphqlLink, productRequestOptions)
                                        .then((response) => response.text())
                                        .then((result) => parseResultSeven(result))
                                        .catch((error) => console.error(error));

                                    function parseResultSeven(result){
                                        let resultJSON = JSON.parse(result);
                                        let resultProduct = resultJSON.data.product;

                                        let minPrice = parseInt(resultProduct.priceRange.minVariantPrice.amount)/100;
                                        let maxPrice = parseInt(resultProduct.priceRange.maxVariantPrice.amount)/100;
                                        let productPrice;
                                        let productVariant = resultProduct.variants.edges[0].node.id.split('/')[4];

                                        if(minPrice === maxPrice) {
                                            productPrice = minPrice;
                                        }

                                        if(resultProduct.totalInventory > 0){
                                            relatedProductsHTML += '<div class="product related-product">' +
                                                '<div class="product-left">' +
                                                '<div class="product-content">' +
                                                '<div class="product-title"><a href="'+'/products/'+resultProduct.handle+'">'+resultProduct.title+'</a></div>' +
                                                '<div class="product-price">€'+productPrice+'</div>' +
                                                '</div>' +
                                                '<div class="product-footer">' +
                                                '<div class="product-quantity">' +
                                                '<button class="remove disabled">-</button>'+
                                                '<input type="number" max="'+resultProduct.totalInventory+'" value="1">'+
                                                '<button class="add">+</button>'+
                                                '</div>'+
                                                '/'+
                                                '<div class="product-add-to-cart" data-id="'+productVariant+'">'+cartLabels.addToCart+'</div>'+
                                                '</div>' +
                                                '</div>' +
                                                '<div class="product-image"><a href="'+'/products/'+resultProduct.handle+'"><img src="'+resultProduct.featuredImage.url+'" alt="'+resultProduct.title+'"></a></div>' +
                                                '</div>';
                                        }

                                        if(stepTwo === relatedProducts.length-1) {
                                            $('.drawer__related .drawer__related-content').html(relatedProductsHTML);

                                            if($(window).width() > 1024) {
                                                $('div.cart-drawer .drawer__related .drawer__related-content').html(relatedProductsHTML);
                                                if(relatedShow) {
                                                    $('div.cart-drawer .drawer__related').addClass('open');
                                                }
                                            }else{
                                                $('div.cart-drawer .drawer__related-mobile .drawer__related-content').html(relatedProductsHTML);
                                                if(relatedShow) {
                                                    $('div.cart-drawer .drawer__related-mobile').addClass('open');
                                                }
                                            }

                                            $('.product.related-product .product-footer .product-quantity .add:not(.disabled)').on('click', function(){
                                                let currentQnt = parseInt($(this).parent().parent().find('input').val());
                                                let currentMax = parseInt($(this).parent().parent().find('input').attr('max'));

                                                if(currentQnt+1 <= currentMax) {
                                                    $(this).parent().parent().find('input').val(currentQnt+1);
                                                    $(this).parent().parent().find('.remove').removeClass('disabled');

                                                    if(currentQnt+1 === currentMax) {
                                                        $(this).parent().parent().find('.add').addClass('disabled');
                                                    }
                                                }
                                            })
                                            $('.product.related-product .product-footer .product-quantity .remove').on('click', function(){
                                                let currentQnt = parseInt($(this).parent().parent().find('input').val());

                                                if(currentQnt-1 >= 1) {
                                                    $(this).parent().parent().find('input').val(currentQnt-1);
                                                    $(this).parent().parent().find('.add').removeClass('disabled');

                                                    if(currentQnt-1 === 1) {
                                                        $(this).parent().parent().find('.remove').addClass('disabled');
                                                    }
                                                }
                                            })

                                            $('.product.related-product .product-footer .product-add-to-cart').on('click', function(){
                                                let wantedId = $(this).attr('data-id');
                                                let wantedQuantity = $(this).parent().find('.product-quantity input').val();

                                                let wanted = {
                                                    quantity: wantedQuantity,
                                                    id: wantedId
                                                };

                                                jQuery.ajax({
                                                    type: 'POST',
                                                    url: '/cart/add.js',
                                                    data: wanted,
                                                    dataType: 'json',
                                                    success: function() {
                                                        buildCartWishlist();
                                                        relatedProductsBuild();
                                                    },
                                                    error: function(response) {
                                                        console.log(response);
                                                    }
                                                });
                                            })
                                        }
                                        stepTwo++

                                        $('a#cart-icon-bubble').on('click', function(){
                                            setTimeout(function(){
                                                if($(window).width() > 1024) {
                                                    if($('div.cart-drawer .drawer__related').find('.drawer__related-content').html() !== '') {
                                                        $('div.cart-drawer .drawer__related').addClass('open');
                                                    }
                                                }else{
                                                    if($('div.cart-drawer .drawer__related-mobile').find('.drawer__related-content').html() !== '') {
                                                        $('div.cart-drawer .drawer__related-mobile').addClass('open');
                                                    }
                                                }
                                            }, 200)
                                        })
                                        $('#CartDrawer-Overlay, div.cart-drawer .drawer__inner .drawer__header button.drawer__close').on('click', function(){
                                            if($(window).width() > 1024) {
                                                $('div.cart-drawer .drawer__related').removeClass('open');
                                            }else{
                                                $('div.cart-drawer .drawer__related-mobile').removeClass('open');
                                            }
                                        })
                                    }
                                }
                            }else{
                                if($(window).width() > 1024) {
                                    $('div.cart-drawer .drawer__related').find('.drawer__related-content').html('');
                                    $('div.cart-drawer .drawer__related').addClass('hiding');
                                }else{
                                    $('div.cart-drawer .drawer__related-mobile').find('.drawer__related-content').html('');
                                    $('div.cart-drawer .drawer__related-mobile').addClass('hiding');
                                }

                                setTimeout(function(){
                                    if($(window).width() > 1024) {
                                        $('div.cart-drawer .drawer__related').removeClass('open');
                                        $('div.cart-drawer .drawer__related').removeClass('hiding');
                                    }else{
                                        $('div.cart-drawer .drawer__related-mobile').removeClass('open');
                                        $('div.cart-drawer .drawer__related-mobile').removeClass('hiding');
                                    }
                                }, 300)
                            }
                        }

                        step++
                    }
                }

                if(cart_items.length === 0) {
                    if($(window).width() > 1024) {
                        $('div.cart-drawer .drawer__related').find('.drawer__related-content').html('');
                        $('div.cart-drawer .drawer__related').addClass('hiding');
                    }else{
                        $('div.cart-drawer .drawer__related-mobile').find('.drawer__related-content').html('');
                        $('div.cart-drawer .drawer__related-mobile').addClass('hiding');
                    }

                    setTimeout(function(){
                        if($(window).width() > 1024) {
                            $('div.cart-drawer .drawer__related').removeClass('open');
                            $('div.cart-drawer .drawer__related').removeClass('hiding');
                        }else{
                            $('div.cart-drawer .drawer__related-mobile').removeClass('open');
                            $('div.cart-drawer .drawer__related-mobile').removeClass('hiding');
                        }
                    }, 300)
                }
            },
            error: function(response) {
                console.log(response);
            }
        });
    }
    function buildWishlist(){
        let wishlistHTML = '';
        if(wishlistItems.length) {
            $('.fkk-wishlist').addClass('has-items');
            $('#fkkWishlist').find(' .wishlistHeader .wishlistTitle .wishlistQuantity').text('('+wishlistItems.length+')');
        }else {
            $('.fkk-wishlist').removeClass('has-items');
            $('#fkkWishlist').find(' .wishlistHeader .wishlistTitle .wishlistQuantity').text('(0)');
        }

        $('.wishlist-bubble').text(wishlistItems.length);
        wishlistItems.length > 0 ? $('.wishlist-bubble').addClass('not-empty') : $('.wishlist-bubble').removeClass('not-empty')

        for (let i = 0; i < wishlistItems.length; i++) {
            let wishlistItemId = wishlistItems[i].split(' || ')[0];
            let wishlistItemTitle = wishlistItems[i].split(' || ')[1];
            let wishlistItemPrice = wishlistItems[i].split(' || ')[2].replace(/\s/g,'');
            let wishlistItemImage = wishlistItems[i].split(' || ')[3];
            let wishlistItemHandle = '/products/'+wishlistItems[i].split(' || ')[4];
            let wishlistProperties = '';
            if(wishlistItems[i].split(' || ').length > 5) {
                let properties = wishlistItems[i].split(' || ')[5].split('&');
                let laser = wishlistItems[i].split(' || ')[6];
                wishlistItemHandle = window.location.href.split('?')[0]+'?'+wishlistItems[i].split(' || ')[5];

                let engrHtml;
                let addonsNames = [];
                let addons = [];
                let addonsHTML = '';

                if(properties[9].split('=')[1] === 'no-engraving') {
                    engrHtml = '<div class="cartItemLaserEtching">'+wishProperties[8]+': <span>No Engraving</span></div>';
                }else{
                    engrHtml = '<div class="cartItemLaserEtching" data-laser="'+laser+'">'+wishProperties[8]+': <span>'+properties[9].split('=')[1].split('-').join(' ')+'</span></div>';
                }
                if(properties.length > 10) {
                    addons = properties[10].split('=')[1].split('_');
                    addonsNames = wishlistItems[i].split(' || ')[7].split(' -- ');

                    for( let j = 0; j < addons.length; j++) {
                        addonsHTML += '<span data-addon="'+addons[j]+'">'+addonsNames[j]+'</span>';
                    }
                    addonsHTML = '<div class="cartItemAddons">Addons: '+addonsHTML+'</div>';
                }



                wishlistProperties = '<div class="product-properties">' +
                    '<div class="cartItemModel">'+wishProperties[0]+': <span>'+properties[0].split('=')[1]+'</span></div>' +
                    '<div class="cartItemSteel">'+wishProperties[1]+': <span>'+properties[1].split('=')[1].split('-').join(' ')+'</span></div>' +
                    '<div class="cartItemGeometry">'+wishProperties[2]+': <span>'+properties[2].split('=')[1].split('-').join(' ')+'</span></div>' +
                    '<div class="cartItemFinish">'+wishProperties[3]+': <span>'+properties[3].split('=')[1].split('-').join(' ')+'</span></div>' +
                    '<div class="cartItemLeather">'+wishProperties[4]+': <span>'+properties[5].split('=')[1].split('_').join(', ')+'</span></div>' +
                    '<div class="cartItemBolster">'+wishProperties[5]+': <span>'+properties[7].split('=')[1]+'</span></div>' +
                    '<div class="cartItemPommel">'+wishProperties[6]+': <span>'+properties[8].split('=')[1]+'</span></div>' +
                    '<div class="cartItemColours">'+wishProperties[7]+' Colours: <span>'+properties[6].split('=')[1].split('_').join(', ')+'</span></div>' +
                    engrHtml + addonsHTML +
                    '</div>';
            }
            wishlistHTML += '<div class="product wishlist-product">' +
                '<div class="product-left">' +
                '<div class="product-content">' +
                '<div class="product-title"><a href="'+wishlistItemHandle+'">'+wishlistItemTitle+'</a></div>' +
                '<div class="product-price">'+wishlistItemPrice+'</div>' +
                wishlistProperties+
                '</div>' +
                '<div class="product-footer">' +
                '<div class="product-add-to-cart" data-id="'+wishlistItemId+'">'+cartLabels.addToCart+'</div>'+
                '/'+
                '<div class="product-remove">'+cartLabels.remove+'</div>'+
                '</div>' +
                '</div>' +
                '<div class="product-image"><a href="'+wishlistItemHandle+'"><img src="'+wishlistItemImage+'" alt="'+wishlistItemTitle+'"></a></div>' +
                '</div>';
        }
        $('#fkkWishlist').find('.wishlistItems').html(wishlistHTML);
    }
    function cropString(str, maxLength) {
        if (str.length > maxLength) {
            return str.slice(0, maxLength) + '...';
        } else {
            return str;
        }
    }
})




// function extractProductData(products) {
//     return products.map(product => {
//         return {
//             id: product.id,
//             title: product.title,
//             handle: product.handle,
//             bodyHtml: product.bodyHtml,
//             price: product.variants.edges[0].node.price,
//             colors: product.metafields.edges
//                 .find(edge => edge.node.key === 'colour')
//                 ?.node.value
//                 .replace(/[\[\]"]/g, '') // remove brackets and quotes
//                 .split(',') //split on comma
//                 .map(color => color.trim()) || [],
//         };
//     });
// }
// fetchAllProducts().then(allProductsInfo => {
//     document.querySelectorAll('.product__addons-list .addon-item').forEach(function(item) {
//         let itemName = item.querySelector('label .addon-title').innerText;
//         let addonItemFamily = item.getAttribute('data-family');
//         if(addonItemFamily) {
//             let filteredAddons = allProductsInfo.filter(product => {
//                 let familyMetafield = product.metafields.edges.find(edge => edge.node.key === 'family');
//                 return familyMetafield && familyMetafield.node.value === addonItemFamily;
//             });
//             let newAddonsData = extractProductData(filteredAddons);
//             let newAddonsHTML = '';
//
//             newAddonsData.forEach(function(addon){
//                 let colourName = '';
//                 let colourBox = '';
//                 let addonActive = '';
//
//                 for(let k = 0; k < addon.colors.length; k++){
//                     colourBox += '<span data-colour="'+addon.colors[k].split(' | ')[0]+'" style="background:'+addon.colors[k].split(' | ')[1]+'"></span>';
//
//                     if(k !== 0){
//                         colourName += '/'+addon.colors[k].split(' | ')[0];
//                     }else{
//                         colourName += addon.colors[k].split(' | ')[0];
//                     }
//                 }
//                 if(itemName === addon.title) {
//                     addonActive = 'active';
//                 }
//
//                 let addonColours = '<div class="colourBox">' + colourBox + '</div>';
//
//                 newAddonsHTML += '<div class="addon-color '+addonActive+'">' +
//                         addonColours +
//                         '<div class="addon-title" style="display:none;">'+addon.title+'</div>' +
//                         '<div class="addon-description" style="display:none;">'+addon.bodyHtml+'</div>' +
//                         '<div class="addon-handle" style="display:none;">'+addon.handle+'</div>' +
//                         '<div class="addon-price" style="display:none;">'+window.currency_symbol+addon.price.split('.')[0]+'</div>' +
//                     '</div>';
//
//             })
//             newAddonsHTML = '<div class="additional-colors">' + newAddonsHTML + '</div>';
//             // item.insertAdjacentHTML('beforeend', newAddonsHTML);
//         }
//     });
// });