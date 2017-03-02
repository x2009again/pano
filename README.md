（作者比较懒，该文档已长期未更新，请暂时无视接口列表及描述 23333）
------------------------------------
# 项目描述
全景图Demo（包添功能有：根据已有空间创建场景；增、删、改空间中的热点，修改空间底部logo，兼容移动端浏览，横屏VR模式）

 **ps:仅供学习参考，很多接口并不完善，后台也有不少bug，欢迎fork。换工作中，近期并不打算维护，抱歉23333** 

# 运行
- 安装python环境
- 修改settings.py中的DATABASES项为mysql或sqlite3，前者需要安装并配置自己的账号密码
- 如果使用mysql请在数据库中创建新的schema名为panorama
- 生成migration文件：python manage.py makemigrations panorama
- 执行migration：python manage.py migrate
- 初始化数据：manage.py loaddata init_panorama.json
- 启动django：python manage.py runserver 0.0.0.0:8000
- 访问主页：http://localhost:8000
- 访问查看页面：http://localhost:8000/panorama/view?scene_id=second
- 访问编辑页面：http://localhost:8000/panorama/edit?scene_id=second
- 访问单空间材质切换页面：http://localhost:8000/panorama/check?space_id=23

# panorama.js插件接口列表：

### 1. 初始化参数


|属性名 | 类型 | 说明 | 默认值|
|----- | ---- | ---- | ------|
|container | DOM | document.body | 场景显示的容器，必须是非static |
|smoothStart | boolean | false | 是否平滑进入 |
|autoPlay | boolean | false | 是否自动播放 |
|autoRotate | boolean | false | 是否自动旋转 |
|logoUrl | string | 无 | 场景logo |
|hotImg | string | /static/panorama/img/foot_step.png | 热点图片 |
|debug | boolean | false | 进入编辑模式 |
|fps | boolean | false | 显示帧速 |

### 2. 实例属性

|属性名 | 类型 | 说明 ||
|-------|-----|------|---|
|stage | DOM | 添加到容器下的canvas标签 | r |
|spaceCount | number | 场景中的空间数量 | r |
|spacesDict | json对象 | 空间字典 | r |
|spaceId | string | 当前显示的空间编号 | r |
|stereoMode | boolean | VR模式 |  r / w |
|walkMode | boolean | 步行模式 |  r / w |
|addingHot | boolean | 选择热点模式 |  r / w |
|lockScene | boolean | 锁定场景 |  r / w |

### 3. 实例方法

|方法名 | 概述 |
|------|------ |
|[play](#play_7) | 播放场景 |
|[showSpace](#showspace_8) | 切换场景 |
    
### 4. 事件
    
|事件名 | 概述 |
|------|------- |
|onOverHot | 选择器在热点上移动时 |
|onLeaveHot | 选择器离开热点时 |
|onAddingHot | 添加热点时点击container的回调 |
|onLoad | 首屏加载完毕 |
|onShowing | 下一个场景载入中 |
|onShown | 场景切换完毕 |
|onHotAdd | 热点添加前 |

---

### 接口描述

#### play
- 播放场景

#### showSpace
- 切换场景
- 参数
