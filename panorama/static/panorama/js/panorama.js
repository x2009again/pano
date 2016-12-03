/**
 * Created by CK on 2016/8/26.
 */
;
/** @namespace e.touches */
/** @namespace e.changedTouches */
/** @namespace space.cache_url */
// TODO 移除所有jquery依赖
// TODO 焦点在input上时阻止键盘旋转
(function (window, document, $, undefined) {
    "use strict";

    var stats = null;
    var renderer, stereoRenderer, scene, camera, raycaster, orbitControls, deviceControls;
    var logoMesh, logoMaterial;
    var textureLoader, imageLoader;
    var spheres = [];
    var mousePos = new THREE.Vector2(0, 0);
    var sceneCenter = new THREE.Vector3(0, 0, 0);  // 场景原点
    var hotSpot;  // 热点（用于复制）
    var hotSpotMat;  // 热点材质
    var hotPos = null;  // 热点方向矢量
    var HOT_DISTANCE = 45;  // 热点距离球心的位置

    var startPoint1 = {x: 0, y: 0}, startPoint2 = {x: 0, y: 0};

    var intersects = [];  // 鼠标与热点的交点
    var selectedHot = null;  // 鼠标按下的热点
    var hot2beEdit = null;

    var hotLeaved = true;
    var currentSpace = null;

    var cameraFov = 75;

    var STAGE_WIDTH = window.innerWidth,
        STAGE_HEIGHT = window.innerHeight,
        spaceHots = [],
        materialDict = {},  // 材质集合
        transiting = false;  // 正在进行过渡动画

    var renderOver = null;

    // 可访问变量
    var _stage = null,  // canvas容器
        _stereoMode = false,  // 立体模式（只读）
        _walkMode = false,  // 步行模式（只读）
        _spacesDict = {},  // 空间字典（只读）
        _lockScene = true,  // 锁定场景
        _addingHot = false,  // 正在添加热点
        _editingHot = false;  // 正在创建转场效果

    var options = {};
    var callbacks = {
        /**
         * 首屏加载完毕
         */
        onLoad: function () {
        },
        /**
         * 相机方向变化事件
         * @param cameraDirection 相机朝向
         */
        onCameraChanged: function (cameraDirection) {
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
         * 选择器在热点上移动时
         * @param hotInfo
         * @param mousePos 鼠标相对于容器的位置
         */
        onOverHot: function (hotInfo, mousePos) {
        },
        /**
         * 选择器离开热点时
         */
        onLeaveHot: function () {
        },
        /**
         * 添加热点时点击container的回调
         * @param clickedPos 点击的位置（相对于container）
         */
        onAddingHot: function (clickedPos) {
        },
        /**
         * 编辑热点转场时的回调
         * @param hotInfo 热点信息
         */
        onEditingHot: function (hotInfo) {
        }
    };

    var Panorama = function (opt) {
        // 默认设置
        var defaults = {
            container: document.body,
            smoothStart: false,
            autoPlay: false,
            autoRotate: true,
            logoUrl: null,
            hotImg: null,
            debug: false,
            fps: false
        };

        _spacesDict = opt.spacesDict;
        Object.assign(options, defaults, opt);
        Object.assign(callbacks, opt.callbacks);
        var entryId = opt.entryId;

        // 渲染器
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(STAGE_WIDTH, STAGE_HEIGHT);
        renderer.sortObjects = false;
        renderer.setClearColor(0x000000);

        // 立体效果渲染器
        stereoRenderer = new THREE.StereoEffect(renderer);
        stereoRenderer.setSize(STAGE_WIDTH, STAGE_HEIGHT);
        _stage = renderer.domElement;
        _stage.id = 'scene-canvas';
        options.container.appendChild(_stage);
        textureLoader = new THREE.TextureLoader();
        imageLoader = new THREE.ImageLoader();
        imageLoader.setCrossOrigin('anonymous');


        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(cameraFov, STAGE_WIDTH / STAGE_HEIGHT, 0.1, 1000);
        raycaster = new THREE.Raycaster();

        _lockScene = true;  // 锁定场景（无法切换、拖动空间，添加、修改热点）

        var scope = this;

        hotSpotMat = new THREE.MeshBasicMaterial({
            map: textureLoader.load(options.hotImg),
            transparent: true,
            side: THREE.DoubleSide,
            color: 0x000000,
            opacity: 0.3
        });

        // 拉取静态资源
        var entrySpace = _spacesDict[entryId];
        // 初始化热点信息
        var hotInfoDict = entrySpace.hotInfoDict;
        !hotInfoDict && (hotInfoDict = {});
        Object.keys(hotInfoDict).forEach(function (h_key) {
            var hotInfo = hotInfoDict[h_key];
            hotInfo.rx || (hotInfo.rx = 0);
            hotInfo.ry || (hotInfo.ry = 0);
            hotInfo.rz || (hotInfo.rz = 0);
            hotInfo.px || (hotInfo.px = 0);
            hotInfo.py || (hotInfo.py = 0);
            hotInfo.pz || (hotInfo.pz = 0);
        });
        loadSpace(entrySpace, function (space) {
            currentSpace = space;
            createScene();
            callbacks.onLoad();
            // 加载其他场景
            Object.keys(_spacesDict).forEach(function (s_key) {
                if (s_key == entryId) return false;
                var space = _spacesDict[s_key];
                var hotInfoDict = space.hotInfoDict;
                !hotInfoDict && (hotInfoDict = {});
                Object.keys(hotInfoDict).forEach(function (h_key) {
                    var hotInfo = hotInfoDict[h_key];
                    hotInfo.rx || (hotInfo.rx = 0);
                    hotInfo.ry || (hotInfo.ry = 0);
                    hotInfo.rz || (hotInfo.rz = 0);
                    hotInfo.px || (hotInfo.px = 0);
                    hotInfo.py || (hotInfo.py = 0);
                    hotInfo.pz || (hotInfo.pz = 0);
                });
                loadSpace(space);
            });
        });

        if (options.fps) {
            stats = new Stats();
            stats.dom.style.left = 'initial';
            stats.dom.style.right = 0;
            document.body.appendChild(stats.dom);
        }

        function loadSpace(space, onLoaded) {
            // 先加载小图
            if (space.cache_url) {
                textureLoader.load(space.cache_url, function (texture) {
                    texture.minFilter = texture.magFilter = THREE.LinearFilter;  // 避免image is not power of two的警告
                    materialDict[space.id] = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        side: THREE.DoubleSide
                    });
                    onLoaded && onLoaded(space);
                    // 再加载大图
                    textureLoader.load(space.url, function (texture) {
                        materialDict[space.id] = new THREE.MeshBasicMaterial({
                            map: texture,
                            transparent: true,
                            side: THREE.DoubleSide
                        });
                        currentSpace.id == space.id && !transiting && (spheres[1].material = materialDict[currentSpace.id]);
                    });
                });
            } else {
                // 直接加载大图
                textureLoader.load(space.url, function (texture) {
                    materialDict[space.id] = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        side: THREE.DoubleSide
                    });
                    onLoaded && onLoaded(space);
                });
            }
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
            tempMesh = new THREE.Mesh(new THREE.SphereGeometry(50, 80, 80), materialDict[currentSpace.id]);
            tempMesh.scale.x = -1;
            tempMesh.position.set(0, 0, 0);
            tempMesh.needsUpdate = true;
            spheres.push(tempMesh);
            scene.add(tempMesh);

            // 热点添加指示
            hotSpot = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), hotSpotMat);
            hotSpot.position.set(-30, 0, 0);
            hotSpot.lookAt(camera.position);
            hotSpot.visible = false;
            scene.add(hotSpot);

            spheres[0].material = spheres[1].material;

            logoMaterial = new THREE.MeshBasicMaterial({
                map: textureLoader.load(options.logoUrl),
                transparent: true,
                side: THREE.DoubleSide
            });
            logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), logoMaterial);
            logoMesh.position.set(0, -40, 0);
            logoMesh.scale.y = -1;
            logoMesh.lookAt(sceneCenter);
            spheres[1].add(logoMesh);

            initHotSpots();
            spheres[0].material = spheres[1].material;
            renderer.render(scene, camera);
            _stage.className = 'show';

            options.smoothStart ? smoothStart() : start();
            camera.updateProjectionMatrix();
            options.autoPlay && scope.play();

        }

        // 进入场景（普通）
        function start() {
            camera.position.set(0, 0, -0.001);
            camera.fov = cameraFov;
            camera.lookAt(sceneCenter);
        }

        // 进入场景（平滑过渡）
        function smoothStart() {
            spheres[1].rotation.set(0, 0, 0);
            if (options.autoRotate) spheres[1].rotation.y = Math.PI / 2;  // 用于向左旋转球体
            camera.position.set(0, 30, 0.1);
            camera.rotation.set(0, 0, 0);
            camera.fov = 160;
            camera.rotation.x = -Math.PI / 2;
        }
    };

    /**
     * 开始播放场景
     */
    Panorama.prototype.play = function () {

        var scope = this;
        renderOver = function () {
            if (options.smoothStart) {

                // 相机沿Y轴负方向移动到0
                new TWEEN.Tween({fov: 160, positionY: 30})
                    .to({fov: cameraFov, positionY: 0}, 3000)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(function () {
                        camera.position.y = this.positionY;
                        camera.fov = this.fov;
                        camera.updateProjectionMatrix();
                    }).start();
                // 相机镜头从下到朝Z轴负方向
                new TWEEN.Tween({rotateX: -Math.PI / 2})
                    .to({rotateX: 0}, 3000)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(function () {
                        camera.rotation.x = this.rotateX;
                    }).onComplete(function () {
                    camera.position.set(0, 0, 0.1);
                    _lockScene = false;
                    initControls();
                }).delay(500).start();

                if (options.autoRotate) {  // 如果需要在平滑进入时自动旋转
                    new TWEEN.Tween({rotateY: Math.PI / 2})
                        .to({rotateY: 0}, 3000)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onUpdate(function () {
                            spheres[1].rotation.y = this.rotateY;
                        }).delay(1000).start();
                }
            } else {
                _lockScene = false;
                initControls();
            }
        };

        function initControls() {
            orbitControls = new THREE.OrbitControls(camera, _stage);
            orbitControls.target = sceneCenter;
            orbitControls.autoRotateSpeed = 0.07;
            orbitControls.enableRotate = true;
            orbitControls.enableDamping = true;
            orbitControls.dampingFactor = 0.1;
            orbitControls.rotateSpeed = fromPC() ? 0.07 : 0.04;
            orbitControls.enableZoom = false;
            orbitControls.enableKeys = false;
            orbitControls.enablePan = false;
            orbitControls.autoRotate = options.autoRotate;
            orbitControls.addEventListener('change', function () {
                callbacks.onCameraChanged(camera.getWorldDirection());
            });
            // 初始化设备控制器
            deviceControls = new THREE.DeviceOrientationControls(camera, true);
            deviceControls.connect();
            deviceControls.enabled = false;

            var $stage = $(_stage);
            // 鼠标事件
            $stage.on('mousedown', mouseDown.bind(scope));
            $stage.on('mousemove', mouseMove.bind(scope));
            $stage.on('mouseup', mouseUp.bind(scope));
            $stage.on('DOMMouseScroll mousewheel', mouseWheel.bind(scope));
            // 触摸事件
            $stage.on('touchstart', touchStart.bind(scope));
            $stage.on('touchmove', touchMove.bind(scope));
            $stage.on('touchend', touchEnd.bind(scope));

            // 方向变化事件
            window.addEventListener('deviceorientation', onDeviceOrientation);
        }
    };

    /**
     * 切换场景
     * @param SpaceId
     * @param hotId 触发的热点编号（用于转场效果）
     * @returns {boolean}
     */
    Panorama.prototype.showSpace = function (SpaceId, hotId) {
        if (_lockScene || transiting || _editingHot) return false;
        var toSpaceId = SpaceId;
        var hotInfo;
        if (hotId) {
            hotInfo = currentSpace.hotInfoDict[hotId];
            toSpaceId = hotInfo.to;
        }
        if (currentSpace.id == toSpaceId) {
            return false;
        }
        var animateTime = 800;
        var timer = null;
        var scope = this;
        if (!materialDict[toSpaceId]) {
            callbacks.onShowing();
            timer = window.setInterval(function () {
                if (materialDict[toSpaceId]) {
                    window.clearInterval(timer);
                    timer = null;
                    scope.showSpace(SpaceId, hotId);
                }
            }, 100);
            return false;
        }
        // 若空间已经被移除
        if (materialDict[toSpaceId].disabled) {
            console.log('no space ' + toSpaceId);
            return false;
        }
        // 重置小球位置
        spheres[1].rotation.set(0, 0, 0);
        spheres[1].position.set(0, 0, 0);
        transiting = true;
        // 手动调用热点移出事件
        callbacks.onLeaveHot();
        // 先删除小球上的热点
        Object.keys(currentSpace.hotInfoDict).forEach(function (k) {
            spheres[1].remove(currentSpace.hotInfoDict[k].mesh);
            delete currentSpace.hotInfoDict[k].mesh;// mesh会每次重新生成
        });
        console.log('from：' + currentSpace.id + ' → to：' + toSpaceId);
        spheres[0].material = spheres[1].material;
        materialDict[toSpaceId].opacity = 0;
        spheres[1].material = materialDict[toSpaceId];  //修改小球材质
        currentSpace = _spacesDict[toSpaceId];

        renderOver = function () {
            callbacks.onShown(toSpaceId);
            if (hotInfo && (hotInfo.px || hotInfo.py || hotInfo.pz || hotInfo.rx || hotInfo.ry || hotInfo.rz)) {
                // 有转场效果
                logoMesh.visible = false;
                // 大球移近
                var tween0 = new TWEEN.Tween({
                    px: 0,
                    py: 0,
                    pz: 0,
                    rx: 0,
                    ry: 0,
                    rz: 0
                }).to(hotInfo, animateTime)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(function () {
                        spheres[0].position.set(this.px, this.py, this.pz);
                        spheres[0].rotation.set(this.rx, this.ry, this.rz);
                    });
                // 小球opacity增加
                var tween1 = new TWEEN.Tween({opacity: 0})
                    .to({opacity: 1}, animateTime)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(function () {
                        spheres[1].material.opacity = this.opacity;
                    }).onComplete(function () {
                        spheres[0].position.set(0, 0, 0);
                        spheres[0].rotation.set(0, 0, 0);
                        logoMesh.visible = true;
                        initHotSpots();
                        transiting = false;
                    });
                tween0.start();
                tween1.delay(animateTime - 250).start();
                spheres[0].getWorldPosition()
            } else {
                // 直接切换
                new TWEEN.Tween({opacity: 0})
                    .to({opacity: 1}, 1000)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(function () {
                        spheres[1].material.opacity = this.opacity;
                    }).onComplete(function () {
                    spheres[0].position.set(0, 0, 0);
                    spheres[1].position.set(0, 0, 0);
                    logoMesh.visible = true;
                    initHotSpots();
                    transiting = false;
                }).start();
            }
        };
    };

    /**
     * 添加新空间
     * @param space
     */
    Panorama.prototype.addSpace = function (space) {
        if (!_spacesDict[space.id]) {
            _spacesDict[space.id] = space;
            textureLoader.load(space.url, function (texture) {
                materialDict[space.id] = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    side: THREE.DoubleSide
                });
                materialDict[space.id].disabled = false;
            });
        } else {
            materialDict[space.id].disabled = false;
        }
    };

    /**
     * 移除空间
     * @param spaceId
     */
    Panorama.prototype.removeSpace = function (spaceId) {
        if (_spacesDict[spaceId]) {
            delete _spacesDict[spaceId];
            materialDict[spaceId].disabled = true;
        }
    };

    /**
     * 根据鼠标位置获取热点位置
     */
    Panorama.prototype.get3DPos = function (pos) {
        // 根据鼠标位置创建射线
        pos.x = (pos.x / STAGE_WIDTH) * 2 - 1;
        pos.y = -(pos.y / STAGE_HEIGHT) * 2 + 1;
        var newRay = new THREE.Raycaster();
        newRay.setFromCamera(pos, camera);
        // 通过射线与小球的交点获取新热点的位置
        var newHotPos = newRay.intersectObject(spheres[1])[0].point;
        newHotPos.setLength(HOT_DISTANCE);
        return {
            vx: newHotPos.x.toFixed(4),
            vy: newHotPos.y.toFixed(4),
            vz: newHotPos.z.toFixed(4)
        }
    };

    /**
     * 添加热点
     * @param hotId
     * @param to
     * @param hotPos 热点位置
     * @param title
     */
    Panorama.prototype.addHot = function (hotId, to, hotPos, title) {
        if (!(hotId && to && hotPos)) {
            console.error('无法创建热点');
            return false;
        }
        if (to == currentSpace.id) {
            console.error('不可与当前场景相同');
            return false;
        }
        var newHotSpot = hotSpot.clone();
        newHotSpot.material = hotSpot.material.clone();
        newHotSpot.position.set(
            -hotPos.vx,
            hotPos.vy,
            hotPos.vz
        );
        newHotSpot.hotId = hotId;
        newHotSpot.lookAt(sceneCenter);
        newHotSpot.visible = true;
        currentSpace.hotInfoDict[hotId] = {
            id: hotId,
            to: to,
            title: title,
            vx: hotPos.vx,
            vy: hotPos.vy,
            vz: hotPos.vz,
            mesh: newHotSpot
        };

        spheres[1].add(newHotSpot);
        // 重新收集当前空间的热点
        initHotSpots(true);

    };

    /**
     * 保存对热点的修改
     * @param to
     * @param title
     * @param transform
     */
    Panorama.prototype.saveHot = function (to, title, transform) {
        if (to == currentSpace.id) {
            console.error('不可与当前场景相同');
            return false;
        }
        Object.assign(currentSpace.hotInfoDict[hot2beEdit.hotId], {
            to: to,
            title: title,
            rx: transform.rx,
            ry: transform.ry,
            rz: transform.rz,
            px: transform.px,
            py: transform.py,
            pz: transform.pz
        });
        this.editingHot = false;
    };

    /**
     * 重置转场动画
     * @returns {{rx, ry, rz, px, py, pz}}
     */
    Panorama.prototype.resetHot = function () {
        spheres[0].material = materialDict[currentSpace.id];
        console.log(materialDict);
        console.log(currentSpace.hotInfoDict[hot2beEdit.hotId]);
        spheres[1].material = materialDict[currentSpace.hotInfoDict[hot2beEdit.hotId].to];
        spheres[1].material.opacity = 0.5;
        var hotInfo = currentSpace.hotInfoDict[selectedHot.hotId];
        spheres[0].position.set(hotInfo.px || 0, hotInfo.py || 0, hotInfo.pz || 0);
        spheres[0].rotation.set(hotInfo.rx || 0, hotInfo.ry || 0, hotInfo.rz || 0);
        return hotInfo;
    };

    /**
     * 删除热点
     * @param hotId
     */
    Panorama.prototype.deleteHot = function (hotId) {
        spheres[1].remove(currentSpace.hotInfoDict[hotId].mesh);
        delete currentSpace.hotInfoDict[hotId];
        initHotSpots(true);  // 重新收集热点
        this.editingHot = false;
    };

    Panorama.prototype.changeLogo = function (logoUrl) {
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
    Panorama.prototype.resize = function (stageWidth, stageHeight) {
        STAGE_WIDTH = stageWidth;
        STAGE_HEIGHT = stageHeight;
        renderer.setSize(STAGE_WIDTH, STAGE_HEIGHT);
        camera.aspect = STAGE_WIDTH / STAGE_HEIGHT;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
    };

    /**
     * 应用热点数据
     * @param transform
     * @returns {*}
     */
    Panorama.prototype.applyTransform = function (transform) {
        if (!_editingHot) return false;
        transform.to && (spheres[1].material = materialDict[transform.to]);
        var opacity = parseFloat(transform.opacity),
            px = parseFloat(transform.px),
            py = parseFloat(transform.py),
            pz = parseFloat(transform.pz),
            rx = parseFloat(transform.rx),
            ry = parseFloat(transform.ry),
            rz = parseFloat(transform.rz);
        if (!isNaN(opacity)) {
            spheres[1].material.opacity = transform.opacity = opacity = parseFloat(Math.min(0.8, Math.max(0.3, opacity)).toFixed(4));
            spheres[1].material.opacity = opacity;
        }
        if (!isNaN(px)) {
            spheres[0].position.x = transform.px = px = parseFloat(Math.min(70, Math.max(-70, px)).toFixed(4));
            spheres[0].material.px = px;
        }
        if (!isNaN(py)) {
            spheres[0].position.y = transform.py = py = parseFloat(Math.min(70, Math.max(-70, py)).toFixed(4));
            spheres[0].material.py = py;
        }
        if (!isNaN(pz)) {
            spheres[0].position.z = transform.pz = pz = parseFloat(Math.min(70, Math.max(-70, pz)).toFixed(4));
            spheres[0].material.pz = pz;
        }
        if (!isNaN(rx)) {
            spheres[0].rotation.x = transform.rx = rx = parseFloat(Math.min(1.5, Math.max(-1.5, rx)).toFixed(4));
            spheres[0].material.rx = rx;
        }
        if (!isNaN(ry)) {
            spheres[0].rotation.y = transform.ry = ry = parseFloat(Math.min(1.5, Math.max(-1.5, ry)).toFixed(4));
            spheres[0].material.ry = ry;
        }
        if (!isNaN(rz)) {
            spheres[0].rotation.z = transform.rz = rz = parseFloat(Math.min(1.5, Math.max(-1.5, rz)).toFixed(4));
            spheres[0].material.rz = rz;
        }
        return {
            opacity: spheres[1].material.opacity,
            px: spheres[0].position.x,
            py: spheres[0].position.y,
            pz: spheres[0].position.z,
            rx: spheres[0].rotation.x,
            ry: spheres[0].rotation.y,
            rz: spheres[0].rotation.z
        }
    };

    /**
     * 初始化/收集热点
     * @param onlyGather 是否仅收集热点
     */
    var initHotSpots = function (onlyGather) {
        spaceHots = [];
        currentSpace.hotInfoDict || (currentSpace.hotInfoDict = {});
        Object.keys(currentSpace.hotInfoDict).forEach(function (k) {
            var hotInfo = currentSpace.hotInfoDict[k];
            if (onlyGather) {  // 仅收集当前空间中的热点用于拾取
                spaceHots.push(hotInfo.mesh);
            } else {  // 初始化当前空间的热点
                var hotRay = hotInfo.ray;
                if (!hotRay) {
                    hotRay = new THREE.Raycaster();
                    hotRay.set(sceneCenter, new THREE.Vector3(hotInfo.vx, hotInfo.vy, hotInfo.vz));
                    hotInfo.ray = hotRay;
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
                    tempHotSpot.title = hotInfo.title;
                    tempHotSpot.lookAt(camera.position);
                    spheres[1].add(tempHotSpot);
                    // 用于拾取热点
                    hotInfo.mesh = tempHotSpot;
                    spaceHots.push(hotInfo.mesh);
                }
            }
        });
    };

    var mouseDown = function ($e) {
        clicking = true;
        startPoint1 = {x: $e.pageX, y: $e.pageY};
    };

    var mouseMove = function ($e) {
        if (!(_lockScene || transiting || $e.which == 3)) {
            // 2px内认为没有拖动
            if (clicking && ((Math.abs(parseInt(startPoint1.x) - parseInt($e.pageX)) > 2) || (Math.abs(parseInt(startPoint1.y) - parseInt($e.pageY)) > 2))) {
                orbitControls.autoRotate = clicking = false;
            }
            if (_addingHot) {  // 开始添加热点
                raycaster.setFromCamera(mousePos, camera);
                intersects = raycaster.intersectObject(spheres[1]);
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
                    if (_editingHot) {
                        selectedHot.material.color.set(0x0077ff);
                    } else {
                        selectedHot.material.color.set(0xffffff);
                    }
                    hotLeaved = false;
                    callbacks.onOverHot(currentSpace.hotInfoDict[selectedHot.hotId], {x: $e.pageX, y: $e.pageY});  // TODO 应该使用相对于容器的位置
                } else if (!hotLeaved) {
                    hotLeaved = true;  // onLeaveHot只执行一次
                    callbacks.onLeaveHot();
                }
            } else {
                intersects = [];
            }
            mousePos.x = ($e.pageX / STAGE_WIDTH) * 2 - 1;
            mousePos.y = -($e.pageY / STAGE_HEIGHT) * 2 + 1;
        }
    };

    // TODO 增加右键事件回调
    var mouseUp = function ($e) {
        if (!_lockScene && clicking) {
            if (_addingHot) {  // 添加脚印
                callbacks.onAddingHot({x: $e.pageX, y: $e.pageY});
            } else {
                if (intersects.length > 0) {  // 单击热点
                    if (options.debug) {
                        if ($e.which == 3 || (_editingHot && $e.which == 1)) {  // 编辑状态下左击或右击热点
                            _editingHot = true;
                            hot2beEdit = selectedHot;
                            callbacks.onEditingHot(this.resetHot());
                        } else {
                            this.showSpace(null, selectedHot.hotId);
                        }
                    } else {
                        this.showSpace(null, selectedHot.hotId);
                    }
                } else if (spaceHots.length > 0) {  // 单击空白处
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

    // TODO 回弹效果
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

    var touchMove = function ($e) {
        if (!_lockScene) {
            var e = $e.originalEvent;
            if (e.touches) {  // 触摸操作
                var touch0X = e.touches[0].clientX;
                var touch0Y = e.touches[0].clientY;
                // 2px内认为没有拖动
                if (clicking && ((Math.abs(parseInt(startPoint1.x) - parseInt(touch0X)) > 2) || (Math.abs(parseInt(startPoint1.y) - parseInt(touch0Y)) > 2))) {
                    // 标为移动操作
                    orbitControls.autoRotate = clicking = false;
                }
                if (e.touches.length > 1) {  // 如果是双指操作
                    // TODO 回弹效果
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
        if (!_lockScene && !_stereoMode && clicking) {
            if (spaceHots.length > 0) {
                var e = $e.originalEvent;
                if (e.changedTouches && e.changedTouches.length > 0) {
                    mousePos.x = (e.changedTouches[0].clientX / STAGE_WIDTH) * 2 - 1;
                    mousePos.y = -(e.changedTouches[0].clientY / STAGE_HEIGHT) * 2 + 1;
                    raycaster.setFromCamera(mousePos, camera);
                    intersects = raycaster.intersectObjects(spaceHots);
                    if (intersects.length > 0) {// 触击热点
                        this.showSpace(null, intersects[0].object.hotId);
                    } else if (spaceHots.length > 0) {  // 触击空白处
                        // alert('触击空白处');
                    }
                }

            }
        }
        cameraFov = camera.fov;
    };

    var onDeviceOrientation = function () {
        if (_walkMode) {
            var cameraDirection = camera.getWorldDirection();
            callbacks.onCameraChanged(cameraDirection);
            raycaster.set(sceneCenter, cameraDirection);
            intersects = raycaster.intersectObjects(spaceHots);
            // 全部热点置为默认颜色
            for (var k = 0; k < spaceHots.length; k++) {
                spaceHots[k].material.color.set(0x000000);
            }
            // 高亮选中的热点
            if (intersects.length > 0) {
                selectedHot = intersects[0].object;
                selectedHot.material.color.set(0xffffff);

                hotLeaved = false;
                callbacks.onOverHot(currentSpace.hotInfoDict[selectedHot.hotId]);  // TODO 应该使用相对于容器的位置
            } else if (!hotLeaved) {
                hotLeaved = true;  // onLeaveHot只执行一次
                callbacks.onLeaveHot();
            }
        }
    };

    // 定义stage属性（只读）
    Object.defineProperty(Panorama.prototype, "stage", {
        get: function () {
            return _stage;
        }
    });
    // 定义spaceId属性（只读）
    Object.defineProperty(Panorama.prototype, "spaceId", {
        get: function () {
            return currentSpace.id;
        }
    });

    // 定义spacesDict属性（只读）
    Object.defineProperty(Panorama.prototype, "spacesDict", {
        get: function () {
            return _spacesDict;
        }
    });

    // 定义stereoMode属性
    Object.defineProperty(Panorama.prototype, "stereoMode", {
        set: function (val) {
            _stereoMode = !!val;
            if (_stereoMode) {
                // raycaster.set(sceneCenter, camera.getWorldDirection());
                stereoRenderer.setSize(STAGE_WIDTH, STAGE_HEIGHT);
            } else {
                // raycaster.setFromCamera(mousePos, camera);
                renderer.setSize(STAGE_WIDTH, STAGE_HEIGHT);
            }
        },
        get: function () {
            return _stereoMode;
        }
    });

    // 定义walkMode属性
    Object.defineProperty(Panorama.prototype, "walkMode", {
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
    Object.defineProperty(Panorama.prototype, "addingHot", {
        set: function (val) {
            _addingHot = hotSpot.visible = !!val;
        },
        get: function () {
            return _addingHot;
        }
    });

    // 定义editingHot属性
    Object.defineProperty(Panorama.prototype, "editingHot", {
        set: function (val) {
            _editingHot = !!val;
            if (!_editingHot) {
                spheres[1].material = materialDict[currentSpace.id];
                spheres[1].material.opacity = 1;
                spheres[0].position.set(0, 0, 0);
                spheres[0].rotation.set(0, 0, 0);
            }
        },
        get: function () {
            return _editingHot;
        }
    });

    // 定义lockScene属性
    Object.defineProperty(Panorama.prototype, "lockScene", {
        set: function (val) {
            _lockScene = !!val;
            orbitControls.enableRotate = !val;
        },
        get: function () {
            return _lockScene;
        }
    });

    Panorama.prototype.update = function () {
        TWEEN.update();
        if (orbitControls && orbitControls.enabled) orbitControls.update();
        if (deviceControls && deviceControls.enabled) deviceControls.update();
        stats && stats.update();
        if (_stereoMode) {
            stereoRenderer.render(scene, camera);
        } else {
            renderer.render(scene, camera);
        }
        if (renderOver) {  // 执行渲染完后的方法（只执行一次）
            renderOver();
            renderOver = null;
        }
    };

    window.Panorama = Panorama;  // 暴露Panorama对象

})(window, document, jQuery);
