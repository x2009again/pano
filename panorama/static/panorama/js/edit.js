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
    var hotImg = '/static/panorama/img/foot_step.png';

    var container = document.getElementById('container');
    var $loading = $('#loading');
    var $mask = $('#mask');
    var $body = $(document.body);
    var $contextMenu = $('#context-menu');

    var $addHotBtn = $('#add-hot');
    var $addHotDialog = $('#add-hot-dialog');
    var $editHotDialog = $('#edit-hot-dialog');

    $editHotDialog.on("contextmenu", function () {
        return false;
    });

    var saved = true;
    var $spaceBar = $('#space-bar');
    var $editSidebar = $('#edit-sidebar');
    var $preview = $('#preview');

    var $addSpace = $('#add-space');
    var $saveAs = $('#save-as');
    var $editInfo = $('#edit-info');
    var $qrCode = $('#qr-code');
    var $addSpaceDialog = $('#add-space-dialog');
    var $saveAsDialog = $('#save-as-dialog');
    var $editInfoDialog = $('#edit-seller-dialog');
    var $spacesContainer = $('#spaces-container');
    var $sellerLogo = $("#seller-logo");
    var $playBtn = $('#play-btn');

    // TODO 选择热点位置
    var $pickHotBtn = $('#pick-hot');

    var sceneContainer = null;

    if (sceneInfo && sceneInfo.title) {
        document.title = sceneInfo.title;
        var viewUrl = window.location.origin + '/panorama/view?scene_id=' + sceneInfo.id;
        document.getElementById('view-link').href = viewUrl;
        new QRCodeLib.QRCodeDraw().draw(document.getElementById('qr-canvas'), viewUrl, function (error) {
            if (error) {
                return console.log('Error =( ', error);
            }
        });
    }
    // 商户信息
    var logoUrl = '';
    if (seller.logo) {
        logoUrl = seller.logo;
        document.getElementById('seller-logo').src = seller.logo;
    } else {
        logoUrl = '/media/seller-logo/logo.png';
        document.getElementById('dialog-img-ele').style.display = 'none';
    }
    document.getElementById('seller-name').value = seller.name || '';
    document.getElementById('seller-desc').value = seller.desc || '';

    var entry = sceneInfo.entry;
    var options = {
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
            onAddingHot: onAddingHot,
            onHotAdd: onHotAdd
        }
    };
    var vrayScene = new VRAY.Scene(options);

    // 首屏载入成功
    function onLoad() {
        // 空间列表
        var lisHtml = '';
        for (var i = 0; i < spaceList.length; i++) {
            var space = spaceList[i];
            var thumbUrl = space.thumb_url;
            if (thumbUrl) {
                lisHtml += '<li class="space-ele" id="space_id_' + space.id + '" data-index="' + space.id + '">' +
                    '<div class="ele-pic"><img src="' + thumbUrl + '"/></div>' +
                    '<div class="ele-name"><input title="回车确认" type="text" value=""/><span>' + space.name + '</span></div>' +
                    '<div class="ele-ope"><div class="ele-ope-edit"></div><div class="ele-ope-del"></div></div></li>';
            }
        }
        $spaceBar[0].innerHTML = lisHtml;
        // entry = options.entry || vrayScene.entry;
        $('#space_id_' + entry).addClass('active');
        $spaceBar.height($editSidebar.height() - 140);

        $loading.fadeOut(1000);
        if (options.autoPlay) {
            $mask.fadeOut(1000);
        } else {
            $playBtn.fadeIn(1000);
        }
        sceneContainer = vrayScene.container;
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
        $spaceBar.find('li').removeClass('active');
        $('#space_id_' + spaceId).addClass('active');
        $mask.hide();
        $loading.stop().fadeOut(700);
    }

    function onAddingHot(clickedPos) {
        showAddingHotDialog(clickedPos);
    }

    function onHotAdd(hotInfo, success, fail) {
        $.post('add_hot', {
            scene_id: sceneId,
            space_id: vrayScene.spaceId,
            vx: hotInfo.vx,
            vy: hotInfo.vy,
            vz: hotInfo.vz,
            title: '',
            to: hotInfo.to
        }, function (data) {
            console.log(data);
            if (data.success) {
                $addHotDialog.hide();
                vrayScene.lockScene = false;
                success(data.hotId);
            } else {
                fail('某个错');
                alert('添加失败');
            }
        });
    }

    /**
     * 显示添加热点对话框
     * @param pos
     */
    var showAddingHotDialog = function (pos) {
        $contextMenu.hide();
        vrayScene.addingHot = false;
        vrayScene.lockScene = true;
        var spacesDict = vrayScene.spacesDict;
        var eleIdList = $spaceBar.sortable('toArray');
        var spaceId, optionsHtml = '';
        var space = null;
        for (var i = 0; i < eleIdList.length; i++) {
            spaceId = eleIdList[i].replace('space_id_', '');
            space = spacesDict[spaceId];
            optionsHtml += '<option value="' + space.id + '">' + space.name + '</option>'
        }
        $addHotDialog.find('select').html(optionsHtml);
        $addHotDialog.css({left: pos.x, top: pos.y}).show();
    };

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    function animate() {
        vrayScene.update();  // 更新场景数据
        requestAnimationFrame(animate);
    }

    function bindUIListener() {

        $pickHotBtn.click(function () {
            if (!sceneId) {
                alert('请先保存场景后再添加热点！');
            } else {
                vrayScene.addingHot = !vrayScene.addingHot;
            }
        });

        // 禁止页面弹出右键菜单
        document.oncontextmenu = function () {
            return false;
        };

        $playBtn.click(function () {
            $mask.fadeOut(500);
            $playBtn.stop().fadeOut(500);
            vrayScene.play();
            return false;
        });

        // 侧边栏排序
        $spaceBar.sortable({
            change: function () {
                saved = false;
            }
        });
        $spaceBar.disableSelection();

        var tempSpaceDict = {};
        // 添加空间按钮
        $addSpace.click(function () {
            var listHtml = '';
            $.get('list_spaces', function (result) {
                if (!result.success) return false;
                tempSpaceDict = result.space_dict;
                for (var key in tempSpaceDict) {
                    if (tempSpaceDict.hasOwnProperty(key)) {
                        var space = tempSpaceDict[key];
                        var checkedStr = vrayScene.spacesDict[key] ? 'checked="checked"' : '';
                        listHtml += '<div class="space">'
                            + '<div class="space-img">'
                            + '<input type="checkbox" data-spaceid="' + key + '" ' + checkedStr + '  /><img src="' + space.thumb_url + '">'
                            + '</div>'
                            + '<div class="space-name">' + space.name + '</div>'
                            + '<div class="space-time">创建时间 ' + space.create_time + '</div>'
                            + '</div>';
                    }
                }
                $spacesContainer[0].innerHTML = listHtml;
                $mask.show();
                $addSpaceDialog.show();
            });
        });
        // 选择/取消空间
        var operate = {};
        $spacesContainer.on('click', '.space-img', function (e) {
            e.stopPropagation();
            var $checkBox = $(this).find('input');
            var spaceId = $checkBox.data('spaceid');
            if (spaceId == vrayScene.spaceId) {
                alert('不能移除当前空间！');
                return false;
            }
            operate[spaceId] = !$checkBox.prop('checked');
            $checkBox.prop('checked', operate[spaceId]);
        });
        // 确定添加空间按钮
        $addSpaceDialog.find('.dialog-confirm').click(function () {
                var operateLength = propLength(operate);
                var i = 0;
                for (var key in operate) {
                    if (operate.hasOwnProperty(key)) {
                        if (operate[key]) {
                            i++;
                            if (!vrayScene.spacesDict[key]) {  // 如果操作是true且列表中不存在则添加
                                var space = tempSpaceDict[key];
                                saved = false;
                                vrayScene.addSpace(space);
                                $spaceBar.append('<li class="space-ele" id="space_id_' + key + '" data-index="' + key + '">' +
                                    '<div class="ele-pic"><img src="' + space.thumb_url + '"/></div>' +
                                    '<div class="ele-name"><input type="text" value=""/><span>' + space.name + '</span></div>' +
                                    '<div class="ele-ope"><div class="ele-ope-edit"></div><div class="ele-ope-del"></div></div></li>');
                                if (i == operateLength) {
                                    if ($spaceBar.find('li').length > 1) {
                                        $spaceBar.removeClass('no-del');
                                    }
                                    $mask.hide();
                                    $addSpaceDialog.hide();
                                }
                            } else {  // 已存在则跳过
                                if (i == operateLength) {
                                    if ($spaceBar.find('li').length > 1) {
                                        $spaceBar.removeClass('no-del');
                                    }
                                    $mask.hide();
                                    $addSpaceDialog.hide();
                                }
                            }
                        } else {  // false表示删除
                            i++;
                            console.log(vrayScene.spacesDict);
                            console.log(key);
                            if (vrayScene.spacesDict[key]) {  // 如果存在于列表中则删除
                                vrayScene.removeSpace(key);
                                $('#space_id_' + key).remove();
                                saved = false;
                            }
                            if (i == operateLength) {
                                if ($spaceBar.find('li').length > 1) {
                                    $spaceBar.removeClass('no-del');
                                }
                                $mask.hide();
                                $addSpaceDialog.hide();
                            }
                        }
                    }
                }
            }
        );
        // 关闭对话框
        $('.dialog-close, .dialog-cancel').click(function () {
            var $dialog = $(this).parent().parent();
            $mask.hide();
            $dialog.hide();
        });
        // 删除空间
        $spaceBar.on('click', '.ele-ope-del', function () {
            var $li = $(this).parent().parent();
            var spaceId = $li.data('index');
            if (spaceId == vrayScene.spaceId) {
                alert('无法删除当前空间！');
                return false;
            }
            vrayScene.removeSpace(spaceId);
            $li.remove();
            saved = false;
            if (propLength(vrayScene.spacesDict) <= 1) {
                $spaceBar.addClass('no-del');
            }
            return false;
        });
        // 修改空间名称
        $spaceBar.on('click', '.ele-ope-edit', function () {
            var $li = $(this).parent().parent();
            var $span = $li.find('span');
            var $input = $li.find('input');
            $span.hide();
            $input.val($span.html()).show().focus().select();
            return false;
        });
        // 回车修改空间名称
        $spaceBar.on('keydown', 'input', function (e) {
            if (e.keyCode == 13) {
                var spaceName = $(this).val();
                vrayScene.spacesDict[$(this).parent().parent().data('index')].name = spaceName;
                $(this).next().html(spaceName).show();
                $(this).hide();
                saved = false;
            } else if (e.keyCode == 27) {
                $(this).val(vrayScene.spacesDict[$(this).parent().parent().data('index')].name);
                $(this).hide();
            }
        });

        // 侧边栏切换场景
        $spaceBar.on('click', 'li', function () {
            vrayScene.showSpace({to: $(this).data('index')});
        });

        $spaceBar.on('blur', 'input', function () {
            var spaceName = this.value;
            var spaceId = $(this).parent().parent().data('index');
            if (vrayScene.spacesDict[spaceId].name != spaceName) {
                vrayScene.spacesDict[spaceId].name = spaceName;
                saved = false;
            }
            $(this).next().html(spaceName).show();
            $(this).hide();
        });

        // 点击页面保存修改
        $body.click(function () {
            if ($qrCode.is(':visible'))
                $qrCode.animate({'opacity': 0, 'margin-top': '-40px'}, function () {
                    $(this).hide();
                });
            $spaceBar.find('input:visible').blur();
        });
        $spaceBar.on('click', 'input', function () {
            return false;
        });
        // 编辑商家信息窗口
        $editInfo.click(function () {
            if (seller.logo) {
                document.getElementById('seller-logo').src = seller.logo;
                document.getElementById('dialog-img-ele').style.display = 'block';
            } else {
                document.getElementById('dialog-img-ele').style.display = 'none';
            }
            document.getElementById('seller-name').value = seller.name || '';
            document.getElementById('seller-desc').value = seller.desc || '';
            $mask.show();
            $editInfoDialog.show();
        });
        $('#logo-input').change(function () {
            var files = this.files;
            if (!files || !files.length > 0 || !window.FileReader) {
                document.getElementById('dialog-img-ele').style.display = 'none';
                return false;
            }
            if (/^image.*/.test(files[0].type)) {
                var reader = new FileReader();
                reader.readAsDataURL(files[0]);
                reader.onloadend = function () {
                    $sellerLogo.attr("src", this.result);
                    document.getElementById('dialog-img-ele').style.display = 'block';
                }
            } else {
                alert("请选择图片格式！");
            }
        });
        // 编辑商家信息操作
        $editInfoDialog.find('.dialog-confirm').click(function () {
            document.getElementById('seller_id').value = seller.id;
            $editInfoDialog.find('form').submit();
        });
        // 更新场景数据or弹出标题对话框
        $saveAs.click(function () {
            if (saved) {
                alert('未修改任何数据');
                return false;
            }
            if (sceneInfo && sceneInfo.title) {
                var spacesOfScene = [];
                var eleIdList = $spaceBar.sortable('toArray');
                for (var i = 0; i < eleIdList.length; i++) {
                    var spaceId = eleIdList[i].replace('space_id_', '');
                    var space = vrayScene.spacesDict[spaceId];
                    spacesOfScene.push({
                        id: spaceId,
                        name: space.name
                    });
                }
                $.post('update_scene', {
                    scene_id: sceneInfo.id,
                    spaces: JSON.stringify(spacesOfScene)
                }, function (ret) {
                    if (ret.success) {
                        saved = true;
                        entry = ret.entry;
                        alert('保存成功');
                    } else {
                        alert('保存失败！');
                    }
                });
            } else {
                $('#scene-title').val('');
                $mask.show();
                $saveAsDialog.show();
            }
        });
        $preview.click(function (e) {
            if (sceneInfo && sceneInfo.title) {
                if ($qrCode.is(':hidden')) $qrCode.show().animate({'opacity': 1, 'margin-top': '-20px'});
                e.stopPropagation();
            } else {
                alert('请先保存场景！');
            }
        });

        // 保存场景数据
        $saveAsDialog.find('.dialog-confirm').click(function () {
            if (saved) {
                alert('未修改任何数据');
                $mask.hide();
                $saveAsDialog.hide();
                return false;
            }
            var spacesOfScene = [];
            var spaceIdList = $spaceBar.sortable('toArray');
            for (var i = 0; i < spaceIdList.length; i++) {
                var spaceId = spaceIdList[i].replace('space_id_', '');
                var space = vrayScene.spacesDict[spaceId];
                spacesOfScene.push({
                    id: spaceId,
                    name: space.name
                });
            }
            $.post('update_scene', {
                scene_id: sceneInfo ? sceneInfo.id : null,
                title: $('#scene-title').val(),
                spaces: JSON.stringify(spacesOfScene)
            }, function (ret) {
                if (ret.success) {
                    entry = ret.entry;
                    saved = true;
                    alert('保存成功');
                    if (ret.scene_id) {
                        window.location.assign('edit?scene_id=' + ret.scene_id);
                    } else {
                        document.title = ret.title;
                        $mask.hide();
                        $saveAsDialog.hide();
                    }
                } else {
                    alert(ret.err_msg);
                    // TODO return false;
                }
            });
        });

        // 隐藏右键菜单
        $body.on('mousedown', function (e) {
            // add-hot按钮需要手动隐藏右键菜单
            if (e.target.id != 'add-hot') $contextMenu.hide();
        });
        // 容器右键菜单
        $(sceneContainer).on('mousedown', function (e) {
            if (e.which == 3) {
                if (vrayScene.addingHot) {
                    vrayScene.addingHot = false;
                } else {
                    $contextMenu.css({left: e.pageX, top: e.pageY}).show();
                }
                return false;
            }
        });

        // 显示添加热点对话框
        $addHotBtn.click(function () {
            showAddingHotDialog({x: $addHotBtn.offset().left, y: $addHotBtn.offset().top});
        });

        // 隐藏对话框
        $addHotDialog.find('i').click(function () {
            $addHotDialog.hide();
            vrayScene.lockScene = false;
        });

        $addHotDialog.find('.add-btn').click(function () {
            var toSpaceId = $addHotDialog.find('select').val();
            if (toSpaceId == vrayScene.spaceId) {
                alert('不可与当前场景相同！');
                return false;
            }
            vrayScene.addHot(toSpaceId);
        });

        $addHotDialog.find('.redo-btn').click(function () {
            $addHotDialog.hide();
            vrayScene.lockScene = false;
            vrayScene.addingHot = true;
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
                    delete vrayScene.spacesDict[spaceId].hots[targetStep.hotId];
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
                    var hot = vrayScene.spacesDict[spaceId].hots[targetStep.hotId];
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

    window.getResultStr = function (result) {
        if (result.success) {
            var s = result.seller;
            s.name && (seller.name = s.name);
            s.logo && (seller.logo = s.logo);
            s.desc && (seller.desc = s.desc);
            if (seller.logo != logoUrl) {
                logoUrl = seller.logo;
                vrayScene.changeLogo(logoUrl);
            }
            $mask.hide();
            $editInfoDialog.hide();
            alert('操作成功！');
        } else {
            alert('操作修改！');
        }
    }
});