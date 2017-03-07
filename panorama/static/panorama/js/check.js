/**
 * Created by ck on 2016/6/15.
 */

"use strict";
var container = document.getElementById('main');
var maskLayer = new MaskLayer(container).show();
var progress = new Progress(container).start();
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
                var area2texture = spaceInfo['area2texture'];
                var groupList = spaceInfo['group_list'];
                var urlList = spaceInfo['url_list'];
                var entryCodes = spaceInfo['entry_codes'];

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

                var $container = $(container);


                var textureEle = document.getElementById('opt-panel');
                var texturesHtml = '<ul>';
                var area2code = {};  // 记录每个areaCode对应的当前textureCode
                var textures = null;

                var entryTextures = entryCodes ? entryCodes.split(',').map(function (o) {
                        return parseInt(o);
                    }) : [];
                Object.keys(area2texture).forEach(function (k) {
                    texturesHtml += '<li class="area">' + area2texture[k]['area_label'] + '<ul data-code="' + k + '">';
                    textures = area2texture[k]['textures'];
                    for (i = 0; i < textures.length; i++) {
                        var textureCode = textures[i].code;
                        var textureClass = null;
                        if (entryTextures.contains(textureCode)) {
                            textureClass = 'texture show';
                            area2code[k] = textureCode;
                        } else {
                            textureClass = 'texture';
                        }
                        console.log(textureCode);
                        texturesHtml += '<li class="' + textureClass + '" data-code="' + textureCode + '">' + textures[i].label + '</li>';
                    }
                    texturesHtml += '</ul></li>';
                });
                textureEle.innerHTML = texturesHtml;

                // 首屏载入成功
                var onInit = function () {
                    if (fromMobile) {
                        $('#operate-panel-mobile').show();
                        $('#operate-panel-PC').hide();
                    }
                    $nav.addClass('show');

                    // 隐藏loading动画
                    progress.end();
                    maskLayer.hide();
                    animate();
                    bindUIListener();
                };

                var onLoadStart = function () {
                    maskLayer.show(1000);
                    progress.start();
                };

                var onLoading = function (num) {
                    progress.update(num);
                };

                var onLoadEnd = function () {
                    maskLayer.hide();
                    progress.end();
                };

                var onLoadFail = function (msg) {
                    alert(msg);
                    maskLayer.hide();
                    progress.end();
                };

                window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
                var animate = function () {
                    panorama.update();  // 更新场景数据
                    requestAnimationFrame(animate);
                };

                var bindUIListener = function () {

                    $('.area').click(function () {
                        $(this).toggleClass('show').siblings('li').removeClass('show');
                    });

                    $('.texture').click(function () {
                        var textureCode = parseInt($(this).data('code'));
                        var areaCode = parseInt($(this).parent().data('code'));
                        area2code[areaCode] = textureCode;
                        var group = [];
                        Object.keys(area2code).forEach(function (key) {
                            group.push(area2code[key]);
                        });
                        var textureUrl;
                        for (i = 0; i < groupList.length; i++) {
                            if (groupList[i].contains(group)) {
                                textureUrl = urlList[i];
                                console.log(urlList[i]);
                                break;
                            }
                        }
                        if (textureUrl) {
                            panorama.changeTexture(textureUrl);
                            $(this).toggleClass('show').siblings('li').removeClass('show');
                        } else {
                            alert('没有该组合');
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
                var setOrientationControls = function (e) {
                    e.alpha !== null && e.beta !== null && e.gamma !== null && (hasOSensor = true);
                    window.removeEventListener('deviceorientation', setOrientationControls);  // 移除监听器
                };
                window.addEventListener('deviceorientation', setOrientationControls);

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
                        onInit: onInit,
                        onLoadStart: onLoadStart,
                        onLoading: onLoading,
                        onLoadEnd: onLoadEnd,
                        onLoadFail: onLoadFail
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
