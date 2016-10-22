/**
 * Created by ck on 2016/6/15.
 */

"use strict";
var sceneId = getParam('scene_id');
$.get('init_scene', {space_id: getParam('space_id'), scene_id: sceneId}, function (ret) {
    if (!ret.success) {
        alert(ret.err_msg);
        return false;
    }
    var sceneInfo = ret.scene;
    var seller = ret.seller;
    var spaceList = ret.spaceList;

    var fromMobile = !fromPC();

    var $loading = $('#loading');
    var $mask = $('#mask');
    var $body = $(document.body);
    var $playBtn = $('#play-btn');
    var $nav = $('#nav');
    var $gallery = $('#gallery');
    var $fullBtn = $('#fullBtn');
    var $infoBtn = $('.infoBtn');
    var $closeBtn = $('.close-btn');
    var $hideBtn = $('.hideBtn');
    var $leftBtn = $('#left-btn');
    var $rightBtn = $('#right-btn');
    var $miniNav = $('#miniNav');
    var $showNav = $('#showNav');
    var $sellerDialog = $('.dialog.seller-info');
    var $cross = $('#cross');
    var $doubleCross = $('#double-cross');
    var $walkMode = $('#walk-mode');
    var $vrOpen = $('#vr-open');
    var $vrClose = $('#vr-close');
    var $hotTitle = $('#hot-title');
    var $display = $('#display'); // TODO 临时
    // var $scenePanel = $('#scene-panel');

    var i, j, k;  // 计数器
    var fullScreen = false;
    var clickFullBtn = false;
    var hasOSensor = false;  // 是否有方向传感器

    var galleryScrollLeft = 0;

    var galleryScrollWidth = 0;
    var maxScrollLeft = 0;
    var spaceCount = 0;
    var liWidth = 164;

    if (sceneInfo && sceneInfo.title) {
        document.title = sceneInfo.title;
    }
    // 商户信息
    var logoUrl = seller.logo || '/panorama/img/logo/logo.png';
    document.getElementById('seller-logo').src = logoUrl;
    document.getElementById('seller-name').innerHTML = seller.name || '';
    document.getElementById('seller-phone').innerHTML = seller.phone || '';
    document.getElementById('seller-address').innerHTML = '杭州市萧山区杭州市萧山区杭州市萧山区杭州市萧山区杭州市萧山区杭州市萧山区杭州市萧山区';
    var hotImg = '/static/panorama/img/foot_step.png';
    var entry = sceneInfo.entry;

    var container = document.getElementById('main');
    var $container = $(container);
    var options = {
        container: container,
        logoUrl: logoUrl,
        hotImg: hotImg,
        spaceList: spaceList,
        entry: entry,
        smoothStart: false,
        autoPlay: true,
        autoRotate: false,
        fps: false,
        callbacks: {
            onLoad: onLoad,
            onShowing: onShowing,
            onShown: onShown,
            onOverHot: onOverHot,
            onLeaveHot: onLeaveHot
        }
    };

    var vrayScene = new VRAY.Scene(options);

    // 首屏载入成功
    function onLoad() {
        var galleryHtml = '';
        spaceCount = vrayScene.spaceCount;

        if (spaceCount == 1) {
            $gallery.hide();
            $leftBtn.hide();
            $rightBtn.hide();
        } else {
            // 初始化导航栏
            for (i = 0; i < spaceCount; i++) {
                var space = spaceList[i];
                galleryHtml += (
                    '<li id="space_id_' + space.id + '" data-index="' + space.id + '">' +
                    '<img src="' + space['thumb_url'] + '"/>' + '<span>' + space.name + '</span>' +
                    '</li>'
                );
            }
            $gallery.find('ul').html(galleryHtml);
            // 激活入口
            $('#space_id_' + entry).addClass('active');

            if (spaceCount <= 5) {
                $leftBtn.hide();
                $rightBtn.hide();
            } else {
                galleryScrollWidth = spaceCount * (liWidth + 5) - 5; // li有margin-right=5
                maxScrollLeft = galleryScrollWidth - $gallery.width();
                (maxScrollLeft < 0) && (maxScrollLeft = 0);
            }

            if (fromMobile) {
                $('#opera-panel-mobile').show();
                $('#opera-panel-PC').hide();
            }
            $nav.addClass('show');
        }

        // 隐藏loading动画
        $loading.fadeOut(1000);
        if (options.autoPlay) {
            $mask.fadeOut(1000);
        } else {
            $playBtn.fadeIn(1000);
        }
        bindUIListener();
        animate();
    }

    // 下一个场景加载中
    function onShowing() {
        $mask.show();
        $loading.stop().fadeIn(1000);
    }

    // 场景切换完毕
    function onShown(spaceId) {
        $mask.hide();
        $loading.stop().fadeOut(700);
        $gallery.find('.active').removeClass('active');
        $('#space_id_' + spaceId).addClass('active');
    }

    var switchSpaceDelayer = null;
    // 鼠标在热点上时
    function onOverHot(selectedHot, mousePos) {
        if (selectedHot.title && mousePos) {
            $hotTitle.html(selectedHot.title).css({
                left: mousePos.x - $hotTitle.width() - 20,
                top: mousePos.y - 25 / 2
            }).show();
        } else {
            $hotTitle.hide();
        }
        if (vrayScene.walkMode && !switchSpaceDelayer) {
            switchSpaceDelayer = window.setTimeout(function () {
                window.clearTimeout(switchSpaceDelayer);
                switchSpaceDelayer = null;
                vrayScene.showSpace(selectedHot);
            }, 2000)
        }
    }

    // 鼠标离开热点时
    function onLeaveHot() {
        $hotTitle.hide();
        if (switchSpaceDelayer) {
            window.clearTimeout(switchSpaceDelayer);
            switchSpaceDelayer = null;
        }
    }


    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    function animate() {
        vrayScene.update();  // 更新场景数据
        requestAnimationFrame(animate);
    }

    function bindUIListener() {
        // 导航栏滚动操作
        var scrollObj = $gallery.children('div');
        $leftBtn.click(function (e) {
            e.preventDefault();
            galleryScrollLeft = scrollObj[0].scrollLeft;
            galleryScrollLeft -= (liWidth + 5);
            (galleryScrollLeft - liWidth < 0) && (galleryScrollLeft = 0);
            scrollObj.stop().animate({scrollLeft: galleryScrollLeft + 'px'}, 500);
        });
        $rightBtn.click(function (e) {
            e.preventDefault();
            galleryScrollLeft = scrollObj[0].scrollLeft;
            galleryScrollLeft += (liWidth + 5);
            (galleryScrollLeft + liWidth > maxScrollLeft) && (galleryScrollLeft = maxScrollLeft);
            scrollObj.stop().animate({scrollLeft: galleryScrollLeft + 'px'}, 500);
        });
        $gallery.find('ul').mousewheel(function (event, delta) {
            event.preventDefault();
            if (delta != 0) {
                galleryScrollLeft = galleryScrollLeft - delta * (liWidth + 5);
                (galleryScrollLeft - liWidth < 0) && (galleryScrollLeft = 0);
                (galleryScrollLeft + liWidth > maxScrollLeft) && (galleryScrollLeft = maxScrollLeft);
                scrollObj.stop().animate({scrollLeft: galleryScrollLeft + 'px'}, 500);
            }
        });

        // 播放操作
        $playBtn.click(function () {
            $mask.fadeOut(500);
            $playBtn.stop().fadeOut(500);
            vrayScene.play();
            $nav.addClass(fromMobile ? 'mobile-show' : 'show');
            return false;
        });

        // 切换场景
        $gallery.on('click', 'li', function () {
            vrayScene.showSpace({to: $(this).data('index')});
            return false;
        });

        $hideBtn.click(function () {
            $nav.removeClass('mobile-show show');
            setTimeout(function () {
                $miniNav.addClass('show');
            }, 500);
            return false;
        });
        $showNav.click(function () {
            $miniNav.removeClass('mobile-show show');
            (function ($nav) {
                setTimeout(function () {
                    $nav.addClass(fromMobile ? 'mobile-show' : 'show');
                }, 300);
            })($nav);
            return false;
        });
        // 漫步模式
        $walkMode.click(function () {
            if (!hasOSensor) {
                $.alert({message: '您的设备不支持该模式'});
                return false;
            }
            vrayScene.walkMode = !vrayScene.walkMode;
            switchCrossMode();
            return false;
        });
        // VR模式
        $vrOpen.click(function () {
            if (!hasOSensor) {
                $.alert({message: '您的设备不支持该模式'});
                return false;
            }
            if (window.orientation != 90 && window.orientation != -90) {
                $.alert({message: '请使用横屏进入VR模式'});
                return false;
            }
            if (vrayScene.stereoMode) {
                vrayScene.walkMode = vrayScene.stereoMode = false;
                $nav.addClass(fromMobile ? 'mobile-show' : 'show');
            } else {
                vrayScene.walkMode = vrayScene.stereoMode = true;
                $vrClose.fadeIn();
                $vrOpen.addClass('active');
                $nav.removeClass('mobile-show show');
            }
            switchCrossMode();
            return false;
        });
        // 退出VR模式
        $vrClose.click(function () {
            vrayScene.walkMode = vrayScene.stereoMode = false;
            $nav.addClass(fromMobile ? 'mobile-show' : 'show');
            $vrClose.fadeOut();
            switchCrossMode();
            return false;
        });
        // 切换十字准星
        function switchCrossMode() {
            $doubleCross.hide();
            $cross.hide();
            if (vrayScene.stereoMode) {
                $doubleCross.show();
            } else if (vrayScene.walkMode) {
                $cross.show();
                console.log($cross);
            }
        }

        $fullBtn.click(function (e) {
            e.preventDefault();
            if (fullScreen) {
                exitFullScreen();
                $fullBtn.removeClass('unfullBtn');
                $fullBtn.addClass('fullBtn');
                clickFullBtn = true;
            } else {
                launchFullScreen($body[0]);
                $fullBtn.removeClass('fullBtn');
                $fullBtn.addClass('unfullBtn');
                clickFullBtn = true;
            }
        });
        $infoBtn.click(function () {
            $mask.fadeIn();
            $sellerDialog.fadeIn();
            return false;
        });
        $closeBtn.click(function () {
            $mask.fadeOut();
            $('.dialog').fadeOut();
            return false;
        });
        $mask.click(function () {
            $('.dialog').fadeOut();
            $mask.fadeOut();
        });
    }

    // 监听设备方向变化（用于判断是否有方向传感器）
    window.addEventListener('deviceorientation', setOrientationControls);
    function setOrientationControls(e) {
        (e.alpha || e.beta || e.gamma) && (hasOSensor = true);
        window.removeEventListener('deviceorientation', setOrientationControls);  // 移除监听器
    }

    // 监听横竖屏变化
    window.addEventListener('orientationchange', function () {
        if (window.orientation == 90 || window.orientation == -90) {
            // alert('现在是横屏！');
            if (vrayScene.stereoMode) {
                $.alert.close();
            }
        } else {
            // alert('现在是竖屏！');
            if (vrayScene.stereoMode) {
                $.alert({message: '请使用横屏进入VR模式'});
            }
        }
    });

    // 监听窗口大小改变事件
    window.addEventListener('resize', function () {
        if (!fullScreen && clickFullBtn) {
            fullScreen = true;
        } else {
            $fullBtn.removeClass('unfullBtn');
            $fullBtn.addClass('fullBtn');
            fullScreen = false;
        }
        galleryScrollWidth = spaceCount * (liWidth + 5) - 5; // li有margin-right=5
        maxScrollLeft = galleryScrollWidth - $gallery.width();
        (maxScrollLeft < 0) && (maxScrollLeft = 0);
        vrayScene.resize($container.width(), $container.height());
    }, false);

    function launchFullScreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    function exitFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
});