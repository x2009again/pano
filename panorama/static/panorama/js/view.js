/**
 * Created by ck on 2016/6/15.
 */

(function (window, document, $, VRAY, undefined) {
    "use strict";

    window.fromMobile = !fromPC();

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
    var $upBtn = $('#up-btn');
    var $downBtn = $('#down-btn');
    var $miniNav = $('#miniNav');
    var $showNav = $('#showNav');
    var $sellerDialog = $('.dialog.seller-info');
    var $cross = $('#cross');
    var $doubleCross = $('#double-cross');
    var $walkMode = $('#walk-mode');
    var $vrOpen = $('#vr-open');
    var $vrClose = $('#vr-close');
    var $addHotBtn = $('#add-hot');
    var $addHotDialog = $('#add-hot-dialog');
    var $editHotDialog = $('#edit-hot-dialog');
    var $scenePanel = $('#scene-panel');

    $editHotDialog.on("contextmenu", function () {
        return false;
    });


    var i, j, k;  // 计数器
    var fullScreen = false;
    var clickFullBtn = false;
    window.hasOSensor = false;  // 是否有方向传感器

    var galleryScrollLeft = 0;

    var galleryScrollWidth = 0;
    var maxScrollLeft = 0;

    var liWidth = 170;

    var sceneInfo = window.sceneInfo;
    var seller = window.seller;
    var spaceList = window.spaceList;

    if (sceneInfo && sceneInfo.title) {
        document.title = sceneInfo.title;
    }
    // 商户信息
    window.logoUrl = seller.logo || '/panorama/img/logo/logo.png';
    document.getElementById('seller-logo').src = window.logoUrl;
    document.getElementById('seller-name').innerHTML = seller.name || '';
    document.getElementById('seller-phone').innerHTML = seller.phone || '';
    document.getElementById('seller-address').innerHTML ='杭州市萧山区杭州市萧山区杭州市萧山区杭州市萧山区杭州市萧山区杭州市萧山区杭州市萧山区';

    var entry = sceneInfo.entry;
    var options = {
        logoUrl: window.logoUrl,
        spaceList: spaceList,
        entry: entry,
        smoothStart: true,
        autoPlay: false,
        autoRotate: false,
        onLoad: onLoad,
        beforeShow: beforeShow,
        onShowing: onShowing,
        onShown: onShown
    };

    window.vrayScene = new VRAY.Scene(options);

    // 首屏载入成功
    function onLoad() {
        var galleryHtml = '';
        var selectorHtml = '';
        var spaceCount = spaceList.length;
        if (spaceCount == 1) {
            $scenePanel.hide();
        }
        if (spaceCount <= 5) {
            var wid = spaceCount * 170 + 55;
            $nav.css({'width': wid + 'px', 'margin-left': -wid / 2 + 'px'});
            $upBtn.hide();
            $downBtn.hide();
        }
        if (fromMobile) {
            $nav.css({'width': '100%', 'left': '0', 'margin-left': '0', 'padding': '0 5px', 'border-radius': '0'});
            $showNav.css({'height': '45px'});
            $scenePanel.css({'margin-top': '10px'});
            $upBtn.hide();
            $downBtn.hide();
            var descLen = $('#seller-address').html().length;
            if(descLen<=20){
                $sellerDialog.css({'width': '400px', 'height': '300px', 'margin-top': '2%'});
            } else if(descLen<=40){
                $sellerDialog.css({'width': '500px', 'height': '300px', 'margin-top': '2%'});
            } else{
                $sellerDialog.css({'width': '600px', 'height': '300px', 'margin-top': '2%'});
            }

            $('.dialog.seller-info table').css({'margin-top': '20px'});
            $('.dialog.seller-info .footer').css({'bottom': '0'});
            $('.con-info').css({'width': '175px'});
            if (spaceCount * 170 < $nav.width()) {
                $scenePanel.css('width', (spaceCount * 170 - 5) + 'px');
            }
        }

        for (i = 0; i < spaceCount; i++) {
            var space = spaceList[i];
            selectorHtml += ('<option value="' + space.id + '">' + space.name + '</option>');
            galleryHtml += (
                '<li id="space_id_' + space.id + '" data-index="' + space.id + '">' +
                '<img src="' + space['thumb_url'] + '"/>' + '<span>' + space.name + '</span>' +
                '</li>'
            );
        }
        if (spaceCount > 0) {
            galleryScrollWidth = spaceCount * liWidth;
            maxScrollLeft = galleryScrollWidth - $gallery.width();
            (maxScrollLeft < 0) && (maxScrollLeft = 0);
            $gallery.children('ul').html(galleryHtml);
            $('#space_id_' + entry).addClass('active');
            $addHotDialog.find('select').html(selectorHtml);
            $editHotDialog.find('select').html(selectorHtml);
            $gallery.children('ul').width(spaceCount * liWidth);
            if (fromMobile) {
                $('#opera-panel-mobile').show();
                $('#opera-panel-PC').hide();
            }
            $nav.show();
        }
        $loading.fadeOut(1000);
        if (options.autoPlay) {
            $mask.fadeOut(1000);
        } else {
            $playBtn.fadeIn(1000);
        }
        bindUIListener();
        animate();
    }

    // 场景切换前
    function beforeShow(spaceId) {
        $gallery.find('.active').removeClass('active');
        $('#space_id_' + spaceId).addClass('active');
    }

    // 下一个场景加载中
    function onShowing() {
        $mask.show();
        $loading.stop().fadeIn(1000);
    }

    // 场景切换完毕
    function onShown() {
        $mask.hide();
        $loading.stop().fadeOut(700);
    }

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    function animate() {
        vrayScene.update();  // 更新场景数据
        requestAnimationFrame(animate);
    }

    function bindUIListener() {

        // 播放操作
        $playBtn.click(function () {
            $mask.fadeOut(500);
            $playBtn.stop().fadeOut(500);
            window.vrayScene.play();
            $nav.addClass(window.fromMobile ? 'mobile-show' : 'show');
            return false;
        });

        // 切换场景
        $gallery.on('click', 'li', function () {
            window.vrayScene.showSpace({to: $(this).data('index')});
            return false;
        });

        $hideBtn.click(function () {
            $nav.removeClass('mobile-show show');
            (function ($miniNav) {
                setTimeout(function () {
                    $miniNav.addClass('show');
                }, 300);
            })($miniNav);
            return false;
        });
        $showNav.click(function () {
            $miniNav.removeClass('mobile-show show');
            (function ($nav) {
                setTimeout(function () {
                    $nav.addClass(window.fromMobile ? 'mobile-show' : 'show');
                }, 300);
            })($nav);
            return false;
        });
        // 漫步模式
        $walkMode.click(function () {
            if (!window.hasOSensor) {
                $.alert({message: '您的设备不支持该模式'});
                return false;
            }
            vrayScene.walkMode = !vrayScene.walkMode;
            switchCrossMode();
            return false;
        });
        // VR模式
        $vrOpen.click(function () {
            if (!window.hasOSensor) {
                $.alert({message: '您的设备不支持该模式'});
                return false;
            }
            if (window.orientation != 90 && window.orientation != -90) {
                $.alert({message: '请使用横屏进入VR模式'});
                return false;
            }
            if (vrayScene.stereoMode) {
                vrayScene.walkMode = vrayScene.stereoMode = false;
                $nav.addClass(window.fromMobile ? 'mobile-show' : 'show');
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
            $nav.addClass(window.fromMobile ? 'mobile-show' : 'show');
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

        // 监听设备方向变化
        window.addEventListener('deviceorientation', setOrientationControls);
        function setOrientationControls(e) {
            (e.alpha || e.beta || e.gamma) && (window.hasOSensor = true);
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

        $fullBtn.click(function (e) {
            e.preventDefault();
            if (fullScreen) {
                exitFullscreen();
                $fullBtn.removeClass('unfullBtn');
                $fullBtn.addClass('fullBtn');
                clickFullBtn = true;
            } else {
                launchFullscreen($body[0]);
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
        $upBtn.click(function (e) {
            e.preventDefault();
            galleryScrollLeft -= 160;
            (galleryScrollLeft - 150 < 0) && (galleryScrollLeft = 0);
            $gallery.stop().animate({scrollLeft: galleryScrollLeft + 'px'}, 500);
        });
        $downBtn.click(function (e) {
            e.preventDefault();
            galleryScrollLeft += 160;
            (galleryScrollLeft + 150 > maxScrollLeft) && (galleryScrollLeft = maxScrollLeft);
            $gallery.stop().animate({scrollLeft: galleryScrollLeft + 'px'}, 500);
        });
        $gallery.mousewheel(function (event, delta) {
            event.preventDefault();
            if (delta != 0) {
                galleryScrollLeft = galleryScrollLeft - delta * liWidth;
                (galleryScrollLeft - 150 < 0) && (galleryScrollLeft = 0);
                (galleryScrollLeft + 150 > maxScrollLeft) && (galleryScrollLeft = maxScrollLeft);
                $gallery.stop().animate({scrollLeft: galleryScrollLeft + 'px'}, 500);
            }
        });
        // 添加热点
        $addHotBtn.click(function () {
            vrayScene.addingHot = !vrayScene.addingHot;
        });

        $addHotDialog.find('.add-btn').click(function () {
            if (!newHotInfo) return false;
            var newStep = footStep.clone();
            newStep.material = stepMaterial.clone();
            var point = newHotInfo.point;
            point.setLength(45);
            newStep.position.set(-point.x, point.y, point.z);
            var rayVector = newHotInfo.vector;
            newStep.to = $addHotDialog.find('select').val();

            if (newStep.to == spaceId) {
                alert('不可与当前场景相同！');
                animate();
                return false;
            }
            $.post('add_hot', {
                srcId: spaceId,
                vx: rayVector.x,
                vy: rayVector.y,
                vz: rayVector.z,
                title: newStep.to && spacesDict[newStep.to].name ? spacesDict[newStep.to].name : '',
                to: newStep.to
            }, function (data) {
                if (data.success) {
                    newStep.lookAt(_camera.position);
                    spheres[1].add(newStep);
                    if (!spacesDict[spaceId].hots) spacesDict[spaceId].hots = {};
                    var hotInfo = data.hotInfo;
                    hotInfo.ray = newHotInfo.ray;
                    newStep.hotId = data.hotId;
                    newStep.title = data.hotInfo.title;
                    hotInfo.mesh = newStep;
                    spacesDict[spaceId].hots[data.hotId] = hotInfo;
                    updateCurrentSteps();
                    console.log('"vx":' + rayVector.x.toFixed(4) + ',"vy":' + rayVector.y.toFixed(4) + ',"vz":' + rayVector.z.toFixed(4) + ',');
                } else {
                    alert('添加失败');
                }
                footStep.visible = false;
                addingPoint = false;
                canDo = true;
                orbitControls.enabled = true;
                $addHotBtn.removeClass('active');
                $addHotDialog.hide();
                newHotInfo = null;
                animate();
            });
        });

        $addHotDialog.find('.redo-btn').click(function () {
            $addHotDialog.hide();
            canDo = true;
            addingPoint = true;
            orbitControls.enabled = true;
            console.log(spacesDict[spaceId].hots);
            animate();
        });

        $addHotDialog.find('i').click(function () {
            $addHotDialog.hide();
            footStep.visible = false;
            addingPoint = false;
            canDo = true;
            orbitControls.enabled = true;
            $addHotBtn.removeClass('active');
            animate();
        });

        $editHotDialog.find('i').click(function () {
            $editHotDialog.hide();
            footStep.visible = false;
            canDo = true;
            orbitControls.enabled = true;
            animate();
        });

        $editHotDialog.find('.del-btn').click(function () {
            $.get('del_hot', {
                srcId: spaceId,
                hotId: targetStep.hotId
            }, function (data) {
                if (data.success) {
                    canDo = true;
                    orbitControls.enabled = true;
                    delete spacesDict[spaceId].hots[targetStep.hotId];
                    spheres[1].remove(targetStep);
                    $editHotDialog.hide();
                    updateCurrentSteps();
                } else {
                    alert('删除失败');
                }
                animate();
            });
        });

        $editHotDialog.find('.update-btn').click(function () {
            if ($editHotDialog.find('select').val() == spaceId) {
                alert('不可与当前场景相同！');
                return false;
            }
            $.post('update_hot', {
                srcId: spaceId,
                hotId: targetStep.hotId,
                title: $editHotDialog.find('input[name=title]').val(),
                to: $editHotDialog.find('select').val()
            }, function (data) {
                if (data.success) {
                    var hot = spacesDict[spaceId].hots[targetStep.hotId];
                    hot.to = data.hot.to;
                    hot.title = data.hot.title;
                    targetStep.title = hot.title;
                    canDo = true;
                    orbitControls.enabled = true;
                    $editHotDialog.hide();
                } else {
                    alert('更新失败');
                }
                animate();
            });
        });
    }

    window.addEventListener('resize', function () {
        if(!fullScreen&&clickFullBtn){
            fullScreen = true;
        } else {
            $fullBtn.removeClass('unfullBtn');
            $fullBtn.addClass('fullBtn');
            fullScreen = false;
        }
    }, false);

    function launchFullscreen(element) {
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

    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

})(window, document, $, VRAY);