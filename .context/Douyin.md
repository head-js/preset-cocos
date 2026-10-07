# preset-cocos：抖音小游戏方向的需求与方案

记录日期：2026-10-07（Asia/Shanghai）

本文件记录讨论后的有效需求与方案。平台方向已从 TikTok 国际版调整为国内抖音小游戏；当前阶段只验收 Cocos Creator 内部预览，不要求构建、接入或发布到抖音。

## 目标与阶段

验证 Cocos Creator 能否作为 React/Vue 背景团队的小游戏开发框架，先建立极简 2D 工程骨架，掌握 TypeScript 组件、引擎运行和预览方式。当前不开发游戏。

最终产品方向是**仅面向竖屏手机**的 2D 平面游戏，例如从正上方观察的棋盘。目标设备是主流竖屏手机，不支持横屏、平板、桌面或其他屏幕形态。未来交付形态为抖音小游戏；浏览器仅作为 Creator 的预览环境，不是最终 H5 交付目标。

当前交付物：能用 Creator 打开，预览时显示白底黑字 `Hello Cocos` 的最小工程。

后续平台阶段：在内部预览通过的基础上，再验证字节小游戏构建、抖音开发者工具运行和发布链路。此阶段尚未执行，不作为当前完成条件。

## 当前范围与验收

做：

- 最小工程目录结构和必要配置。
- 一个使用 `cc` API 的 TypeScript `Hello` 组件。
- 为显示文字准备必要的 2D 场景、Canvas 和相机，并保存组件挂载关系。
- Creator 编辑器预览验证。

不做：游戏逻辑、棋盘、交互、完整 UI 系统、素材管理方案、美术、音效、广告接入、平台构建与发布。最小文字输出和必要场景不代表扩展为 UI 或场景编辑功能开发。

当前验收标准：

1. Cocos Creator 能打开本工程，无阻断打开或预览的错误。
2. 打开 `assets/scenes/Main.scene` 后直接预览，无须重新创建场景或手动挂载组件。
3. 预览画面中央显示黑色 `Hello Cocos`，背景为白色，并使用竖屏手机画布。

当前不需要平台 AppID、抖音开发者工具或平台账号。

## 约束

- 业务组件不得依赖 DOM/BOM：不使用 `document`、`window`、`localStorage`、裸 `fetch`。
- 渲染、节点和生命周期使用 Cocos API。浏览器预览成功不等于小游戏平台验证成功。
- 平台配置、能力适配和构建目标应作为工程的独立关注点；后续平台阶段通过配置或可重复执行的构建流程接入，避免构建完成后临时手改产物。
- 预留引擎模块裁剪的位置。小游戏包体受平台限制，具体上限须在平台阶段按当时官方要求核对，不沿用旧文档数值。
- 当前只讨论和支持 macOS 开发环境。

## 技术选择与开发模式

### 必须安装 Creator 吗

本方案需要安装 Cocos Creator。它负责识别工程、导入资源、维护场景、生成 `cc` 类型声明、启动预览和后续平台构建。仅安装 Node.js 或 npm 包无法替代这条工程链路。

日常 TypeScript 编写可以在 VS Code 等外部编辑器进行，不要求所有代码都在 Creator 内编辑。React/Vue 经验可用于理解组件拆分和状态组织，但这里使用 Cocos 节点、组件和生命周期，不使用 React/Vue 的 DOM 渲染模式。

当前固定 Creator **3.8.6**，工程类型为 **2D**。项目配置中记录版本，团队先使用一致版本，避免场景序列化和引擎 API 差异。

项目固定使用竖屏手机设计：`settings/v2/packages/project.json` 的设计分辨率为 `800 × 1440`（5:9）。所有场景布局都以竖屏手机为前提，不支持横屏、平板或桌面适配。后续构建统一通过 Creator IDE 选择 `bytedance-mini-game` 目标；Creator 3.8.6 的该平台模板固定生成 `deviceOrientation: "portrait"`。横屏设备不得以横屏方式运行。

### macOS 安装与打开

1. 从 [Cocos 官方下载页](https://www.cocos.com/creator-download) 获取适合 Mac 芯片架构的 Cocos Dashboard。
2. 通过 Dashboard 安装 Creator 3.8.6。
3. 在 Dashboard 中导入本工程目录，再用该版本 Creator 打开。
4. 在 Creator 资源管理器中打开 `assets/scenes/Main.scene`，点击顶部预览按钮。

本机已安装并成功打开 Creator。当前已使用的可执行文件路径：

```text
/Applications/Cocos/Creator/3.8.6/CocosCreator.app/Contents/MacOS/CocosCreator
```

### 开发阶段

```text
外部编辑器修改 TypeScript
    → Creator 导入与编译
    → 打开 Main.scene
    → Creator 预览
    → 检查画面与日志
```

首次打开工程后，Creator 会生成 `temp/tsconfig.cocos.json` 和 `cc` 类型声明。工程的 `tsconfig.json` 继承该生成配置，外部编辑器随后可解析引擎类型。

Hello 使用 `@ccclass('Hello')` 声明组件，继承 `Component`，在 `start()` 中创建文本节点和 `Label`。节点继承父节点的渲染层，文字使用 `Color.BLACK`，不操作网页元素。

预览地址来自 Creator 的本地服务，本机验证时使用 `localhost:7456`；地址与端口属于开发环境，不构成对外网站交付。

### 构建与发布阶段（后续）

拟采用以下链路：

```text
Cocos 工程
    → Creator 的字节小游戏构建目标
    → 字节/抖音开发者工具导入产物
    → 平台预览与真机验证
    → 发布流程
```

构建统一通过 Creator IDE 完成：在构建发布面板中选择 `bytedance-mini-game`，确认竖屏配置后执行构建。当前阶段只验收 Creator 内部预览，尚未执行平台构建；不提供单独的命令行构建入口。

平台阶段再落实 AppID、开发者工具版本、资源/分包规则、引擎模块裁剪和构建产物检查。竖屏方向已经固定；当前工程中的 `settings/v2/packages/engine.json` 与 `builder.json` 仍只保留配置位置，平台构建链路尚未验收。

## 2D 场景与相机方案

Cocos 场景中的可见内容需要通过相机渲染。2D 平面游戏也使用相机，但最小方案只需一台固定相机，无须实现移动、跟随或旋转控制。

棋盘可以放在 **XY 平面**，相机位于 Z 轴一侧，沿 Z 轴看向平面。选择**正交投影**，不会因距离产生透视缩小，适合从正上方观察棋盘。

“正上方”取决于平面坐标约定；在本项目的 2D 坐标约定下，是朝向 XY 平面的法线方向观察，无须为了这个描述改成 3D 场景。

当前 Hello 场景使用 Canvas 和固定正交 UI 相机。Canvas 随预览窗口适配，Hello 文本位于其中心。相机清屏颜色为白色，文本颜色为黑色。这里仅验证 2D 渲染骨架；棋盘节点、坐标换算和输入交互留待真正开发游戏时设计。

## 工程结构与版本管理

```text
assets/
  scenes/Main.scene          最小 2D 场景，已挂载 Hello
  scripts/Hello.ts           Cocos 文本组件
  各资源对应的 .meta         资源 UUID 与引用信息
settings/v2/packages/        Creator 工程设置与后续构建、引擎配置位置
package.json                工程名、项目版本、Creator 版本和 2D 类型
tsconfig.json               继承 Creator 生成的 TypeScript 配置
README.md                   当前工程打开与预览说明
.context/Douyin.md           当前需求与方案
.context/TikTok.md           原 TikTok 调查历史
.context/Hello-preview.png   当前白底黑字预览截图
```

版本管理应包含 `assets/`（连同 `.meta`）、`settings/` 和工程配置。`.meta` 中的 UUID 用于场景与组件引用，不能随意丢弃。

`settings/v2/` 是 Cocos Creator 3.x 使用的工程设置存储格式目录，由 Creator 打开工程时自动生成和读取。这里的 `v2` 表示 settings 数据格式，不是项目版本、Creator 版本或抖音平台版本，也不是所有类型项目都通用的业务目录；其他版本或其他工具可能使用不同的目录格式。当前目录中的 `project.json`、`engine.json`、`builder.json` 等文件保存项目、引擎和构建器设置，默认值也可能由 Creator 写入，因此本工程保留并提交 `settings/`。其中 `project.json` 的 `general.designResolution` 固定为 `800 × 1440`，用于表达竖屏手机设计比例；`device.json` 只用于 Creator 编辑器里的设备模拟预设，不决定最终产物方向。

`profiles/` 保存编辑器个人状态，`library/` 和 `temp/` 保存导入缓存、生成文件和临时数据。这些目录通常可由 Creator 重建，不作为工程配置提交，已由 `.gitignore` 排除。
`local/` 也是编辑器生成的本地数据，已由 `.gitignore` 排除。

### 工程命名与平台标识

公司约定的三个名称分别用于不同层级：`preset-cocos` 是工程和仓库标识，已写入 `package.json` 的 `name`；`Preset Cocos` 是面向人的产品显示名称，也用于 `settings/v2/packages/cocos-service.json` 的 `game.name`；`com.lisitede.preset.cocos` 作为原生平台的 Bundle ID 或 Application ID，后续接入原生平台时再配置，不填入 Cocos 服务的 `app_id`。

`cocos-service.json` 中的 `game.app_id` 是 Cocos 服务分配的应用标识，`c_id` 和 `config_id` 是服务或配置的内部标识。当前没有接入 Cocos 服务，因此保留模板中的 `UNKNOW`、`0` 和 `b8f57a`，并确保 `game.app_id`、`appConfigMaps[].app_id` 和 `configs[].app_id` 保持一致。抖音小游戏的 AppID 由抖音开发者平台分配，在 Creator 的抖音构建配置中填写，不与这些 Cocos 服务字段混用。

自动验证预览时，先检查现有 Creator 进程与预览服务，复用已有实例，避免重复打开编辑器。

## 平台选择背景与边界

原目标为 TikTok 国际版小游戏，调查记录保存在 `TikTok.md`。当时未确认 Creator 的“字节小游戏”产物是否能直接用于 TikTok 国际版，因此用户将方向调整为国内抖音小游戏。TikTok 兼容性不再是本阶段阻塞项。

国内抖音有小游戏平台；Cocos 官方提供字节小游戏发布路径，因此它是有官方支持依据的后续目标。**这不等于本工程已经完成抖音构建和运行验证。**

抖音小游戏支持广告变现能力，但实际接入需符合平台准入、应用状态和广告能力开通要求。广告不属于 Hello 骨架范围，也未在本工程中接入或验证。

已讨论的官方参考：[Cocos Creator 3.2：Publish to ByteDance Mini Games](https://docs.cocos.com/creator/3.2/manual/en/editor/publish/publish-bytedance-mini-game.html)。该页面属于 3.2，后续实施须核对工程使用的 3.8.6 文档和当时的平台要求。

`TikTok.md` 的暂停状态、原始验收和未验证说明是历史记录；当前有效目标、范围和进度以本文件为准。

## 当前进度

- Creator 3.8.6 已安装，工程已成功打开。
- 最小 2D 场景与 Hello 组件已保存，打开场景即可预览。
- 项目设计分辨率和场景画布已设为 `800 × 1440`；目标设备只有竖屏手机，不包含横屏、平板或桌面。
- 白底黑字 `Hello Cocos` 已在 Creator 预览中完成验证；当前配置已切换为竖屏手机画布，浏览器只是 Creator 的开发预览载体。
- 验证时预览控制台未发现 error/warn；此前 TypeScript 检查通过。
- 用户已确认画面没有问题，当前内部预览验收完成。
- 抖音小游戏构建、开发者工具运行、真机验证、发布、广告和包体裁剪尚未执行。

后续如进入抖音平台阶段，应新增相应验收标准；目前保留这个可打开、可预览的最小骨架即可。

## 后续开发约定与当前里程碑

后续由用户逐步提出需求，每次只实现一个里程碑。项目以概念验证为核心，不自行扩展功能范围。以上 Hello 骨架是已完成的初始阶段。

当前新增里程碑为背景底纹：目标仍是常规主流竖屏手机，背景按当前画布尺寸自然铺满，不枚举屏幕比例或添加设备适配分支。

`Main.scene` 中新增独立的 `Background` 节点，通过 Widget 四边对齐 Canvas。`assets/scripts/GridBackground.ts` 使用 Cocos Graphics 绘制白底、灰色（`#C0C7D0`）网格。当前每个方格为 48 × 48 个设计单位，整体倾斜 45 度，画面中心对齐中央瓦片的中心。通过两组垂直的斜线和半格偏移确定网格位置；按当前渲染缩放和屏幕像素密度对称量化斜线偏移、统一线宽（至少 1 个屏幕逻辑像素），保持中心对齐并避免线条深浅不均。初次启用、节点尺寸变化或画布缩放变化时，在 Canvas 与 Widget 更新完成后重绘。无需图片素材，底纹不承担棋盘或游戏坐标功能。保留现有 Hello 文字作为预览参照。

用户已在运行预览中看到底纹，并确认加深、加密后存在深浅不均，随后要求像素对齐修复。当前按最新要求改为 48 × 48、倾斜 45 度、中央瓦片中心与画面中心重合，并保持 `#C0C7D0` 颜色。TypeScript 检查通过。斜网格已在本次挡板里程碑的 Creator 预览中显示，控制台未发现 error/warn。


### 下方挡板里程碑（2026-10-07）

本次开始时工程实际设计分辨率已为 `800 × 1440`，Table 外尺寸为 `720 × 1360`；以上尺寸说明已按工程现状同步。

场景层级：

```text
Canvas
  Background
  Table                      720 × 1360，居中
    Border                   上、左、右三边金色 4 设计单位描边和阴影
  Paddle                     独立挡板，与 Table 同级
  Ball                       独立球，与 Table 同级
  Camera
```

`TableFrame.ts` 挂在 Border 上，按父节点 Table 的 UITransform 绘制边框，金色描边的外沿位于 Table 边界内。挡板不属于 Table。

后续球阶段已明确删除下边框及其阴影，仅保留上、左、右三边；下沿不设置碰撞体、不参与碰撞判定。球越过下沿后的判输逻辑不属于本次任务。

三边边框绘制已实现，Creator 预览确认下边框及其阴影已移除；截图为 `.context/Open-border-preview.jpg`。球阶段已为这三边加入静态矩形碰撞体，下沿没有碰撞体。

`Paddle.ts` 挂在 Paddle 上，引用 Table 的 UITransform。挡板纯黑、初始居中，宽度为 Table 外宽的 1/2（当前 360 设计单位），上沿贴住 Table 的外侧下沿。高度按 2 个屏幕逻辑像素换算为设计单位；例如 360 宽手机预览下，固定 2 个设计单位仅约 0.9 个逻辑像素，因此不直接把节点高度固定为 2。画布缩放或 Table 尺寸、位置变化后重新计算布局。

移动控制采用屏幕任意位置按住横拖，挡板跟随手指的相对横向位移，纵向拖动不影响挡板；点按不使挡板跳到触点，松手或触摸取消后停止。整张画布作为操作区域，无需触中 2px 细线。限制挡板两端不越过 Table 左右外沿，只由第一根手指控制；切到后台或停用组件时释放触摸状态。Creator 的鼠标输入会模拟触摸事件，浏览器预览可按住鼠标拖动。

控制方式调查：手机挡板游戏常使用横拖，也可使用左右按钮控制方向和速度。横拖适合本项目的一维精确定位，并省去额外按钮；左右按钮需要按住移动到目标位置，虚拟摇杆通常更适合多方向移动，因此本里程碑采用横拖。相对位移是本项目的实现选择，避免重新按下时位置跳变。

参考：[Classic Breakout Deluxe Game 的操作说明](https://play.google.com/store/apps/details?id=skill.BreakBurst&hl=en_AU)明确使用“Touch and drag anywhere on the screen”横向移动挡板；[Creator 3.8 全局输入事件](https://docs.cocos.com/creator/3.8/manual/en/engine/event/event-input.html)说明 Cocos input 的触摸事件接入方式。本次也核对了本机 3.8.6 引擎的鼠标模拟触摸逻辑，以及屏幕像素与设计单位的缩放关系。

验证：TypeScript 检查通过；Creator 成功导入脚本并运行 Main.scene；在竖屏手机预览中验证了初始位置、半宽和约 2px 高度、左右拖动及两端限位、纵向拖动不改变位置、点按不跳变，控制台未发现 error/warn。预览截图为 `.context/Paddle-preview.jpg`。多指行为和抖音真机触摸尚未验证。本里程碑不加入球、碰撞、计分或其他游戏机制。

#### 挡板移动的事件原理

交互效果类似 Web 拖拽，事件流程对应 `pointerdown → pointermove → pointerup`：代码接收按下、移动和释放事件，计算位移，再更新 Cocos 节点的位置。

当前通过 Cocos 的全局 `input` 监听触摸事件：

| Cocos 事件 | 当前处理 |
| --- | --- |
| `TOUCH_START` | 记录第一根手指的 ID 和按下时的横向位置，开始本次拖动。 |
| `TOUCH_MOVE` | 只处理该手指，计算横向位移并更新挡板位置。 |
| `TOUCH_END` / `TOUCH_CANCEL` | 释放该手指的控制状态，结束本次拖动。 |

触点通过 `event.getUILocation()` 获取 UI 坐标，再用挡板父节点的 `UITransform.convertToNodeSpaceAR()` 转换到父节点的局部坐标系，让触点和挡板位置使用相同单位，保证画布缩放后移动距离仍然正确。

每次移动按以下关系计算：

```text
横向位移 = 当前触点 X - 上一次触点 X
挡板新 X = 挡板原来的 X + 横向位移
```

将新 X 限制在 Table 左右边界允许的范围内，然后用 `node.setPosition()` 更新位置，并记录本次触点 X。更新触点记录时不受挡板限位影响，因此触达边界后可以立即反向移动。Y 保持不变，纵向拖动不会移动挡板；按下时只记录触点，不更新挡板位置，因此点按不会让挡板跳到手指下方。

全局输入事件与节点层级无关，也不要求命中挡板节点，因此整张游戏画面都可以横拖，无需按中 2px 细线。组件启用时注册监听，停用时注销监听；进入后台时也释放当前触摸状态。

在 Creator 3.8.6 的浏览器预览中，引擎会将鼠标按下、按住移动和松开模拟为触摸事件，因此手机触摸与预览鼠标拖动可以共用上述代码。业务组件只依赖 Cocos API。

Web 原生 `dragstart / dragover / drop` 提供拖放目标、数据传递等机制；当前挡板通过触摸位移持续控制游戏节点的位置，不使用这套原生拖放机制。

### 球阶段实现（2026-10-07）

`Main.scene` 已挂载 `Ball.ts`，球为纯黑圆形，直径 24 个设计单位，圆形碰撞体半径 12，从 Table 中心发出，方向在整圈均匀随机。原有 Hello 组件已停用。纯水平、纯竖直及接近这些方向的情况直接接受，不筛选或调整方向。

采用 Cocos 自带的 Box2D 2D 物理模块，按用户澄清从简设计：球保持匀速，碰撞按完全弹性碰撞配置，球、墙和 Paddle 的摩擦系数为 0，阻尼为 0，关闭重力；在物理更新后将球的速度向量归一化到固定速度。除此之外沿用引擎默认设置，不引入自定义连续碰撞或反射求解器。固定速度已按用户要求从 480 加倍为 960 个设计单位/秒（按 `PHYSICS_2D_PTM_RATIO = 32` 换算为 Box2D 速度 30 米/秒），可在 Ball 组件的 `speed` 属性调整。

碰撞方向和接触处理使用 Box2D 默认求解精度。弹性系数为 1 仍受默认的低法向速度反弹阈值影响；恢复固定速度只能校正速度大小，不能保证任意擦边角度下数学上严格对称的反射。此处记录从简方案的实际限制，不额外修改引擎阈值。

本阶段不处理球掉落后的判输、计分或重新发球。


球使用默认 Dynamic 刚体；Border 上的三边墙使用 Static 刚体；Paddle 使用 Animated 刚体，将触摸更新的节点位置同步给物理系统，并用实际挡板尺寸更新矩形碰撞体。碰撞体与绘制边界对应，阴影不参与碰撞。球在 `Director.EVENT_AFTER_PHYSICS` 中保留 Box2D 求解后的方向，只归一化速度大小；没有按挡板触点改变出射角的逻辑。

验证：TypeScript 检查与 `git diff --check` 通过。Creator 3.8.6 实际 Box2D 预览中，验证了中心发球、左右与上墙反弹、静止及水平移动的 Paddle 反弹、越过开放下沿和纯水平运动。所测正面/斜向反弹的切向速度误差为 0，物理更新后速度模长误差为 0（测试速度 15 米/秒）。临时验证组件已移除，最终场景仅保留业务组件；加入物理组件后再次验证挡板左右拖动、两端限位和反向移动，最终预览控制台未发现新增 error/warn。预览截图为 `.context/Ball-preview.jpg`。默认阈值附近的擦边碰撞与抖音真机尚未验证。
