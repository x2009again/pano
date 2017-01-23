/**
 * Created by ck on 2016/6/15.
 */

"use strict";
var sceneId = getParam('scene_id');
$.get('init_scene', {space_id: getParam('space_id'), scene_id: sceneId}, function (ret) {
    if (!ret.success) {
        alert(ret['err_msg']);
        return false;
    }
    var sceneInfo = ret['scene'];
    var seller = ret['seller'];
    var spaceList = ret.spaceList;
    var spacesDict = {};

    var fromMobile = !fromPC();

    var $loading = $('#loading');
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
    document.getElementById('seller-name').innerHTML = seller['name'] || '';
    document.getElementById('seller-phone').innerHTML = seller['phone'] || '';
    document.getElementById('seller-address').innerHTML = seller['address'] || '';
    var hotImg = '/static/panorama/img/foot_step.png';
    var entryId = sceneInfo.entry;

    for (i = 0; i < spaceList.length; i++) {
        spacesDict[spaceList[i].id] = spaceList[i];  // 空间集合
    }

    var container = document.getElementById('main');
    var maskLayer = new MaskLayer(container).show();
    var $container = $(container);
    var options = {
        container: container,
        logoUrl: logoUrl,
        hotImg: hotImg,
        spacesDict: spacesDict,
        entryId: entryId,
        smoothStart: true,
        autoPlay: false,
        autoRotate: true,
        fps: false,
        callbacks: {
            onLoad: onLoad,
            onCameraChanged: onCameraChanged,
            onShowSpaceFail: onShowSpaceFail,
            onShown: onShown,
            onOverHot: onOverHot,
            onLeaveHot: onLeaveHot
        }
    };

    var panorama = new Panorama(options);

    // 首屏载入成功
    function onLoad() {
        var galleryHtml = '';
        spaceCount = spaceList.length;

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
            $('#space_id_' + entryId).addClass('active');

            if (spaceCount <= 5) {
                $leftBtn.hide();
                $rightBtn.hide();
            } else {
                galleryScrollWidth = spaceCount * (liWidth + 5) - 5; // li有margin-right=5
                maxScrollLeft = galleryScrollWidth - $gallery.width();
                (maxScrollLeft < 0) && (maxScrollLeft = 0);
            }
        }

        if (fromMobile) {
            $('#opera-panel-mobile').show();
            $('#opera-panel-PC').hide();
        }
        $nav.addClass('show');

        // 隐藏loading动画
        $loading.removeClass('show');
        if (options.autoPlay) {
            maskLayer.hide();
        } else {
            $playBtn.show();
        }
        animate();
        bindUIListener();
    }

    var $torch = $('#mini-map').find('i');

    function onCameraChanged(cameraDirection) {
        // 弧度单位rad
        var cssText = 'translateY(-50%) rotate(' + Math.atan2(cameraDirection.x, -cameraDirection.z) + 'rad)';
        $torch.css({'transform': cssText});
    }

    // 场景跳转失败
    var loading = false;
    function onShowSpaceFail(code, data) {
        if (code == 1) {
            if (!loading) {
                loading = true;
                maskLayer.show();
                ui.$loading.stop().fadeIn(1000);
            }
            window.setTimeout(function () {
                panorama.showSpace(data.spaceId, data.hotId);
            }, 500);
        } else if (code == 2) {
            var hotId = data.hotId;
            if (confirm('目标空间不存在，删除该无效热点？')) {
                $.get('delete_hot', {
                    id: hotId
                }, function (data) {
                    if (data.success) {
                        panorama.deleteHot(hotId);
                        ui.$hotTitle.hide();
                    }
                });
            }
        }
    }

    // 场景切换完毕
    function onShown(spaceId) {
        maskLayer.hide();
        $loading.removeClass('show');
        // $loading.stop().fadeOut(700);
        $gallery.find('.active').removeClass('active');
        $('#space_id_' + spaceId).addClass('active');
    }

    var switchSpaceDelayer = null;
    // 鼠标在热点上时
    function onOverHot(hotInfo, mousePos) {
        if (hotInfo.title && mousePos) {
            $hotTitle.html(hotInfo.title).css({
                left: mousePos.x - $hotTitle.width() - 20,
                top: mousePos.y - 25 / 2
            }).show();
        } else {
            $hotTitle.hide();
        }
        if (panorama.walkMode && !switchSpaceDelayer) {
            switchSpaceDelayer = window.setTimeout(function () {
                window.clearTimeout(switchSpaceDelayer);
                switchSpaceDelayer = null;
                panorama.showSpace(hotInfo.to, hotInfo.id);
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
        panorama.update();  // 更新场景数据
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
            maskLayer.hide(500);
            $playBtn.stop().fadeOut(500);
            panorama.play();
            $nav.addClass(fromMobile ? 'mobile-show' : 'show');
            return false;
        });

        // 切换场景
        $gallery.on('click', 'li', function () {
            panorama.showSpace($(this).data('index'));
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
            panorama.walkMode = !panorama.walkMode;
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
            if (panorama.stereoMode) {
                panorama.walkMode = panorama.stereoMode = false;
                $nav.addClass(fromMobile ? 'mobile-show' : 'show');
            } else {
                panorama.walkMode = panorama.stereoMode = true;
                $vrClose.fadeIn();
                $vrOpen.addClass('active');
                $nav.removeClass('mobile-show show');
            }
            switchCrossMode();
            return false;
        });
        // 退出VR模式
        $vrClose.click(function () {
            panorama.walkMode = panorama.stereoMode = false;
            $nav.addClass(fromMobile ? 'mobile-show' : 'show');
            $vrClose.fadeOut();
            switchCrossMode();
            return false;
        });
        // 切换十字准星
        function switchCrossMode() {
            $doubleCross.hide();
            $cross.hide();
            if (panorama.stereoMode) {
                $doubleCross.show();
            } else if (panorama.walkMode) {
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
            maskLayer.show();
            $sellerDialog.fadeIn();
            return false;
        });
        $closeBtn.click(function () {
            maskLayer.hide();
            $('.dialog').fadeOut();
            return false;
        });
    }

    // 监听设备方向变化（用于判断是否有方向传感器）
    window.addEventListener('deviceorientation', setOrientationControls);
    function setOrientationControls(e) {
        e.alpha !== null && e.beta !== null && e.gamma !== null && (hasOSensor = true);
        window.removeEventListener('deviceorientation', setOrientationControls);  // 移除监听器
    }

    // 监听横竖屏变化
    window.addEventListener('orientationchange', function () {
        if (window.orientation == 90 || window.orientation == -90) {
            // alert('现在是横屏！');
            if (panorama.stereoMode) {
                $.alert.close();
            }
        } else {
            // alert('现在是竖屏！');
            if (panorama.stereoMode) {
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
        panorama.resize($container.width(), $container.height());
    }, false);

    function launchFullScreen(ele) {
        if (ele.requestFullscreen) {
            ele.requestFullscreen();
        } else if (ele.mozRequestFullScreen) {
            ele.mozRequestFullScreen();
        } else if (ele.webkitRequestFullscreen) {
            ele.webkitRequestFullscreen();
        } else if (ele.msRequestFullscreen) {
            ele.msRequestFullscreen();
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