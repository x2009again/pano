/**
 * Created by ck on 2016/6/15.
 */

/** @namespace ret.scene */
/** @namespace ret.seller */
/** @namespace ret.err_msg */
/** @namespace VRAY */
/** @namespace space.thumb_url */
/** @namespace space.space_dict */
/** @namespace space.create_time */

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

    var $editPanel = $('#edit-panel');
    var $pickHot = $('#pick-hot');
    var $transformHotBtn = $('#transform-hot');
    var $hotTitle = $('#hot-title');

    var $hotIdInput = $('#input-hot-id');
    var $hotTitleInput = $('#input-hot-title');
    var $hotToInput = $('#input-hot-to');
    var $opacityInput = $('#input-opacity');
    var $rotationXInput = $('#input-rotation-x');
    var $rotationYInput = $('#input-rotation-y');
    var $rotationZInput = $('#input-rotation-z');
    var $positionXInput = $('#input-position-x');
    var $positionYInput = $('#input-position-y');
    var $positionZInput = $('#input-position-z');

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
        $sellerLogo.attr('src', logoUrl);
    } else {
        logoUrl = '/media/seller-logo/logo.png';
        $('#dialog-img-ele').hide();
    }
    $('#seller-name').val(seller.name || '');
    $('#seller-desc').val(seller.desc || '');

    var container = document.getElementById('main');
    var entry = sceneInfo.entry;
    var options = {
        // container: container,
        logoUrl: logoUrl,
        hotImg: hotImg,
        spaceList: spaceList,
        entry: entry,
        smoothStart: false,
        autoPlay: true,
        autoRotate: false,
        debug: true,
        fps: false,
        callbacks: {
            onLoad: onLoad,
            onShowing: onShowing,
            onShown: onShown,
            onAddingHot: onAddingHot,
            onOverHot: onOverHot,
            onLeaveHot: onLeaveHot,
            onEditingHot: resetEditPanel
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
        sceneContainer = vrayScene.stage;
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

    // 鼠标在热点上时
    function onOverHot(hotInfo, mousePos) {
        var hotTitle = vrayScene.editingHot ? '点击编辑热点' : (hotInfo.title || '');
        if (hotTitle && mousePos) {
            $hotTitle.html(hotTitle).css({
                left: mousePos.x - $hotTitle.width() - 20,
                top: mousePos.y - 25 / 2
            }).show();
        } else {
            $hotTitle.hide();
        }
    }

    // 鼠标离开热点时
    function onLeaveHot() {
        $hotTitle.hide();
    }

    // 使用插件回调来添加热点
    function onAddingHot(clickedPos) {
        rClickedPos = clickedPos;
        $pickHot.removeClass('active');
        showAddingHotDialog(rClickedPos);
    }

    var transform;
    var editingHotInfo;
    // 选中热点进入编辑时的回调
    function resetEditPanel(hotInfo) {
        editingHotInfo = hotInfo;
        $hotIdInput.val(editingHotInfo.id);// 热点ID
        $hotTitleInput.val(editingHotInfo.title);  // 热点标题
        var spacesDict = vrayScene.spacesDict;
        var eleIdList = $spaceBar.sortable('toArray');
        var spaceId, optionsHtml = '';
        var space = null;
        // TODO 添加onchange事件，在to属性修改时修改sphere[1]的材质
        for (var i = 0; i < eleIdList.length; i++) {
            spaceId = eleIdList[i].replace('space_id_', '');
            space = spacesDict[spaceId];
            optionsHtml += '<option value="' + space.id + '"' + (space.id == editingHotInfo.to ? ' selected="selected"' : '') + '>' + space.name + '</option>'
        }
        $editPanel.find('select').html(optionsHtml);
        $opacityInput.val(0.5);  // 透明度
        $rotationXInput.val(editingHotInfo.rx);
        $rotationYInput.val(editingHotInfo.ry);
        $rotationZInput.val(editingHotInfo.rz);
        $positionXInput.val(editingHotInfo.px);
        $positionYInput.val(editingHotInfo.py);
        $positionZInput.val(editingHotInfo.pz);
        transform = editingHotInfo;
        $editPanel.addClass('show');  // 显示编辑面板
    }

    var rClickedPos = null;  // 右键点击的位置
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

        $pickHot.click(function () {
            $(this).toggleClass('active');
            if (!sceneId) {
                alert('请先保存场景后再添加热点！');
            } else {
                vrayScene.addingHot = !vrayScene.addingHot;
            }
        });

        $transformHotBtn.click(function () {
            $(this).toggleClass('active');
            if (!sceneId) {
                alert('请先添加热点后再创建转场！');
            } else {
                if (vrayScene.editingHot) {
                    $editPanel.removeClass('show');
                    vrayScene.editingHot = false;
                } else {
                    vrayScene.editingHot = true;
                }
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
                                // TODO 同时修改下拉列表
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
            vrayScene.showSpace($(this).data('index'));
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
                if (vrayScene.addingHot) {  // 结束选择热点
                    $pickHot.removeClass('active');
                    vrayScene.addingHot = false;
                } else {
                    rClickedPos = {x: e.pageX, y: e.pageY};
                    $contextMenu.css({left: e.pageX, top: e.pageY}).show();
                }
                // 如果标题是显示状态（即鼠标在热点上），不显示右键菜单
                if ($hotTitle.is(':hidden')) e.stopPropagation();
            }
        });
        // 右键菜单中选择 添加热点
        $addHotBtn.click(function () {
            showAddingHotDialog({x: $addHotBtn.offset().left, y: $addHotBtn.offset().top});
        });
        // 确认添加热点
        $addHotDialog.find('.add-btn').click(function () {
            var toSpaceId = $addHotDialog.find('select').val();
            var title = $.trim($addHotDialog.find('input').val());
            if (toSpaceId == vrayScene.spaceId) {
                alert('不可与当前场景相同！');
                return false;
            }
            var hotPos = vrayScene.get3DPos(rClickedPos);
            $.post('add_hot', {
                scene_id: sceneId,
                space_id: vrayScene.spaceId,
                vx: hotPos.vx,
                vy: hotPos.vy,
                vz: hotPos.vz,
                title: title,
                to: toSpaceId
            }, function (data) {
                if (data.success) {
                    vrayScene.addHot(data.hotId, toSpaceId, hotPos, title);
                    $addHotDialog.hide();
                    vrayScene.lockScene = false;
                }
            });
        });
        // 隐藏对话框
        $addHotDialog.find('i').click(function () {
            $addHotDialog.hide();
            vrayScene.lockScene = false;
        });

        $addHotDialog.find('.redo-btn').click(function () {
            $addHotDialog.hide();
            vrayScene.lockScene = false;
            vrayScene.addingHot = true;
            $pickHot.addClass('active');
        });
        $editPanel.find('.range input').on('input', function () {
            switch (true) {
                case this.id == 'input-opacity':
                    console.log(this.value);
                    transform = vrayScene.applyTransform({opacity: parseFloat(this.value)});
                    break;
                case this.id == 'input-rotation-x':
                    transform = vrayScene.applyTransform({rx: parseFloat(this.value)});
                    break;
                case this.id == 'input-rotation-y':
                    transform = vrayScene.applyTransform({ry: parseFloat(this.value)});
                    break;
                case this.id == 'input-rotation-z':
                    transform = vrayScene.applyTransform({rz: parseFloat(this.value)});
                    break;
                case this.id == 'input-position-x':
                    transform = vrayScene.applyTransform({px: parseFloat(this.value)});
                    break;
                case this.id == 'input-position-y':
                    transform = vrayScene.applyTransform({py: parseFloat(this.value)});
                    break;
                case this.id == 'input-position-z':
                    transform = vrayScene.applyTransform({pz: parseFloat(this.value)});
                    break;
            }
        }).dblclick(function () {
            var _this = this;
            $(this).attr('step', window.prompt('请输入步长', _this.step));
        });

        $('.range>i').click(function () {
            var inputEle = $(this).parent().find('input')[0];
            var val = $(this).text() == '-' ? parseFloat(inputEle.value) - parseFloat(inputEle.step) : parseFloat(inputEle.value) + parseFloat(inputEle.step);
            switch (true) {
                case inputEle.id == 'input-opacity':
                    transform = vrayScene.applyTransform({opacity: parseFloat(val)});
                    inputEle.value = transform.opacity;
                    break;
                case inputEle.id == 'input-rotation-x':
                    transform = vrayScene.applyTransform({rx: parseFloat(val)});
                    inputEle.value = transform.rx;
                    break;
                case inputEle.id == 'input-rotation-y':
                    transform = vrayScene.applyTransform({ry: parseFloat(val)});
                    inputEle.value = transform.ry;
                    break;
                case inputEle.id == 'input-rotation-z':
                    transform = vrayScene.applyTransform({rz: parseFloat(val)});
                    inputEle.value = transform.rz;
                    break;
                case inputEle.id == 'input-position-x':
                    transform = vrayScene.applyTransform({px: parseFloat(val)});
                    inputEle.value = transform.px;
                    break;
                case inputEle.id == 'input-position-y':
                    transform = vrayScene.applyTransform({py: parseFloat(val)});
                    inputEle.value = transform.py;
                    break;
                case inputEle.id == 'input-position-z':
                    transform = vrayScene.applyTransform({pz: parseFloat(val)});
                    inputEle.value = transform.pz;
                    break;
            }
        });

        // 重置修改
        $('#reset-hot-info').click(function () {
            resetEditPanel(vrayScene.resetHot());
        });
        // 保存热点数据
        $('#save-hot-info').click(function () {
            var hotTitle = $hotTitleInput.val();
            var hotTo = $hotToInput.val();
            $.post('update_hot', {
                id: editingHotInfo.id,
                title: hotTitle,
                to: hotTo,
                px: transform.px,
                py: transform.py,
                pz: transform.pz,
                rx: transform.rx,
                ry: transform.ry,
                rz: transform.rz
            }, function (data) {
                if (data.success) {
                    vrayScene.saveHot(hotTo, hotTitle, transform);
                    $editPanel.removeClass('show');
                    $transformHotBtn.removeClass('active');
                }
            });

        });
        // 退出编辑
        $('#cancel-edit').click(function () {
            $editPanel.removeClass('show');
            $transformHotBtn.removeClass('active');
            vrayScene.editingHot = false;
        });
        // 删除热点
        $('#delete-hot-btn').click(function () {
            $.post('delete_hot', {
                id: editingHotInfo.id
            }, function (data) {
                if (data.success) {
                    vrayScene.deleteHot(editingHotInfo.id);
                    $editPanel.removeClass('show');
                    $transformHotBtn.removeClass('active');
                }
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
    };

    // 监听窗口大小改变事件
    window.addEventListener('resize', function () {
        vrayScene.resize(window.innerWidth, window.innerHeight);
    }, false);
});