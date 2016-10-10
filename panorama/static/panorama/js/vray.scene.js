/**
 * Created by CK on 2016/8/26.
 */
;
var VRAY = {};
(function (window, document, $, undefined) {
    "use strict";

    var stats = null;
    var renderer, stereoRenderer, scene, camera, raycaster, orbitControls, deviceControls;
    var logoMesh, logoMaterial;
    var textureLoader;
    var spheres = [];
    var mousePos = new THREE.Vector2(0, 0);
    var sceneCenter = new THREE.Vector3(0, 0, 0);  // 场景原点
    var hotSpot;  // 热点（用于复制）
    var hotPos = null;  // 热点方向矢量
    var HOT_DISTANCE = 45;  // 热点距离球心的位置

    var startPoint1 = {x: 0, y: 0}, startPoint2 = {x: 0, y: 0};

    var _lockScene = true;  // 锁定场景
    var transiting = false,  // 正在进行过渡动画
        _addingHot = false;  // 正在添加热点

    var intersects = [];  // 鼠标与热点的交点
    var selectedHot = null;  // 鼠标按下的热点

    var showDelayer = null;  // 准线瞄准操作延迟计时器

    var ui = {
        $hotTitle: $('#hot-title')
    };

    var spaceHots = [];

    var _stereoMode = false, _walkMode = false, _stageWidth = window.innerWidth, _stageHeight = window.innerHeight;

    var spaceList = [];
    var _spacesDict = {};
    var callbacks = {
        /**
         * 首屏加载完毕
         */
        onLoad: function () {
        },
        /**
         * 下一个场景载入中
         */
        onShowing: function () {
        },
        /**
         * 场景切换完毕
         */
        onShown: function () {
        },
        /**
         * 添加热点时点击container的回调
         * @param clickedPos 点击的位置（相对于container）
         */
        onAddingHot: function (clickedPos) {
        },
        /**
         * 热点添加前
         * @param hotInfo 热点信息（vx,vy,vz,to,mesh）
         * @param success 添加成功的回调
         * @param fail
         */
        onHotAdd: function (hotInfo, success, fail) {
        }
    };

    var cameraFov = 75;

    // TODO 临时
    var $srcProcess = $('#src-process');
    VRAY.Scene = function (opt) {
        // 默认设置
        this.defaults = {
            container: document.body,
            devMode: false,
            smoothStart: false,
            autoPlay: false,
            autoRotate: true,
            logoUrl: null,
            hotImg: '/static/panorama/img/foot_step.png',
            fps: false
        };

        spaceList = opt.spaceList;
        this.options = $.extend({}, this.defaults, opt);
        $.extend(callbacks, this.options.callbacks);
        var entry = opt.entry || spaceList[0].id;
        // TODO 设置为只读属性
        this.spaceId = entry;
        this.spaceCount = spaceList.length;

        var i;
        for (i = 0; i < spaceList.length; i++) {
            _spacesDict[spaceList[i].id] = spaceList[i];
        }

        // 渲染器
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(_stageWidth, _stageHeight);
        renderer.sortObjects = false;
        renderer.setClearColor(0x000000);

        // 立体效果渲染器
        stereoRenderer = new THREE.StereoEffect(renderer);
        stereoRenderer.setSize(_stageWidth, _stageHeight);
        this.stage = renderer.domElement;
        this.stage.id = 'scene-canvas';
        // 设置样式
        this.stage.style.cursor = 'move';
        this.stage.style.zIndex = '1';
        this.stage.style.display = 'none';
        this.stage.style.position = 'absolute';
        this.stage.style.backgroundColor = '#000';
        this.options.container.appendChild(this.stage);

        textureLoader = new THREE.TextureLoader();

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(cameraFov, _stageWidth / _stageHeight, 0.1, 1000);
        raycaster = new THREE.Raycaster();

        this.materials = {};  // 材质集合

        _lockScene = true;  // 锁定场景（无法切换、拖动空间，添加、修改热点）

        var _this = this;

        ui.$hotTitle = $('<span id="hot-title">');
        $(document.body).append(ui.$hotTitle);

        // 热点添加指示
        hotSpot = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({
            map: textureLoader.load(_this.options.hotImg),
            transparent: true,
            side: THREE.DoubleSide,
            color: 0x000000,
            opacity: 0.3
        }));
        hotSpot.position.set(-30, 0, 0);
        hotSpot.lookAt(camera.position);
        hotSpot.visible = false;

        // 拉取静态资源
        var loadedSize = 0;
        for (i = 0; i < spaceList.length; i++) {
            var space = spaceList[i];
            (!space.hots) && (space.hots = {});
            // TODO 移除i
            (function (space, i) {
                // 先加载小图
                if (space.cache_url) {
                    textureLoader.load(space.cache_url, function (texture) {
                        texture.minFilter = texture.magFilter = THREE.LinearFilter;  // 避免image is not power of two的警告
                        loadedSize++;
                        _this.materials[space.id] = new THREE.MeshBasicMaterial({
                            map: texture,
                            transparent: true,
                            side: THREE.DoubleSide
                        });
                        $srcProcess.val('资源载入中(' + parseInt((i + 1) / _this.spaceCount * 100) + '%)');
                        // 再加载大图
                        textureLoader.load(space.url, function (texture) {
                            _this.materials[space.id] = new THREE.MeshBasicMaterial({
                                map: texture,
                                transparent: true,
                                side: THREE.DoubleSide
                            });
                            _this.spaceId == space.id && (spheres[0].material = spheres[1].material = _this.materials[_this.spaceId]);
                        });
                        if (space.id == entry) {
                            createScene();
                            callbacks.onLoad();
                        }
                    });
                } else {
                    // 直接加载大图
                    textureLoader.load(space.url, function (texture) {
                        loadedSize++;
                        _this.materials[space.id] = new THREE.MeshBasicMaterial({
                            map: texture,
                            transparent: true,
                            side: THREE.DoubleSide
                        });
                        if (space.id == entry) {
                            createScene();
                            callbacks.onLoad();
                        }
                    });
                }
            })(space, i);
        }

        if (_this.options.fps) {
            stats = new Stats();
            stats.dom.style.left = 'initial';
            stats.dom.style.right = 0;
            document.body.appendChild(stats.dom);
        }

        // 创建场景
        function createScene() {

            var tempMesh = new THREE.Mesh(new THREE.SphereGeometry(150, 80, 80), new THREE.MeshBasicMaterial({color: 0x000000}));
            tempMesh.scale.x = -1;
            tempMesh.position.set(0, 0, 0);
            tempMesh.rotation.set(0, 0, 0);
            tempMesh.needsUpdate = true;
            spheres.push(tempMesh);
            scene.add(tempMesh);
            tempMesh = new THREE.Mesh(new THREE.SphereGeometry(50, 80, 80), _this.materials[_this.spaceId]);
            tempMesh.scale.x = -1;
            tempMesh.position.set(0, 0, 0);
            tempMesh.needsUpdate = true;
            spheres.push(tempMesh);
            scene.add(tempMesh);
            scene.add(hotSpot);
            renderer.render(scene, camera);
            $(_this.stage).fadeIn(1500);

            if (_this.options.devMode) {
                spheres[0].material = spheres[1].material;
            }
            logoMaterial = new THREE.MeshBasicMaterial({
                map: textureLoader.load(_this.options.logoUrl),
                transparent: true,
                side: THREE.DoubleSide
            });
            logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), logoMaterial);
            logoMesh.position.set(0, -40, 0);
            logoMesh.scale.y = -1;
            logoMesh.lookAt(sceneCenter);
            spheres[1].add(logoMesh);

            _this.initHotSpots();
            spheres[0].material = spheres[1].material;

            _this.options.smoothStart ? smoothStart() : start();
            _this.options.autoPlay && _this.play();

        }

        // 进入场景（普通）
        var start = function () {
            camera.position.set(0.001, 0, 0);
            camera.fov = cameraFov;
            camera.lookAt(sceneCenter);
        };

        // 进入场景（平滑过渡）
        var smoothStart = function () {
            if (_this.options.autoRotate) spheres[1].rotation.y = -Math.PI / 2;  // 用于向右旋转球体
            spheres[1].rotation.set(0, 0, 0);
            camera.position.set(0, 20, 0);
            camera.fov = 160;
            camera.rotation.x = -Math.PI / 1.6;
            camera.updateProjectionMatrix();
        };
    };

    /**
     * 开始播放场景
     */
    VRAY.Scene.prototype.play = function () {

        var _this = this;
        if (_this.options.smoothStart) {
            new TWEEN.Tween({fov: camera.fov, positionY: 20})
                .to({fov: cameraFov, positionY: 0.01}, 2500)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function () {
                    camera.fov = this.fov;
                    camera.position.y = this.positionY;
                    camera.updateProjectionMatrix();
                }).start();
            new TWEEN.Tween({rotateX: -Math.PI / 1.6})
                .to({rotateX: 0}, 3000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function () {
                    camera.rotation.x = this.rotateX;
                }).onComplete(function () {
                camera.position.set(0, 0, 0.001);
                _lockScene = false;
                initControls();
            }).delay(300).start();

            if (_this.options.autoRotate) {  // 如果需要在平滑进入时自动旋转
                new TWEEN.Tween({rotateY: -Math.PI / 2})
                    .to({rotateY: 0}, 3000)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(function () {
                        spheres[1].rotation.y = this.rotateY;
                    }).delay(300)
                    .start();
            }
        } else {
            _lockScene = false;
            initControls();
        }

        function initControls() {
            orbitControls = new THREE.OrbitControls(camera, _this.stage);
            orbitControls.autoRotateSpeed = 0.07;
            orbitControls.enableRotate = true;
            orbitControls.enableDamping = true;
            orbitControls.dampingFactor = 0.1;
            orbitControls.rotateSpeed = fromPC() ? 0.07 : 0.04;
            orbitControls.enableZoom = false;
            orbitControls.enableKeys = false;
            orbitControls.enablePan = false;
            orbitControls.autoRotate = _this.options.autoRotate;
            // 初始化设备控制器
            deviceControls = new THREE.DeviceOrientationControls(camera, true);
            deviceControls.connect();
            deviceControls.enabled = false;

            var $canvas = $(_this.stage);
            // 鼠标事件
            $canvas.on('mousemove', mouseMove.bind(_this));
            $canvas.on('click', mouseClick.bind(_this));
            $canvas.on('DOMMouseScroll mousewheel', mouseWheel.bind(_this));
            // 触摸事件
            $canvas.on('touchstart', touchStart.bind(_this));
            $canvas.on('touchmove', touchMove.bind(_this));
            $canvas.on('touchend', touchEnd.bind(_this));
        }
    };

    /**
     * 切换场景
     * @param point
     * @returns {boolean}
     */
    VRAY.Scene.prototype.showSpace = function (point) {
        if (_lockScene || transiting) return false;
        var spaceHot = typeof(point.hotId) == "undefined" ? null : _spacesDict[this.spaceId].hots[point.hotId];
        var targetSpaceId = spaceHot ? spaceHot.to : point.to;
        if (this.spaceId == targetSpaceId) {
            return false;
        }
        var animateTime = 800;
        var timer = null;
        var _this = this;
        if (!this.materials[targetSpaceId]) {
            callbacks.onShowing();
            (function (point) {
                timer = window.setInterval(function () {
                    if (_this.materials[targetSpaceId]) {
                        window.clearInterval(timer);
                        timer = null;
                        _this.showSpace(point);
                    }
                }, 100);
            })(point);
            return false;
        }
        if (this.materials[targetSpaceId].disabled) {
            console.log('no space ' + targetSpaceId);
            return false;
        }
        transiting = true;
        var lastSpaceId = this.spaceId;
        this.spaceId = targetSpaceId;

        // 先删除小球上的热点
        var hots = _spacesDict[lastSpaceId].hots;
        if (hots) {
            Object.keys(hots).forEach(function (k) {
                spheres[1].remove(hots[k].mesh);
                delete hots[k].mesh;// mesh会每次重新生成
            });
        }
        console.log('from：' + lastSpaceId + ' → to：' + targetSpaceId);

        if (this.options.devMode) {
            spheres[0].material = spheres[1].material;
        }
        callbacks.onShown(targetSpaceId);
        this.materials[targetSpaceId].opacity = 0;
        spheres[1].material = this.materials[targetSpaceId];  //修改小球材质

        if (spaceHot && (spaceHot.px || spaceHot.py || spaceHot.pz || spaceHot.rx || spaceHot.ry || spaceHot.rz)) {
            logoMesh.visible = false;
            // 大球移近
            var tween0 = new TWEEN.Tween({
                px: 0,
                py: 0,
                pz: 0,
                rx: 0,
                ry: 0,
                rz: 0
            }).to(spaceHot, animateTime)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function () {
                    spheres[0].position.set(this.px, this.py, this.pz);
                    spheres[0].rotation.set(this.rx, this.ry, this.rz);
                });
            // 小球移近
            var tween1_1 = new TWEEN.Tween({
                px: -spaceHot.px,
                py: -spaceHot.py,
                pz: -spaceHot.pz,
                rx: -spaceHot.rx,
                ry: -spaceHot.ry,
                rz: -spaceHot.rz
            }).to({px: 0, py: 0, pz: 0, rx: 0, ry: 0, rz: 0}, animateTime)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function () {
                    spheres[1].position.set(this.px, this.py, this.pz);
                    spheres[1].rotation.set(this.rx, this.ry, this.rz);
                });
            // 小球opacity增加
            var tween1_2 = new TWEEN.Tween({opacity: 0})
                .to({opacity: 1}, animateTime)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function () {
                    spheres[1].material.opacity = this.opacity;
                }).onComplete(function () {
                    spheres[0].position.set(0, 0, 0);
                    spheres[0].rotation.set(0, 0, 0);
                    if (!_this.options.devMode) {
                        spheres[0].material = spheres[1].material;//大球复制小球材质
                    }
                    logoMesh.visible = true;
                    _this.initHotSpots();
                    transiting = false;
                });
            tween0.start();
            tween1_1.start();
            tween1_2.delay(animateTime * 2 / 3).start();
        } else {
            new TWEEN.Tween({opacity: 0})
                .to({opacity: 1}, animateTime)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(function () {
                    spheres[1].material.opacity = this.opacity;
                }).onComplete(function () {
                spheres[0].position.set(0, 0, 0);
                spheres[1].position.set(0, 0, 0);
                if (!_this.options.devMode) {
                    spheres[0].material = spheres[1].material;  //大球复制小球材质
                }
                logoMesh.visible = true;
                _this.initHotSpots();
                transiting = false;
            }).start();
        }
    };

    /**
     * 添加新空间
     * @param space
     */
    VRAY.Scene.prototype.addSpace = function (space) {
        var _this = this;
        if (!_spacesDict[space.id]) {
            _spacesDict[space.id] = space;
            textureLoader.load(space.url, function (texture) {
                _this.materials[space.id] = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    side: THREE.DoubleSide
                });
                _this.materials[space.id].disabled = false;
            });
            this.spaceCount++;
        } else {
            _this.materials[space.id].disabled = false;
        }
    };

    /**
     * 移除空间
     * @param spaceId
     */
    VRAY.Scene.prototype.removeSpace = function (spaceId) {
        if (_spacesDict[spaceId]) {
            delete _spacesDict[spaceId];
            this.materials[spaceId].disabled = true;
            this.spaceCount--;
        }
    };

    /**
     * 初始化/收集热点
     * @param onlyGather 是否仅收集热点
     */
    VRAY.Scene.prototype.initHotSpots = function (onlyGather) {
        var targetSpace = _spacesDict[this.spaceId];
        spaceHots = [];
        targetSpace.hots || (targetSpace.hots = {});
        Object.keys(targetSpace.hots).forEach(function (k) {
            var hot = targetSpace.hots[k];
            if (onlyGather) {  // 仅收集当前空间中的热点用于拾取
                spaceHots.push(hot.mesh);
            } else {  // 初始化当前空间的热点
                var hotRay = hot.ray;
                if (!hotRay) {
                    hotRay = new THREE.Raycaster();
                    hotRay.set(sceneCenter, new THREE.Vector3(hot.vx, hot.vy, hot.vz));
                    hot.ray = hotRay;
                }
                var tempIntersects = hotRay.intersectObjects([spheres[1]]);
                if (tempIntersects.length > 0) {
                    var tempHotSpot = hotSpot.clone();
                    tempHotSpot.visible = true;
                    tempHotSpot.material = hotSpot.material.clone();
                    hotPos = tempIntersects[0].point.clone();
                    hotPos.setLength(HOT_DISTANCE);
                    tempHotSpot.position.set(
                        -hotPos.x,
                        hotPos.y,
                        hotPos.z
                    );
                    tempHotSpot.hotId = k;
                    tempHotSpot.title = hot.title;
                    tempHotSpot.lookAt(camera.position);
                    spheres[1].add(tempHotSpot);
                    hot.mesh = tempHotSpot;
                    spaceHots.push(hot.mesh);
                }
            }
        });
    };

    /**
     * 添加热点
     * @param to
     * @param pos 鼠标 “相对容器” 的位置格式：{x: 1, y: 1}
     * @param title
     */
    VRAY.Scene.prototype.addHot = function (to, pos, title) {
        if (to == this.spaceId) {
            console.error('不可与当前场景相同');
            return false;
        }
        var _this = this;

        var newRay, newHotPos, newHotSpot, hotInfo;
        var addSuccess = function (hotId) {
            spheres[1].add(newHotSpot);
            // 本地记录热点数据
            _spacesDict[_this.spaceId].hots[hotId] = hotInfo;
            newHotSpot.title = hotInfo.title;
            console.log('"vx":' + hotInfo.vx + ',"vy":' + hotInfo.vy + ',"vz":' + hotInfo.vz + ',');
            // 重新收集当前空间的热点
            _this.initHotSpots(true);
        };

        var addFail = function (err) {
            console.error('添加失败' + (err && ':' + err));
        };

        if (pos) {
            // 根据鼠标位置创建射线
            pos.x = (pos.x / _stageWidth) * 2 - 1;
            pos.y = -(pos.y / _stageHeight) * 2 + 1;
            newRay = new THREE.Raycaster();
            newRay.setFromCamera(pos, camera);

            // 通过射线与小球的交点获取新热点的位置
            newHotPos = newRay.intersectObjects([spheres[1]])[0].point;
            newHotPos.setLength(HOT_DISTANCE);
            // 拷贝热点及其材料信息
            newHotSpot = hotSpot.clone();
            newHotSpot.material = hotSpot.material.clone();
            // 设置热点位置
            newHotSpot.position.set(
                -newHotPos.x,
                newHotPos.y,
                newHotPos.z
            );
            // 设置面向球心
            newHotSpot.lookAt(sceneCenter);
            newHotSpot.to = to;
            newHotSpot.visible = true;
            hotInfo = {
                vx: newHotPos.x.toFixed(4),
                vy: newHotPos.y.toFixed(4),
                vz: newHotPos.z.toFixed(4),
                to: to,
                title: title,
                mesh: newHotSpot
            };
            callbacks.onHotAdd(hotInfo, addSuccess, addFail);
        } else {  // 若未传入鼠标位置，则使用最近记录下的热点位置
            if (hotPos) {
                // 根据方向矢量创建射线
                newHotSpot = hotSpot.clone();
                newHotSpot.material = hotSpot.material.clone();
                hotPos.setLength(HOT_DISTANCE);
                newHotSpot.position.set(
                    -hotPos.x,
                    hotPos.y,
                    hotPos.z
                );
                newHotSpot.lookAt(sceneCenter);
                newHotSpot.to = to;
                newHotSpot.visible = true;
                hotInfo = {
                    vx: hotPos.x.toFixed(4),
                    vy: hotPos.y.toFixed(4),
                    vz: hotPos.z.toFixed(4),
                    to: to,
                    title: title,
                    mesh: newHotSpot
                };
                callbacks.onHotAdd(hotInfo, addSuccess, addFail);
            } else {
                console.error('无法创建热点');
            }
        }

    };

    VRAY.Scene.prototype.changeLogo = function (logoUrl) {
        logoMesh.material = new THREE.MeshBasicMaterial({
            map: textureLoader.load(logoUrl),
            transparent: true,
            side: THREE.DoubleSide
        });
    };

    /**
     * 容器宽高改变时应该调用的方法
     * @param stageWidth
     * @param stageHeight
     */
    VRAY.Scene.prototype.resize = function (stageWidth, stageHeight) {
        _stageWidth = stageWidth;
        _stageHeight = stageHeight;
        renderer.setSize(_stageWidth, _stageHeight);
        camera.aspect = _stageWidth / _stageHeight;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
    };

    var mouseMove = function ($e) {
        if (!_lockScene && $e.which != 3) {
            (parseInt(startPoint1.x) != parseInt($e.pageX) || parseInt(startPoint1.y) != parseInt($e.pageY)) && (orbitControls.autoRotate = false);
            if (_addingHot) {  // 开始添加热点
                raycaster.setFromCamera(mousePos, camera);
                intersects = raycaster.intersectObjects([spheres[1]]);
                if (intersects.length > 0) {
                    hotPos = intersects[0].point.clone();
                    hotPos.setLength(40);
                    hotSpot.position.set(
                        hotPos.x,
                        hotPos.y,
                        hotPos.z
                    );
                    hotSpot.lookAt(sceneCenter);
                }
            } else if (spaceHots.length > 0) {  // 高亮hover的热点
                raycaster.setFromCamera(mousePos, camera);
                intersects = raycaster.intersectObjects(spaceHots);
                // 全部热点置为默认颜色
                for (var k = 0; k < spaceHots.length; k++) {
                    spaceHots[k].material.color.set(0x000000);
                }
                // 高亮选中的热点
                if (intersects.length > 0) {
                    selectedHot = intersects[0].object;
                    selectedHot.material.color.set(0xffffff);
                    // 使用准星进行热点跳转
                    if ((_stereoMode || _walkMode) && !showDelayer) {
                        showDelayer = setTimeout(function () {
                            ui.$hotTitle.hide();
                            this.showSpace(selectedHot);
                            clearTimeout(showDelayer);
                            showDelayer = null;
                        }, 1000);
                    }
                } else {
                    clearTimeout(showDelayer);
                    showDelayer = null;
                }

                if (!transiting && intersects.length > 0) {
                    if (selectedHot.title) {
                        ui.$hotTitle.html(selectedHot.title).css({
                            left: $e.pageX - ui.$hotTitle.width() - 20,
                            top: $e.pageY - 25 / 2
                        }).show();
                    }
                } else {
                    ui.$hotTitle.hide();
                }
            }

            mousePos.x = ($e.pageX / _stageWidth) * 2 - 1;
            mousePos.y = -($e.pageY / _stageHeight) * 2 + 1;
        }
    };

    var mouseClick = function ($e) {
        if (!_lockScene) {
            if (_addingHot) {  // 添加脚印
                callbacks.onAddingHot({x: $e.pageX, y: $e.pageY});
            } else {
                if (intersects.length > 0) {  // 单击热点
                    if ($e.which == 3) {  // 热点上右击
                        // TODO 执行回调，传入参数（点击的位置，热点的位置——vx,vy,vz）
                        // orbitControls.enabled = false;
                        // targetStep = selectIntersection.object;
                        // animating = false;
                        // selectIntersection = null;  // 防止出现热点描述
                        // var targetHot = _spacesDict[spaceId].hots[targetStep.hotId];
                        // $editHotDialog.find('select').val(targetHot.to);
                        // $editHotDialog.find('input').val(targetHot.title);
                        // if (e.changedTouches && e.changedTouches.length > 0) {
                        //     $editHotDialog.css({
                        //         left: e.changedTouches[0].clientX - $editHotDialog._stageWidth() / 2,
                        //         top: e.changedTouches[0].clientY - $editHotDialog._stageHeight() / 2
                        //     })
                        // } else {
                        //     $editHotDialog.css({
                        //         left: e.clientX - $editHotDialog._stageWidth() / 2,
                        //         top: e.clientY - $editHotDialog._stageHeight() / 2
                        //     })
                        // }
                        // $editHotDialog.show();
                    } else {  // 热点上左击
                        this.showSpace(selectedHot);
                        ui.$hotTitle.hide();
                    }
                } else if (spaceHots.length > 0) {  // 点击空白处
                    // if (event.which == 3) {  // 右击弹出右键菜单
                    //
                    // }
                    // hoverPoint = raycaster.intersectObjects([spheres[1]]);
                    // if (e.button != '2' && hoverPoint && hoverPoint.length > 0) {
                    //     var step = spaceHots[0];
                    //     var point = hoverPoint[0].point;
                    //     var vector = new THREE.Vector3(-point.x, point.y, point.z).setLength(30);
                    //     var distance = vector.distanceTo(step.position);
                    //     console.log(step.hotId + ':' + distance);
                    //     var minPoint = [step, distance];
                    //     // 选取最近的脚印
                    //     for (j = 1; j < spaceHots.length; j++) {
                    //         step = spaceHots[j];
                    //         distance = vector.distanceTo(step.position);
                    //         if (distance < minPoint[1]) minPoint = [step, distance];
                    //     }
                    //     this.showSpace(minPoint[0]);
                    // }
                }
            }
        }
    };

    var mouseWheel = function ($e) {
        if (!_lockScene) {
            var e = $e.originalEvent;
            var fovDelta;
            if (e.wheelDelta) {  // IE、Opera、Chrome
                fovDelta = e.wheelDelta > 0 ? 1 : -1;
            } else if (e.detail) {  // Firefox
                fovDelta = e.detail > 0 ? 1 : -1;
            }
            if ((fovDelta > 0 && camera.fov < 110) || (fovDelta < 0 && camera.fov > 40)) {
                camera.fov += fovDelta;
                orbitControls.rotateSpeed = camera.fov > 75 ? 0.07 : camera.fov / 75 * 0.07;
                camera.updateProjectionMatrix();
            }
        }
    };

    var clicking = false;  // 是否点击了canvas
    var touchStart = function ($e) {
        if (!_lockScene) {
            clicking = true;
            var e = $e.originalEvent;
            if (e.touches) {
                startPoint1.x = e.touches[0].clientX;
                startPoint1.y = e.touches[0].clientY;
                if (e.touches.length > 1) {  // 双指触碰
                    startPoint2.x = e.touches[1].clientX;
                    startPoint2.y = e.touches[1].clientY;
                }
            }
        }
    };

    // TODO 回弹效果
    var touchMove = function ($e) {
        if (!_lockScene) {
            var e = $e.originalEvent;
            if (e.touches) {  // 触摸操作
                var touch0X = e.touches[0].clientX;
                var touch0Y = e.touches[0].clientY;
                if (clicking && (parseInt(startPoint1.x) != parseInt(touch0X) || parseInt(startPoint1.y) != parseInt(touch0Y))) {
                    // 标为移动操作
                    clicking = false;
                    orbitControls.autoRotate = false;
                }
                if (e.touches.length > 1) {  // 如果是双指操作
                    var lastDistance = Math.sqrt(Math.pow(startPoint2.x - startPoint1.x, 2) + Math.pow(startPoint2.y - startPoint1.y, 2));
                    var currentDistance = Math.sqrt(Math.pow(e.touches[1].clientX - touch0X, 2) + Math.pow(e.touches[1].clientY - touch0Y, 2));
                    camera.fov = cameraFov + (lastDistance - currentDistance ) / 5;
                    camera.fov = camera.fov > 110 ? 110 : camera.fov < 40 ? 40 : camera.fov;
                    orbitControls.rotateSpeed = camera.fov > 75 ? 0.04 : camera.fov / 75 * 0.04;
                    camera.updateProjectionMatrix();
                }
            }
        }
    };
    var touchEnd = function ($e) {
        if (!_lockScene && !_addingHot && clicking) {
            if (spaceHots.length > 0) {
                var e = $e.originalEvent;
                if (e.changedTouches && e.changedTouches.length > 0) {
                    mousePos.x = (e.changedTouches[0].clientX / _stageWidth) * 2 - 1;
                    mousePos.y = -(e.changedTouches[0].clientY / _stageHeight) * 2 + 1;
                    raycaster.setFromCamera(mousePos, camera);
                    intersects = raycaster.intersectObjects(spaceHots);
                    if (intersects.length > 0) {// 触击热点
                        this.showSpace(intersects[0].object);
                        ui.$hotTitle.hide();
                    } else if (spaceHots.length > 0) {  // 触击空白处
                        alert('触击空白处');
                    }
                }

            }
        }
        cameraFov = camera.fov;
    };

    // TODO 使用准星进行热点跳转功能

    // 定义spacesDict属性（只读）
    Object.defineProperty(VRAY.Scene.prototype, "spacesDict", {
        get: function () {
            return _spacesDict;
        }
    });

    // 定义stereoMode属性
    Object.defineProperty(VRAY.Scene.prototype, "stereoMode", {
        set: function (val) {
            _stereoMode = !!val;
            if (_stereoMode) {
                raycaster.set(sceneCenter, camera.getWorldDirection());
                stereoRenderer.setSize(_stageWidth, _stageHeight);
            } else {
                raycaster.setFromCamera(mousePos, camera);
                renderer.setSize(_stageWidth, _stageHeight);
            }
        },
        get: function () {
            return _stereoMode;
        }
    });

    // 定义walkMode属性
    Object.defineProperty(VRAY.Scene.prototype, "walkMode", {
        set: function (val) {
            _walkMode = !!val;

            if (_walkMode) {
                deviceControls.enabled = true;  // 启用方向感应控制器
                orbitControls.enabled = false;  // 禁用轨道控制器
                raycaster.set(sceneCenter, camera.getWorldDirection());
            } else {
                deviceControls.enabled = false;
                orbitControls.enabled = true;
                raycaster.setFromCamera(mousePos, camera);
            }
        },
        get: function () {
            return _walkMode;
        }
    });

    // 定义addingHot属性
    Object.defineProperty(VRAY.Scene.prototype, "addingHot", {
        set: function (val) {
            _addingHot = hotSpot.visible = !!val;
        },
        get: function () {
            return _addingHot;
        }
    });

    // 定义lockScene属性
    Object.defineProperty(VRAY.Scene.prototype, "lockScene", {
        set: function (val) {
            _lockScene = !!val;
            orbitControls.enableRotate = !val;
        },
        get: function () {
            return _lockScene;
        }
    });

    VRAY.Scene.prototype.update = function () {
        TWEEN.update();
        if (orbitControls) orbitControls.update();
        if (deviceControls) deviceControls.update();
        stats && stats.update();
        if (_stereoMode) {
            stereoRenderer.render(scene, camera);
        } else {
            renderer.render(scene, camera);
        }
    };


})(window, document, jQuery);
