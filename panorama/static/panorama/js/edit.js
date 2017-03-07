/**
 * Created by ck on 2016/6/15.
 */

"use strict";
var maskLayer = new MaskLayer().show();
var progress = new Progress().start();
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
        $showAddHotDialogBtn: $('#show-add-hot-dialog-btn'),
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
        $addSpaceBtn: $('#add-space-btn'),
        $saveAsDialog: $('#save-as-dialog'),
        $editInfoDialog: $('#edit-seller-dialog'),
        $spacesContainer: $('#spaces-container'),
        $sellerLogo: $("#seller-logo"),
        $playBtn: $('#play-btn'),
        $editPanel: $('#edit-panel'),
        $cancelEditBtn: $('#cancel-edit'),  // 退出编辑按钮
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
        $positionZInput: $('#input-position-z'),
        $deleteHotBtn: $('#delete-hot-btn'),  // 删除热点按钮
        $saveHotBtn: $('#save-hot-info'),  // 保存热点按钮
        $resetHotBtn: $('#reset-hot-info')  // 重置修改按钮
    };

    /** ====================================== variable ====================================== **/

    var sceneInfo = ret['scene'];
    var seller = ret['seller'];
    var spaceList = ret['spaceList'];
    var hotImg = '/static/panorama/img/foot_step.png';
    var saved = true;
    var sceneContainer = null;
    var logoUrl = seller.logo || '/panorama/img/logo.png';
    var entryId = sceneInfo['entry'];

    var spacesDict = {};
    for (var i = 0; i < spaceList.length; i++) {
        spacesDict[spaceList[i].id] = spaceList[i];  // 空间集合
    }

    var maskTimer = null;  // 防止请求太快造成闪烁
    var rClickedPos = null;  // 右键点击的位置
    // var transform;
    var editingHotInfo;

    /** ====================================== function ====================================== **/

    // 首屏载入成功
    function onInit() {
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

        // 隐藏loading动画
        window.clearTimeout(maskTimer);
        progress.end();
        if (options.autoPlay) {
            maskLayer.hide(1000);
        } else {
            ui.$playBtn.fadeIn(1000);
        }
        sceneContainer = panorama.stage;
        bindUIListener();
        animate();
    }


    function onLoadStart() {
        maskTimer = window.setTimeout(function () {
            maskLayer.show();
            progress.start();
        }, 500);
    }

    function onLoading(num) {
        progress.update(num);
    }

    function onLoadEnd(spaceId) {
        window.clearTimeout(maskTimer);
        maskLayer.hide();
        progress.end();
        $('#space_id_' + spaceId).addClass('active').siblings('li').removeClass('active');
    }

    function onLoadFail(msg) {
        alert(msg);
        window.clearTimeout(maskTimer);
        maskLayer.hide();
        progress.end();
        /*var hotId = data.hotId;
         if (confirm('目标空间不存在，删除该无效热点？')) {
         $.get('delete_hot', {
         id: hotId
         }, function (data) {
         if (data.success) {
         panorama.deleteHot(hotId);
         ui.$hotTitle.hide();
         }
         });
         }*/
    }

    // 鼠标在热点上时
    function onOverHot(hotInfo, mousePos) {
        var hotTitle = hotInfo.title || '';
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
        showAddingHotDialog(rClickedPos);
    }

    // 选中热点进入编辑时的回调
    function onEditingHot(hotInfo) {
        editingHotInfo = hotInfo;
        ui.$hotIdInput.val(editingHotInfo.id);// 热点ID
        ui.$hotTitleInput.val(editingHotInfo.title);  // 热点标题
        var spacesDict = panorama.spacesDict;
        var eleIdList = ui.$spaceBar.sortable('toArray');
        var spaceId, optionsHtml = '';
        var space = null;
        for (var i = 0; i < eleIdList.length; i++) {
            spaceId = eleIdList[i].replace('space_id_', '');
            space = spacesDict[spaceId];
            optionsHtml += '<option value="' + space.id + '"' + (space.id == editingHotInfo.to ? ' selected="selected"' : '') + '>' + space.name + '</option>'
        }
        ui.$editPanel.find('select').html(optionsHtml);
        ui.$opacityInput.val(0.5);  // 透明度
        // ui.$rotationXInput.val(editingHotInfo.rx);
        // ui.$rotationYInput.val(editingHotInfo.ry);
        // ui.$rotationZInput.val(editingHotInfo.rz);
        ui.$positionXInput.val(editingHotInfo.px);
        ui.$positionYInput.val(editingHotInfo.py);
        ui.$positionZInput.val(editingHotInfo.pz);
        // transform = editingHotInfo;
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
        /** ====================================== execute ====================================== **/
        ui.$spaceBar.sortable().disableSelection();  // 文本不可被选中

        /** ======================================  event  ====================================== **/

        var $playBtn_click = function () {
            maskLayer.hide(500);
            ui.$playBtn.stop().fadeOut(500);
            panorama.play();
            return false;
        };

        var rightClickFlag = 0;
        var $body_mousedown = function () {
            rightClickFlag ? rightClickFlag = 0 : ui.$contextMenu.hide();
        };

        var $container_mousedown = function (e) {
            if (e.which == 3) {
                if (panorama.addingHot) {  // 结束选择热点
                    panorama.addingHot = false;
                } else if (ui.$hotTitle.is(':hidden')) {  // 若热点标题未显示状态（即鼠标不在热点上），则显示右键菜单
                    rClickedPos = {x: e.pageX, y: e.pageY};
                    ui.$contextMenu.css({left: e.pageX, top: e.pageY}).show();
                    rightClickFlag = 1;  // 标记需要弹出菜单
                }
            }
        };

        var $showAddHotDialogBtn_mousedown = function () {
            showAddingHotDialog({x: ui.$showAddHotDialogBtn.offset().left, y: ui.$showAddHotDialogBtn.offset().top});
        };

        var $spaceBar_sortchange = function () {
            saved = false;
        };

        var tempSpaceDict = {};
        var $showAddDialogBtn_click = function () {
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
                maskLayer.show();
                ui.$addSpaceDialog.show();
            });
        };

        var operate = {};
        var spaceImg_click = function () {
            var $checkBox = $(this).find('input');
            var spaceId = $checkBox.data('spaceid');
            if (spaceId == panorama.spaceId) {
                alert('不能移除当前空间！');
                return false;
            }
            operate[spaceId] = !$checkBox.prop('checked');
            $checkBox.prop('checked', operate[spaceId]);
        };

        var $addSpaceBtn_click = function () {
            var operateLength = propLength(operate);
            var i = 0;
            Object.keys(operate).forEach(function (key) {
                if (operate[key]) {
                    i++;
                    if (!panorama.spacesDict[key]) {  // 如果操作是true且列表中不存在则添加
                        var space = tempSpaceDict[key];
                        saved = false;
                        panorama.addSpace(space);
                        // 左侧列表增加
                        ui.$spaceBar.append('<li class="space-ele" id="space_id_' + key + '" data-index="' + key + '">' +
                            '<div class="ele-pic"><img src="' + space['thumb_url'] + '"/></div>' +
                            '<div class="ele-name"><input type="text" value=""/><span>' + space.name + '</span></div>' +
                            '<div class="ele-ope"><div class="ele-ope-edit"></div><div class="ele-ope-del"></div></div>' +
                            '</li>');
                        if (i == operateLength) {
                            if (ui.$spaceBar.find('li').length > 1) {
                                ui.$spaceBar.removeClass('no-del');
                            }
                            maskLayer.hide();
                            ui.$addSpaceDialog.hide();
                        }
                    } else {  // 已存在则跳过
                        if (i == operateLength) {
                            if (ui.$spaceBar.find('li').length > 1) {
                                ui.$spaceBar.removeClass('no-del');
                            }
                            maskLayer.hide();
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
                        maskLayer.hide();
                        ui.$addSpaceDialog.hide();
                    }
                }
            });
        };

        // 关闭对话框
        $('.dialog-close, .dialog-cancel').click(function () {
            var $dialog = $(this).parent().parent();
            maskLayer.hide();
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
            e.stopPropagation();
        });

        // 侧边栏切换场景
        ui.$spaceBar.on('click', 'li', function () {
            panorama.loadSpace($(this).data('index'));
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
            maskLayer.show();
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
                        entryId = ret['entry'];
                        alert('保存成功');
                    } else {
                        alert('保存失败！');
                    }
                });
            } else {
                $('#scene-title').val('');
                maskLayer.show();
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
                maskLayer.hide();
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
                    entryId = ret['entry'];
                    saved = true;
                    alert('保存成功');
                    if (ret.scene_id) {
                        window.location.assign('edit?scene_id=' + ret.scene_id);
                    } else {
                        document.title = ret.title;
                        maskLayer.hide();
                        ui.$saveAsDialog.hide();
                    }
                } else {
                    alert(ret['err_msg']);
                }
            });
        });

        // 确认添加热点
        ui.$addHotDialog.find('.add-btn').click(function () {
            var toSpaceId = ui.$addHotDialog.find('select').val();
            var title = $.trim(ui.$addHotDialog.find('input').val());
            if (!title) {
                alert('请输入标题');
                return false;
            }
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
        });


        // 热点编辑面板
        ui.$hotToInput.change(function () {
            console.log(this.value);
            if (this.value == panorama.spaceId) {
                alert('不能与当前空间相同！');
                return false;
            }
            panorama.changeToSpace(this.value);
        });
        ui.$editPanel.find('.range input').on('input', function () {
            console.log(this.value);
        }).dblclick(function () {
            var _this = this;
            $(this).attr('step', window.prompt('请输入步长', _this.step) || _this.step);
        });

        $('.range>i').click(function () {
            var inputEle = $(this).parent().find('input')[0];
            var val = $(this).text() == '-' ? parseFloat(inputEle.value) - parseFloat(inputEle.step) : parseFloat(inputEle.value) + parseFloat(inputEle.step);
            console.log(val);
        });

        ui.$resetHotBtn.click(function () {
            onEditingHot(panorama.resetHot());
        }).keydown(function (e) {
            e.preventDefault();
        });

        ui.$saveHotBtn.click(function () {
            var hotTitle = ui.$hotTitleInput.val();
            var hotTo = ui.$hotToInput.val();
            var transform = panorama.transformation;
            console.log(editingHotInfo);
            console.log(transform);
            if (transform) {
                $.post('update_hot', {
                    id: editingHotInfo.id,
                    title: hotTitle,
                    to: hotTo,
                    px: transform.px,
                    py: transform.py,
                    pz: transform.pz
                }, function (data) {
                    if (data.success) {
                        panorama.saveHot(hotTo, hotTitle);
                        ui.$editPanel.removeClass('show');
                    }
                });
            }
        }).keydown(function (e) {
            e.preventDefault();
        });

        ui.$cancelEditBtn.click(function () {
            ui.$editPanel.removeClass('show');
            panorama.editingHot = false;
        });

        ui.$deleteHotBtn.click(function () {
            $.get('delete_hot', {
                id: editingHotInfo.id
            }, function (data) {
                if (data.success) {
                    panorama.deleteHot(editingHotInfo.id);
                    ui.$editPanel.removeClass('show');
                }
            });
        }).keydown(function (e) {
            e.preventDefault();
        });


        /** ====================================== attach ====================================== **/

        document.oncontextmenu = function () {  // 禁止弹出系统右键菜单
            return false;
        };

        ui.$body.on('mousedown', $body_mousedown);  // 页面上按下鼠标隐藏自定义右键菜单

        $(sceneContainer).on('mousedown', $container_mousedown);  // 显示自定义右键菜单

        ui.$spaceBar.on("sortchange", $spaceBar_sortchange);  // 侧边栏顺序被修改

        ui.$playBtn.click($playBtn_click);  // 播放场景按钮

        ui.$showAddDialogBtn.click($showAddDialogBtn_click);  // 弹出添加空间对话框按钮

        ui.$spacesContainer.on('click', '.space-img', spaceImg_click);  // 选择/取消选择空间

        ui.$addSpaceBtn.click($addSpaceBtn_click);  // 添加空间按钮

        ui.$showAddHotDialogBtn.mousedown($showAddHotDialogBtn_mousedown);  // 显示添加热点对话框

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
            maskLayer.hide();
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

    var options = {
        // container: container,
        logoUrl: logoUrl,
        hotImg: hotImg,
        spacesDict: spacesDict,
        entryId: entryId,
        smoothStart: false,
        autoPlay: true,
        autoRotate: false,
        debug: true,
        fps: false,
        callbacks: {
            onInit: onInit,
            onLoadStart: onLoadStart,
            onLoading: onLoading,
            onLoadEnd: onLoadEnd,
            onLoadFail: onLoadFail,
            onAddingHot: onAddingHot,
            onOverHot: onOverHot,
            onLeaveHot: onLeaveHot,
            onEditingHot: onEditingHot
        }
    };
    var panorama = new Panorama(options);

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

});
