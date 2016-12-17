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

    /** ====================================== UI  ====================================== **/

    var ui = {
        $body: $(document.body),
        container: document.getElementById('main'),
        $sellerName: $('#seller-name'),
        $sellerDesc: $('#seller-desc'),
        $loading: $('#loading'),
        $mask: $('#mask'),
        $contextMenu: $('#context-menu'),
        $showAddHotDialogBtn: $('#add-hot'),
        $addHotDialog: $('#add-hot-dialog'),
        $editHotDialog: $('#edit-hot-dialog'),
        $spaceBar: $('#space-bar'),
        $editSidebar: $('#edit-sidebar'),
        $preview: $('#preview'),
        $showAddDialogBtn: $('#show-add-dialog'),
        $saveAs: $('#save-as'),
        $editInfo: $('#edit-info'),
        $qrCode: $('#qr-code'),
        $addSpaceDialog: $('#add-space-dialog'),
        $saveAsDialog: $('#save-as-dialog'),
        $editInfoDialog: $('#edit-seller-dialog'),
        $spacesContainer: $('#spaces-container'),
        $sellerLogo: $("#seller-logo"),
        $playBtn: $('#play-btn'),
        $editPanel: $('#edit-panel'),
        $pickHot: $('#pick-hot'),
        $transformHotBtn: $('#transform-hot'),
        $hotTitle: $('#hot-title'),
        $hotIdInput: $('#input-hot-id'),
        $hotTitleInput: $('#input-hot-title'),
        $hotToInput: $('#input-hot-to'),
        $opacityInput: $('#input-opacity'),
        $rotationXInput: $('#input-rotation-x'),
        $rotationYInput: $('#input-rotation-y'),
        $rotationZInput: $('#input-rotation-z'),
        $positionXInput: $('#input-position-x'),
        $positionYInput: $('#input-position-y'),
        $positionZInput: $('#input-position-z')
    };

    /** ====================================== variable ====================================== **/

    var sceneInfo = ret['scene'];
    var seller = ret['seller'];
    var spaceList = ret['spaceList'];
    var hotImg = '/static/panorama/img/foot_step.png';
    var saved = true;
    var sceneContainer = null;
    var logoUrl = seller.logo || '/panorama/img/logo/logo.png';
    var entryId = sceneInfo.entry;

    var spacesDict = {};
    for (var i = 0; i < spaceList.length; i++) {
        spacesDict[spaceList[i].id] = spaceList[i];  // 空间集合
    }

    var options = {
        // container: container,
        logoUrl: logoUrl,
        hotImg: hotImg,
        spacesDict: spacesDict,
        entryId: entryId,
        smoothStart: true,
        autoPlay: false,
        autoRotate: false,
        debug: false,
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
    var panorama = new Panorama(options);
    var rClickedPos = null;  // 右键点击的位置
    var transform;
    var editingHotInfo;

    /** ====================================== function ====================================== **/

    // 首屏载入成功
    function onLoad() {
        // 空间列表
        var lisHtml = '';
        for (var i = 0; i < spaceList.length; i++) {
            var space = spaceList[i];
            var thumbUrl = space['thumb_url'];
            if (thumbUrl) {
                lisHtml += '<li class="space-ele" id="space_id_' + space.id + '" data-index="' + space.id + '">' +
                    '<div class="ele-pic"><img src="' + thumbUrl + '"/></div>' +
                    '<div class="ele-name"><input title="回车确认" type="text" value=""/><span>' + space.name + '</span></div>' +
                    '<div class="ele-ope"><div class="ele-ope-edit"></div><div class="ele-ope-del"></div></div></li>';
            }
        }
        ui.$spaceBar[0].innerHTML = lisHtml;
        // entry = options.entry || panorama.entry;
        $('#space_id_' + entryId).addClass('active');
        ui.$spaceBar.height(ui.$editSidebar.height() - 140);

        ui.$loading.fadeOut(1000);
        if (options.autoPlay) {
            ui.$mask.fadeOut(1000);
        } else {
            ui.$playBtn.fadeIn(1000);
        }
        sceneContainer = panorama.stage;
        bindUIListener();
        animate();
    }

    // 下一个场景加载中
    function onShowing() {
        ui.$mask.show();
        ui.$loading.stop().fadeIn(1000);
    }

    // 场景切换完毕
    function onShown(spaceId) {
        ui.$spaceBar.find('li').removeClass('active');
        $('#space_id_' + spaceId).addClass('active');
        ui.$mask.hide();
        ui.$loading.stop().fadeOut(700);
    }

    // 鼠标在热点上时
    function onOverHot(hotInfo, mousePos) {
        var hotTitle = panorama.editingHot ? '点击编辑热点' : (hotInfo.title || '');
        if (hotTitle && mousePos) {
            ui.$hotTitle.html(hotTitle).css({
                left: mousePos.x - ui.$hotTitle.width() - 20,
                top: mousePos.y - 25 / 2
            }).show();
        } else {
            ui.$hotTitle.hide();
        }
    }

    // 鼠标离开热点时
    function onLeaveHot() {
        ui.$hotTitle.hide();
    }

    // 使用插件回调来添加热点
    function onAddingHot(clickedPos) {
        rClickedPos = clickedPos;
        ui.$pickHot.removeClass('active');
        showAddingHotDialog(rClickedPos);
    }

    // 选中热点进入编辑时的回调
    function resetEditPanel(hotInfo) {
        editingHotInfo = hotInfo;
        ui.$hotIdInput.val(editingHotInfo.id);// 热点ID
        ui.$hotTitleInput.val(editingHotInfo.title);  // 热点标题
        var spacesDict = panorama.spacesDict;
        var eleIdList = ui.$spaceBar.sortable('toArray');
        var spaceId, optionsHtml = '';
        var space = null;
        // TODO 添加onchange事件，在to属性修改时修改sphere[1]的材质
        for (var i = 0; i < eleIdList.length; i++) {
            spaceId = eleIdList[i].replace('space_id_', '');
            space = spacesDict[spaceId];
            optionsHtml += '<option value="' + space.id + '"' + (space.id == editingHotInfo.to ? ' selected="selected"' : '') + '>' + space.name + '</option>'
        }
        ui.$editPanel.find('select').html(optionsHtml);
        ui.$opacityInput.val(0.5);  // 透明度
        ui.$rotationXInput.val(editingHotInfo.rx);
        ui.$rotationYInput.val(editingHotInfo.ry);
        ui.$rotationZInput.val(editingHotInfo.rz);
        ui.$positionXInput.val(editingHotInfo.px);
        ui.$positionYInput.val(editingHotInfo.py);
        ui.$positionZInput.val(editingHotInfo.pz);
        transform = editingHotInfo;
        ui.$editPanel.addClass('show');  // 显示编辑面板
    }

    /**
     * 显示添加热点对话框
     * @param pos
     */
    var showAddingHotDialog = function (pos) {
        ui.$contextMenu.hide();
        panorama.addingHot = false;
        panorama.lockScene = true;
        var spacesDict = panorama.spacesDict;
        var eleIdList = ui.$spaceBar.sortable('toArray');
        var spaceId, optionsHtml = '';
        var space = null;
        for (var i = 0; i < eleIdList.length; i++) {
            spaceId = eleIdList[i].replace('space_id_', '');
            space = spacesDict[spaceId];
            optionsHtml += '<option value="' + space.id + '">' + space.name + '</option>'
        }
        ui.$addHotDialog.find('select').html(optionsHtml);
        ui.$addHotDialog.css({left: pos.x, top: pos.y}).show();
    };

    function animate() {
        panorama.update();  // 更新场景数据
        requestAnimationFrame(animate);
    }

    function bindUIListener() {

        /** ======================================  event  ====================================== **/

        var $pickHot_click = function () {
            $(this).toggleClass('active');
            if (!sceneId) {
                alert('请先保存场景后再添加热点！');
            } else {
                panorama.addingHot = !panorama.addingHot;
            }
        };

        var $transformHotBtn_click = function () {
            $(this).toggleClass('active');
            if (!sceneId) {
                alert('请先添加热点后再创建转场！');
            } else {
                if (panorama.editingHot) {
                    ui.$editPanel.removeClass('show');
                    panorama.editingHot = false;
                } else {
                    panorama.editingHot = true;
                }
            }
        };

        var $playBtn_click = function () {
            ui.$mask.fadeOut(500);
            ui.$playBtn.stop().fadeOut(500);
            panorama.play();
            return false;
        };


        ui.$playBtn.click($playBtn_click);

        // 侧边栏排序
        ui.$spaceBar.sortable({
            change: function () {
                saved = false;
            }
        });
        ui.$spaceBar.disableSelection();

        var tempSpaceDict = {};
        // 添加空间按钮
        ui.$showAddDialogBtn.click(function () {
            var listHtml = '';
            $.get('list_spaces', function (result) {
                if (!result.success) return false;
                tempSpaceDict = result['space_dict'];
                for (var key in tempSpaceDict) {
                    if (tempSpaceDict.hasOwnProperty(key)) {
                        var space = tempSpaceDict[key];
                        var checkedStr = panorama.spacesDict[key] ? 'checked="checked"' : '';
                        listHtml += '<div class="space">'
                            + '<div class="space-img">'
                            + '<input type="checkbox" data-spaceid="' + key + '" ' + checkedStr + '  /><img src="' + space['thumb_url'] + '">'
                            + '</div>'
                            + '<div class="space-name">' + space.name + '</div>'
                            + '<div class="space-time">创建时间 ' + space['create_time'] + '</div>'
                            + '</div>';
                    }
                }
                ui.$spacesContainer[0].innerHTML = listHtml;
                ui.$mask.show();
                ui.$addSpaceDialog.show();
            });
        });
        // 选择/取消空间
        var operate = {};
        ui.$spacesContainer.on('click', '.space-img', function (e) {
            e.stopPropagation();
            var $checkBox = $(this).find('input');
            var spaceId = $checkBox.data('spaceid');
            if (spaceId == panorama.spaceId) {
                alert('不能移除当前空间！');
                return false;
            }
            operate[spaceId] = !$checkBox.prop('checked');
            $checkBox.prop('checked', operate[spaceId]);
        });
        // 确定添加空间按钮
        ui.$addSpaceDialog.find('.dialog-confirm').click(function () {
                var operateLength = propLength(operate);
                var i = 0;
                for (var key in operate) {
                    if (operate.hasOwnProperty(key)) {
                        if (operate[key]) {
                            i++;
                            if (!panorama.spacesDict[key]) {  // 如果操作是true且列表中不存在则添加
                                var space = tempSpaceDict[key];
                                saved = false;
                                panorama.addSpace(space);
                                ui.$spaceBar.append('<li class="space-ele" id="space_id_' + key + '" data-index="' + key + '">' +
                                    '<div class="ele-pic"><img src="' + space['thumb_url'] + '"/></div>' +
                                    '<div class="ele-name"><input type="text" value=""/><span>' + space.name + '</span></div>' +
                                    '<div class="ele-ope"><div class="ele-ope-edit"></div><div class="ele-ope-del"></div></div>' +
                                    '</li>');
                                if (i == operateLength) {
                                    if (ui.$spaceBar.find('li').length > 1) {
                                        ui.$spaceBar.removeClass('no-del');
                                    }
                                    ui.$mask.hide();
                                    ui.$addSpaceDialog.hide();
                                }
                            } else {  // 已存在则跳过
                                if (i == operateLength) {
                                    if (ui.$spaceBar.find('li').length > 1) {
                                        ui.$spaceBar.removeClass('no-del');
                                    }
                                    ui.$mask.hide();
                                    ui.$addSpaceDialog.hide();
                                }
                            }
                        } else {  // false表示删除
                            i++;
                            if (panorama.spacesDict[key]) {  // 如果存在于列表中则删除
                                panorama.removeSpace(key);
                                $('#space_id_' + key).remove();
                                saved = false;
                            }
                            if (i == operateLength) {
                                if (ui.$spaceBar.find('li').length > 1) {
                                    ui.$spaceBar.removeClass('no-del');
                                }
                                ui.$mask.hide();
                                ui.$addSpaceDialog.hide();
                            }
                        }
                    }
                }
            }
        );
        // 关闭对话框
        $('.dialog-close, .dialog-cancel').click(function () {
            var $dialog = $(this).parent().parent();
            ui.$mask.hide();
            $dialog.hide();
        });
        // 删除空间
        ui.$spaceBar.on('click', '.ele-ope-del', function () {
            var $li = $(this).parent().parent();
            var spaceId = $li.data('index');
            if (spaceId == panorama.spaceId) {
                alert('无法删除当前空间！');
                return false;
            }
            panorama.removeSpace(spaceId);
            $li.remove();
            saved = false;
            if (propLength(panorama.spacesDict) <= 1) {
                ui.$spaceBar.addClass('no-del');
            }
            return false;
        });
        // 修改空间名称
        ui.$spaceBar.on('click', '.ele-ope-edit', function () {
            var $li = $(this).parent().parent();
            var $span = $li.find('span');
            var $input = $li.find('input');
            $span.hide();
            $input.val($span.html()).show().focus().select();
            return false;
        });
        // 回车修改空间名称
        ui.$spaceBar.on('keydown', 'input', function (e) {
            if (e.keyCode == 13) {
                var spaceName = $(this).val();
                panorama.spacesDict[$(this).parent().parent().data('index')].name = spaceName;
                $(this).next().html(spaceName).show();
                $(this).hide();
                saved = false;
            } else if (e.keyCode == 27) {
                $(this).val(panorama.spacesDict[$(this).parent().parent().data('index')].name);
                $(this).hide();
            }
        });

        // 侧边栏切换场景
        ui.$spaceBar.on('click', 'li', function () {
            panorama.showSpace($(this).data('index'));
        });

        ui.$spaceBar.on('blur', 'input', function () {
            var spaceName = this.value;
            var spaceId = $(this).parent().parent().data('index');
            if (panorama.spacesDict[spaceId].name != spaceName) {
                panorama.spacesDict[spaceId].name = spaceName;
                saved = false;
            }
            $(this).next().html(spaceName).show();
            $(this).hide();
        });

        // 点击页面保存修改
        ui.$body.click(function () {
            if (ui.$qrCode.is(':visible'))
                ui.$qrCode.animate({'opacity': 0, 'margin-top': '-40px'}, function () {
                    $(this).hide();
                });
            ui.$spaceBar.find('input:visible').blur();
        });
        ui.$spaceBar.on('click', 'input', function () {
            return false;
        });
        // 编辑商家信息窗口
        ui.$editInfo.click(function () {
            if (seller.logo) {
                document.getElementById('seller-logo').src = seller.logo;
                document.getElementById('dialog-img-ele').style.display = 'block';
            } else {
                document.getElementById('dialog-img-ele').style.display = 'none';
            }
            document.getElementById('seller-name').value = seller.name || '';
            document.getElementById('seller-desc').value = seller.desc || '';
            ui.$mask.show();
            ui.$editInfoDialog.show();
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
                    ui.$sellerLogo.attr("src", this.result);
                    document.getElementById('dialog-img-ele').style.display = 'block';
                }
            } else {
                alert("请选择图片格式！");
            }
        });
        // 编辑商家信息操作
        ui.$editInfoDialog.find('.dialog-confirm').click(function () {
            document.getElementById('seller_id').value = seller.id;
            ui.$editInfoDialog.find('form').submit();
        });
        // 更新场景数据or弹出标题对话框
        ui.$saveAs.click(function () {
            if (saved) {
                alert('未修改任何数据');
                return false;
            }
            if (sceneInfo && sceneInfo.title) {
                var spacesOfScene = [];
                var eleIdList = ui.$spaceBar.sortable('toArray');
                for (var i = 0; i < eleIdList.length; i++) {
                    var spaceId = eleIdList[i].replace('space_id_', '');
                    var space = panorama.spacesDict[spaceId];
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
                        entryId = ret.entry;
                        alert('保存成功');
                    } else {
                        alert('保存失败！');
                    }
                });
            } else {
                $('#scene-title').val('');
                ui.$mask.show();
                ui.$saveAsDialog.show();
            }
        });
        ui.$preview.click(function (e) {
            if (sceneInfo && sceneInfo.title) {
                if (ui.$qrCode.is(':hidden')) ui.$qrCode.show().animate({'opacity': 1, 'margin-top': '-20px'});
                e.stopPropagation();
            } else {
                alert('请先保存场景！');
            }
        });

        // 保存场景数据
        ui.$saveAsDialog.find('.dialog-confirm').click(function () {
            if (saved) {
                alert('未修改任何数据');
                ui.$mask.hide();
                ui.$saveAsDialog.hide();
                return false;
            }
            var spacesOfScene = [];
            var spaceIdList = ui.$spaceBar.sortable('toArray');
            for (var i = 0; i < spaceIdList.length; i++) {
                var spaceId = spaceIdList[i].replace('space_id_', '');
                var space = panorama.spacesDict[spaceId];
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
                    entryId = ret.entry;
                    saved = true;
                    alert('保存成功');
                    if (ret.scene_id) {
                        window.location.assign('edit?scene_id=' + ret.scene_id);
                    } else {
                        document.title = ret.title;
                        ui.$mask.hide();
                        ui.$saveAsDialog.hide();
                    }
                } else {
                    alert(ret['err_msg']);
                }
            });
        });

        // 隐藏右键菜单
        ui.$body.on('mousedown', function (e) {
            // add-hot按钮需要手动隐藏右键菜单
            if (e.target.id != 'add-hot') ui.$contextMenu.hide();
        });
        // 容器右键菜单
        $(sceneContainer).on('mousedown', function (e) {
            if (e.which == 3) {
                if (panorama.addingHot) {  // 结束选择热点
                    ui.$pickHot.removeClass('active');
                    panorama.addingHot = false;
                } else {
                    rClickedPos = {x: e.pageX, y: e.pageY};
                    ui.$contextMenu.css({left: e.pageX, top: e.pageY}).show();
                }
                // 如果标题是显示状态（即鼠标在热点上），不显示右键菜单
                if (ui.$hotTitle.is(':hidden')) e.stopPropagation();
            }
        });
        // 右键菜单中选择 添加热点
        ui.$showAddHotDialogBtn.click(function () {
            showAddingHotDialog({x: ui.$showAddHotDialogBtn.offset().left, y: ui.$showAddHotDialogBtn.offset().top});
        });
        // 确认添加热点
        ui.$addHotDialog.find('.add-btn').click(function () {
            var toSpaceId = ui.$addHotDialog.find('select').val();
            var title = $.trim(ui.$addHotDialog.find('input').val());
            if (toSpaceId == panorama.spaceId) {
                alert('不可与当前场景相同！');
                return false;
            }
            var hotPos = panorama.get3DPos(rClickedPos);
            $.post('add_hot', {
                scene_id: sceneId,
                space_id: panorama.spaceId,
                vx: hotPos.vx,
                vy: hotPos.vy,
                vz: hotPos.vz,
                title: title,
                to: toSpaceId
            }, function (data) {
                if (data.success) {
                    panorama.addHot(data.hotId, toSpaceId, hotPos, title);
                    ui.$addHotDialog.hide();
                    panorama.lockScene = false;
                }
            });
        });
        // 隐藏对话框
        ui.$addHotDialog.find('i').click(function () {
            ui.$addHotDialog.hide();
            panorama.lockScene = false;
        });

        ui.$addHotDialog.find('.redo-btn').click(function () {
            ui.$addHotDialog.hide();
            panorama.lockScene = false;
            panorama.addingHot = true;
            ui.$pickHot.addClass('active');
        });


        // 热点编辑面板
        ui.$hotToInput.change(function () {
            transform = panorama.applyTransform({to: this.value, opacity: 0.5});
            ui.$opacityInput.val(transform.opacity);
        });
        ui.$editPanel.find('.range input').on('input', function () {
            switch (true) {
                case this.id == 'input-opacity':
                    console.log(this.value);
                    transform = panorama.applyTransform({opacity: this.value});
                    break;
                case this.id == 'input-rotation-x':
                    transform = panorama.applyTransform({rx: this.value});
                    break;
                case this.id == 'input-rotation-y':
                    transform = panorama.applyTransform({ry: this.value});
                    break;
                case this.id == 'input-rotation-z':
                    transform = panorama.applyTransform({rz: this.value});
                    break;
                case this.id == 'input-position-x':
                    transform = panorama.applyTransform({px: this.value});
                    break;
                case this.id == 'input-position-y':
                    transform = panorama.applyTransform({py: this.value});
                    break;
                case this.id == 'input-position-z':
                    transform = panorama.applyTransform({pz: this.value});
                    break;
            }
        }).dblclick(function () {
            var _this = this;
            $(this).attr('step', window.prompt('请输入步长', _this.step) || _this.step);
        });

        $('.range>i').click(function () {
            var inputEle = $(this).parent().find('input')[0];
            var val = $(this).text() == '-' ? parseFloat(inputEle.value) - parseFloat(inputEle.step) : parseFloat(inputEle.value) + parseFloat(inputEle.step);
            switch (true) {
                case inputEle.id == 'input-opacity':
                    transform = panorama.applyTransform({opacity: parseFloat(val)});
                    inputEle.value = transform.opacity;
                    break;
                case inputEle.id == 'input-rotation-x':
                    transform = panorama.applyTransform({rx: parseFloat(val)});
                    inputEle.value = transform.rx;
                    break;
                case inputEle.id == 'input-rotation-y':
                    transform = panorama.applyTransform({ry: parseFloat(val)});
                    inputEle.value = transform.ry;
                    break;
                case inputEle.id == 'input-rotation-z':
                    transform = panorama.applyTransform({rz: parseFloat(val)});
                    inputEle.value = transform.rz;
                    break;
                case inputEle.id == 'input-position-x':
                    transform = panorama.applyTransform({px: parseFloat(val)});
                    inputEle.value = transform.px;
                    break;
                case inputEle.id == 'input-position-y':
                    transform = panorama.applyTransform({py: parseFloat(val)});
                    inputEle.value = transform.py;
                    break;
                case inputEle.id == 'input-position-z':
                    transform = panorama.applyTransform({pz: parseFloat(val)});
                    inputEle.value = transform.pz;
                    break;
            }
        });

        // 重置修改
        $('#reset-hot-info').click(function () {
            resetEditPanel(panorama.resetHot());
        });
        // 保存热点数据
        $('#save-hot-info').click(function () {
            var hotTitle = ui.$hotTitleInput.val();
            var hotTo = ui.$hotToInput.val();
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
                    panorama.saveHot(hotTo, hotTitle, transform);
                    ui.$editPanel.removeClass('show');
                    ui.$transformHotBtn.removeClass('active');
                }
            });

        });
        // 退出编辑
        $('#cancel-edit').click(function () {
            ui.$editPanel.removeClass('show');
            ui.$transformHotBtn.removeClass('active');
            panorama.editingHot = false;
        });
        // 删除热点
        $('#delete-hot-btn').click(function () {
            $.get('delete_hot', {
                id: editingHotInfo.id
            }, function (data) {
                if (data.success) {
                    panorama.deleteHot(editingHotInfo.id);
                    ui.$editPanel.removeClass('show');
                    ui.$transformHotBtn.removeClass('active');
                }
            });
        });


        /** ====================================== attach ====================================== **/

        // 禁止页面弹出右键菜单
        document.oncontextmenu = function () {
            return false;
        };

        ui.$pickHot.click($pickHot_click);

        ui.$transformHotBtn.click($transformHotBtn_click);

    }

    window.getResultStr = function (result) {
        if (result.success) {
            var s = result['seller'];
            s.name && (seller.name = s.name);
            s.logo && (seller.logo = s.logo);
            s.desc && (seller.desc = s.desc);
            if (seller.logo != logoUrl) {
                logoUrl = seller.logo;
                panorama.changeLogo(logoUrl);
            }
            ui.$mask.hide();
            ui.$editInfoDialog.hide();
            alert('操作成功！');
        } else {
            alert('操作修改！');
        }
    };

    // 监听窗口大小改变事件
    window.addEventListener('resize', function () {
        panorama.resize(window.innerWidth, window.innerHeight);
    }, false);

    ui.$editHotDialog.on("contextmenu", function () {
        return false;
    });

    /** ====================================== execute ====================================== **/

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
    if (seller.logo) {
        logoUrl = seller.logo;
        ui.$sellerLogo.attr('src', logoUrl);
    } else {
        logoUrl = '/media/seller-logo/logo.png';
        $('#dialog-img-ele').hide();
    }
    ui.$sellerName.val(seller.name || '');
    ui.$sellerDesc.val(seller.desc || '');

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

});