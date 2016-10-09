## vray.scene.js插件接口列表：

1. 初始化参数
    
    | 属性名 | 类型 | 说明 | 默认值 |
    |:-------------:|:-------------|:-------------|
    | container | DOM | document.body | 场景显示的容器，必须是非static |
    | smoothStart | boolean | false | 是否平滑进入 |
    | autoPlay | boolean | false | 是否自动播放 |
    | autoRotate | boolean | false | 是否自动旋转 |
    | logoUrl | string | 无 | 场景logo |
    | hotImg | string | /static/panorama/img/foot_step.png | 热点图片 |
    | fps | boolean | false | 显示帧速 |
    
2. 实例属性
    
    | 属性名 | 类型 | 说明 | |
    |:-------------:|:-------------|:-------------|
    | stage | DOM | 添加到容器下的canvas标签 | r |
    | spaceCount | number | 场景中的空间数量 | r |
    | spacesDict | json对象 | 空间字典 | r |
    | spaceId | string | 当前显示的空间编号 | r |
    | stereoMode | boolean | VR模式 |  r / w |
    | walkMode | boolean | 步行模式 |  r / w |
    | addingHot | boolean | 选择热点模式 |  r / w |
    | lockScene | boolean | 锁定场景 |  r / w |

3. 实例方法
    
    | 方法名 | 概述 |
    |:-------------:|
    | [play](#m_play) | 播放场景 |
    | [showSpace](#m_showSpace) | 切换场景 |
    
4. 事件
    
    | 事件名 | 概述 |
    |:-------------:|
    | play | 播放场景 |
    | showSpace | 切换场景 |
    
## 详情：

1. 实例方法
    - <span id="m_play">play</span>