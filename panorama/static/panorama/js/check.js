/**
 * Created by ck on 2016/6/15.
 */

"use strict";
$.ajax({
    url: 'get_space',
    type: "get",
    data: {space_id: getParam('space_id')},
    dataType: "json",
    timeout: 0,
    complete: function (xhr) {
        if (xhr.status == 200) {
            var ret = JSON.parse(xhr.responseText);
            if (ret.success) {
                if (!ret.success) {
                    alert(ret['err_msg']);
                    return false;
                }
                var spaceInfo = ret.data;
                var seller = spaceInfo['seller'];
                var textures = spaceInfo['textures'];

                var fromMobile = !fromPC();

                var $body = $(document.body);
                var $nav = $('#nav');
                var $fullBtn = $('#fullBtn');
                var $infoBtn = $('.infoBtn');
                var $closeBtn = $('.close-btn');
                var $hideBtn = $('.hideBtn');
                var $miniNav = $('#miniNav');
                var $showNav = $('#showNav');
                var $sellerDialog = $('.dialog.seller-info');
                var $cross = $('#cross');
                var $doubleCross = $('#double-cross');
                var $walkMode = $('#walk-mode');
                var $vrOpen = $('#vr-open');
                var $vrClose = $('#vr-close');

                var i, j, k;  // 计数器
                var fullScreen = false;
                var clickFullBtn = false;
                var hasOSensor = false;  // 是否有方向传感器

                document.title = ('查看空间：' + spaceInfo.name).toString();

                // 商户信息
                var logoUrl = seller.logo || '/panorama/img/logo/logo.png';
                document.getElementById('seller-logo').src = logoUrl;
                document.getElementById('seller-name').innerHTML = seller['name'] || '';
                document.getElementById('seller-phone').innerHTML = seller['phone'] || '';
                document.getElementById('seller-address').innerHTML = seller['address'] || '';

                var container = document.getElementById('main');
                var progress = new Progress(container).start();
                var $container = $(container);


                var textureEle = document.getElementById('texture');
                var texturesHtml = '<ul>';
                var list = null;
                for (i = 0; i < textures.length; i++) {
                    texturesHtml += '<li>' + textures[i]['category'] + '<ul>';
                    list = textures[i]['list'];
                    for (j = 0; j < list.length; j++) {
                        texturesHtml += '<li data-url="' + list[j].url + '">' + list[j].label + '</li>';
                    }
                    texturesHtml += '</ul></li>';
                }
                textureEle.innerHTML = texturesHtml;

                // 首屏载入成功
                var onLoad = function () {
                    if (fromMobile) {
                        $('#operate-panel-mobile').show();
                        $('#operate-panel-PC').hide();
                    }
                    $nav.addClass('show');

                    // 隐藏loading动画
                    progress.end();
                    animate();
                    bindUIListener();
                };

                var textureLoadProgress = function (num) {
                    progress.update(num);
                };

                var $torch = $('#mini-map').find('i');

                var onCameraChanged = function (cameraDirection) {
                    // 弧度单位rad
                    var cssText = 'translateY(-50%) rotate(' + Math.atan2(cameraDirection.x, -cameraDirection.z) + 'rad)';
                    $torch.css({'transform': cssText});
                };

                var onShowing = function () {
                    console.log('onShowing');
                    progress.start();
                };

                var onShowFail = function (data) {
                    alert(data.msg);
                };

                // 场景切换完毕
                var onShown = function () {
                    console.log('onShown');
                    progress.end();
                };

                window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
                var animate = function () {
                    panorama.update();  // 更新场景数据
                    requestAnimationFrame(animate);
                };

                var bindUIListener = function () {

                    $('#texture').on('click', 'li', function () {
                        var textureUrl = $(this).data('url');
                        if (textureUrl) {
                            panorama.changeTexture(textureUrl);
                        } else {
                            $(this).toggleClass('show').siblings('li').removeClass('show');
                        }
                    });

                    $hideBtn.click(function () {
                        $nav.removeClass('mobile-show show');
                        $miniNav.addClass('show');
                        return false;
                    });
                    $showNav.click(function () {
                        $miniNav.removeClass('mobile-show show');
                        $nav.addClass(fromMobile ? 'mobile-show' : 'show');
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
                        $sellerDialog.fadeIn();
                        return false;
                    });
                    $closeBtn.click(function () {
                        $('.dialog').fadeOut();
                        return false;
                    });
                };

                // 监听设备方向变化（用于判断是否有方向传感器）
                window.addEventListener('deviceorientation', setOrientationControls);
                var setOrientationControls = function (e) {
                    e.alpha !== null && e.beta !== null && e.gamma !== null && (hasOSensor = true);
                    window.removeEventListener('deviceorientation', setOrientationControls);  // 移除监听器
                };

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
                    panorama.resize($container.width(), $container.height());
                }, false);

                var launchFullScreen = function (ele) {
                    if (ele.requestFullscreen) {
                        ele.requestFullscreen();
                    } else if (ele.mozRequestFullScreen) {
                        ele.mozRequestFullScreen();
                    } else if (ele.webkitRequestFullscreen) {
                        ele.webkitRequestFullscreen();
                    } else if (ele.msRequestFullscreen) {
                        ele.msRequestFullscreen();
                    }
                };

                var exitFullScreen = function () {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                };


                var spaceId = spaceInfo.id;
                var spacesDict = {};
                spacesDict[spaceId] = spaceInfo;
                var options = {
                    container: container,
                    logoUrl: logoUrl,
                    spacesDict: spacesDict,
                    entryId: spaceId,
                    smoothStart: false,
                    autoPlay: true,
                    autoRotate: true,
                    fps: true,
                    callbacks: {
                        onLoad: onLoad,
                        textureLoadProgress: textureLoadProgress,
                        onCameraChanged: onCameraChanged,
                        onShowing: onShowing,
                        onShown: onShown,
                        onShowFail: onShowFail
                    }
                };
                var panorama = new Panorama(options);

            } else {
                alert('无法获取场景数据');
            }
        } else {
            alert('获取场景数据失败');
        }
    }
});
