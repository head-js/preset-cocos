# 当前任务：双球领域实例与顺序发射

记录日期：2026-10-12（Asia/Shanghai）

状态：已完成实施与 Creator 3.8.6 预览验收。双球顺序发射、碰撞过滤、完整圆形碰撞、自转、统一符号外观与 SpriteFrame 入口均已验证。验收数据与边界见文末。

## 已确认需求

1. 场景中发出两个球：第一个显示 `✖️`，第二个显示 `➕`。
2. 第一球发出后，间隔 **0.5 秒**发出第二球；间隔作为可调参数。
3. 第二球的显示样式和物理性质与第一球相同，仅图案不同。
4. 两球相互穿过，不产生球间碰撞；两球均与上、左、右墙及挡板碰撞。
5. 两球仍使用完整圆形碰撞体，透明区域参与对墙和挡板的碰撞；初始角速度和无摩擦自转规则沿用当前实现。

## 当前基线与范围

以当前代码和上游最新调整为准，不采用旧方案中的半径 12：

| 参数 | 两球共用值 |
| --- | ---: |
| 半径 | 48 设计单位 |
| 直径 / Ball UITransform | 96 / 96 × 96 设计单位 |
| 可见图案目标尺寸 | 64 × 64 设计单位（直径的 2/3） |
| 固定线速度 | 960 设计单位/秒，即 30 米/秒 |
| 初始角速度 | +90°/秒，即 +π/2 弧度/秒，逆时针 |
| 发射位置 | 每次发射时的 Table 世界坐标中心 |
| 发射方向 | 两次分别独立、整圈均匀随机 |
| 摩擦 / 恢复系数 | 0 / 1 |
| 重力 / 线阻尼 / 角阻尼 | 0 / 0 / 0 |
| 发射间隔 | 0.5 秒游戏时间 |

继续使用 Creator 3.8.6、Box2D 和 800 × 1440 竖屏画布。球桌下沿开放，球越过下沿后继续沿用现状，不判输、不计分、不重发。即使第一球在 0.5 秒前越过下沿，第二球仍按时发射。

本次仅实现固定两球与顺序发射，不增加波次、对象池、球数配置、关卡、球集合领域框架或通用素材管理器。保留未来 SpriteFrame/PNG 显示入口；已修复宽高比与透明边距处理，使用 originalSize 等比缩放并设置 trim = false。先验收 Creator 内部预览，不自动构建、修改 docs、推送或发布，不验证抖音平台。

## 领域职责

### BallModel：每个球一个独立实例

复用 `assets/scripts/domain/BallModel.ts`，不增加 CrossBall、PlusBall 子类。两个实例分别拥有自己的模型和最近运动方向，共用同一份参数定义。

- 半径、固定移动速度、初始角速度及速度归一化规则继续属于模型。
- 每次发球角度由 Ball 组件随机采样后传入模型；不要求两个角度不同，也不排除水平、竖直方向。
- 两球不共享可变方向或速度对象。一个球的反弹和零速回退不影响另一个球。
- 实时位置、旋转和碰撞求解由各自的 Box2D 刚体维护。
- 符号、字体、SpriteFrame 和资源 UUID 属于显示层，不进入 BallModel。
- 发射间隔是场景编排参数，不放入单球模型。当前固定两次发射，无需另建领域调度模型。

### Ball：模型与物理适配

保留当前 Ball 生命周期与线速度校正方式：

1. onLoad 用 Prefab 参数创建独立 BallModel，初始化显示，创建 Dynamic 刚体和完整圆形碰撞体。
2. start 将球放在 Table 中心，独立采样初始方向，设置线速度与一次性的初始角速度。
3. 每次物理更新后，仅将自己的线速度归一化为固定模长；不覆盖角速度、不手动转动节点。
4. 停用时移除物理更新监听。

Ball 不负责发射其他球，不保存“第几个球”，不新增等待状态。两个球的刚体、碰撞体和模型均独立，只有参数来源相同。

## 同一 Prefab 复用

用户确认当前保留 Prefab（2026-10-12）。Prefab 是 Cocos 可序列化的节点模板，用于统一两球的组件、参数和素材引用，并方便在编辑器中调整；它是常见引擎功能，不是强制规范，也不是领域模型。普通代码工厂或 JSON 配置也可以实现，本阶段沿用现有方案。两球行为相同、仅符号不同，无需新增继承子类。

当前只有两个球，不以 Prefab 的性能收益作为选型依据：实例化仍需创建节点、组件和物理对象，代码创建也能共享素材。未来若频繁创建、销毁大量球，再按实际测量考虑对象池；对象池可配合 Prefab 或代码工厂，本次不引入。

新增 `assets/prefabs/Ball.prefab`，从当前场景中的 Ball 节点整理而来：

```text
Ball（Prefab 根节点，保存为 inactive）
  UITransform                  96 × 96，锚点 (0.5, 0.5)
  Ball                         radius 48 / speed 960 / initialAngularSpeed 90
  BallView                     symbol 默认 ✖️，spriteFrame 空，共享 BallSymbols 字体

运行时初始化后：
Ball
  RigidBody2D + CircleCollider2D
  Visual                       Label 或未来 Sprite
```

Prefab 不引用场景中的 Table，Ball.table 保存为空，发射器在启用实例前注入。保持 Ball 和 BallView 脚本的原有 UUID；新 Prefab 和目录、脚本的 `.meta` 由 Creator 导入生成并纳入版本管理。

模板保存为 inactive，以确保每次实例化后先配置引用、符号和渲染层，再启用并执行 onLoad/start。业务中不要直接把未配置的 Prefab 实例激活到场景中。

物理参数集中保存在这一份 Prefab 中，发射器不复制 radius、speed 或 initialAngularSpeed。Ball 脚本保留与 Prefab 一致的合理默认值；创建运行球时以 Prefab 序列化值为准。

## BallLauncher：两次发射编排

新增 `assets/scripts/BallLauncher.ts`，挂载在 Canvas 下独立的 BallLauncher 节点。

Inspector 属性：

| 属性 | 类型 / 默认值 | 用途 |
| --- | --- | --- |
| ballPrefab | Prefab | 统一球模板，必须绑定 |
| table | UITransform | 引用场景 Table，必须绑定 |
| launchInterval | number / 0.5 | 两次发射间隔，有限正数，单位为秒 |

发射流程：

1. start 校验引用与间隔，立即执行 `spawnBall('✖️')`。
2. 使用 Cocos `scheduleOnce` 在 launchInterval 后执行一次 `spawnBall('➕')`。
3. 第二次执行完后不继续安排发射，本次只创建两个实例。

spawnBall 的顺序：

1. `instantiate(ballPrefab)`，实例根节点保持 inactive。
2. 取得 Ball 与 BallView；注入 Ball.table，设置 BallView.symbol，默认保持 spriteFrame 为空。
3. 实例命名为 BallCross 或 BallPlus，赋予与 Canvas 一致的 UI 渲染层。
4. 作为 Canvas 的直接子节点加入场景，父节点缩放保持现状；两球与 Table、Paddle 同级。
5. 设置 active = true，触发当前 Ball 初始化和 start 发球。

启动初始化显示时，BallView 已得到对应符号，无需在生成 Label 之后再改字符串。未来 PNG 仍由显示层处理，不改变发射器或领域模型。

调度使用游戏时间：保留 Cocos scheduleOnce，并跟踪剩余游戏时间。监听 Game.EVENT_PAUSE / RESUME，暂停时取消计时回调，恢复时按剩余时间重新安排，忽略首个恢复帧的 dt；Creator 3.8.6 短暂停恢复时该 dt 可能包含暂停的墙钟时间。业务代码不使用 DOM/BOM 的 setTimeout 或按系统时钟补发。实际第二次发球发生在达到 0.5 秒后的可执行游戏帧，以游戏帧粒度验收。

onDisable 显式取消待执行的第二次发射回调。已发射的球继续由自己的组件管理；重新启用发射器不重发、不补发被取消的任务。重新开始这一轮通过重新加载场景完成，不额外引入重启功能。

## 场景改动

Main.scene 移除原有直接运行的单球节点，替换为 BallLauncher 并保存 Prefab、Table 与间隔引用，避免原单球与发射器同时工作而出现第三个球。

```text
Canvas
  Background
  Table
    Border
  Paddle
  BallLauncher                 挂载 BallLauncher，引用 Ball.prefab 与 Table
  Camera
  BallCross                    运行时首次发射生成
  BallPlus                     运行时 0.5 秒后生成
```

无需手工挂载运行实例，打开 Main.scene 后直接预览即可依次发射两个球。

## 碰撞分组与矩阵

使用 Box2D 的碰撞过滤实现球间穿透，不通过接触回调临时关碰撞或自己计算反射。

当前墙与挡板使用默认组。保持这一组作为场景碰撞组，新增 Ball 组（使用未占用的 bit，本工程当前建议 index 1，即 1 << 1）：

| 组对 | 是否碰撞 |
| --- | --- |
| Ball ↔ Ball | 否 |
| Ball ↔ DEFAULT（墙与挡板） | 是 |
| DEFAULT ↔ DEFAULT | 沿用原有设置 |

若 index 0 为 DEFAULT、index 1 为 Ball，当前矩阵对应 DEFAULT mask = 3、Ball mask = 1；这是组位掩码，不是渲染层。

- 碰撞组及对称矩阵保存在 settings/v2/packages/project.json 的 physics 字段。原先放入 physics.json 的设置没有被加载，已移除；已确认预览 settings.js 和实际 fixture 过滤值均正确，在创建墙和球的 fixture 之前生效。
- Ball 创建的刚体和圆形碰撞体统一使用 Ball 组，分组必须在 fixture 初始化/应用前配置完成。
- 墙和挡板继续使用 DEFAULT，验证双向过滤均允许它们与 Ball 碰撞。
- 不仅在发射器 start 临时修改矩阵：已经创建的 fixture 可能仍保留旧 mask，不能依靠只改运行时矩阵保证过滤正确。
- Creator 3.8.6 的实际 settings 存储文件与字段以编辑器写入结果为准，实施后检查加载值与实际 fixture 过滤值。

完整圆形碰撞与素材透明度仍无关；球间穿透仅来自分组，不代表透明区域对墙或挡板失去碰撞能力。

## 相同显示样式

BallView 继续提供符号与未来 SpriteFrame 两条显示路径。两球默认均使用 Label，保持相同字体、黑色设置、透明背景、居中方式和可见尺寸目标，Visual 随父球旋转。

已导入共享 BallSymbols.ttf 单色字体（从 Noto Emoji 提取两种符号并统一字形尺寸，SIL OFL 1.1，附来源和许可证）。两球使用相同 Font、64 字号/行高及 71 × 64 的 Label 布局，使用文字呈现选择符 FE0E，避免系统彩色 emoji 忽略黑色设置。两种图案已按以下要求验证：

- 目标图案尺寸约 64 × 64，不因 SHRINK 或字符宽度差异使第二球显著变小。
- 两种图案在圆心居中，完整落在半径 48 的碰撞圆内，无裁切。
- 相同字体与颜色设置还需对应相同实际颜色；系统彩色 emoji 可能忽略 Label.color。实际颜色不一致时，应统一两种符号的字体/文字呈现方式，而不是仅记录成已通过。
- 需要字符度量修正时，只在 BallView 中使用统一的布局计算或明确的显示参数，不修改各球半径、父节点缩放或物理属性。
- 两种不同图案在旋转后可能出现相似方向，这是图形对称性的正常结果，不据此改变随机方向或角速度。

当前没有要求新增正式 PNG，也不新增按符号分支的物理逻辑。未来切换 PNG 应继续只改显示资源。

## 文件清单与实施顺序

| 文件 | 计划改动 |
| --- | --- |
| `assets/prefabs/Ball.prefab` 及 `.meta` | 新增共享球模板，保存统一参数，根节点 inactive。 |
| `assets/scripts/BallLauncher.ts` 及 `.meta` | 新增两次发射与 Cocos 调度。 |
| `assets/scripts/Ball.ts` | 添加球碰撞组配置；保留独立模型、中心随机发球与恒速、自转规则。 |
| `assets/scripts/BallView.ts` | 复用显示实现，按两种符号的实际度量修正必要布局与颜色一致性。 |
| `assets/scripts/domain/BallModel.ts` | 原则上复用，不为两球新增类型或全局共享状态。 |
| `assets/scenes/Main.scene` | 移除原单球，挂载 BallLauncher，保存必要引用和间隔。 |
| `settings/v2/packages/project.json` | 保存 physics 碰撞组与矩阵，已确认预览实际加载。 |
| `assets/fonts/` 及目录 meta | 共享符号字体和 SIL OFL 1.1 许可证；来源与字体说明记录在 Douyin.md。 |
| `.context/current-task.md`、`.context/Douyin.md` | 实施后记录实际结果及尚未验证项。 |

顺序：先设置碰撞矩阵，再建立 Prefab 和发射器，更新场景引用，然后确认两种符号显示一致，最后进行静态检查及实际预览验收。只在实施完成后更新验收状态。

## 验收标准

1. Main.scene 可直接预览，所有 Prefab、脚本和 Table 引用解析正常，无需人工创建或挂载球。
2. 首次发出 ✖️，0.5 秒游戏时间后发出 ➕；总共只有两个运行球，不保留第三个原单球。各自在发射时从 Table 中心独立随机出发。
3. 第二次发射前不存在可见或可碰撞的第二球。暂停期间不提前发射；停用发射器可取消尚未执行的第二次发射，重新启用不产生重复球。
4. 两球模型是不同对象，运动方向与速度回退状态独立；一个球反弹不修改另一个球的模型。
5. 两球 radius = 48、速度 960、初始角速度 +90°/秒及其他物理配置完全一致；两个显示图案透明、居中、大小和实际颜色一致，落在完整碰撞圆内。
6. 临时安排两球对向或交叉经过，确认球间无碰撞冲量、无方向改变；另验证两球各自与上、左、右墙及挡板反弹，排除把所有碰撞一起禁用的错误。
7. 物理更新后的速度模长保持 30 米/秒；自转持续、不会被恒速校正重置；圆形透明区域仍可触发与墙和挡板的接触。
8. 挡板横拖、两端限位及开放下沿行为保持现状，不增加判输、重发或其他机制。
9. TypeScript 与 `git diff --check` 通过，资源 `.meta` 完整；无需新测试框架。静态检查确认模型无 `cc`/DOM/BOM 依赖，碰撞矩阵和 Prefab 引用正确。
10. 复用现有 Creator 进程与预览服务进行实际验收。可用临时确定性发射方向、物理轮廓和日志辅助测量，结束后恢复默认随机规则并清理临时代码/资源；保存双球画面与实际发射间隔的验证记录，最终预览无新增 error/warn。

## 实际验收结果（2026-10-12）

在 Creator 3.8.6 内部预览、Box2D、360px 宽竖屏视口中使用临时确定性验证组件，完成后移除组件、测试贴图和临时节点，正式代码保留两次独立随机发射。

| 验收项 | 实际结果 |
| --- | --- |
| 两球与独立模型 | 仅主发射器生成两个球，BallModel 为不同对象；0、π/2 发球、(3,4) 归一化、零速回退和无效参数断言通过。 |
| 正常发射间隔 | 采样约 0.517–0.533 秒，包含调度与采样帧量化；目标为 0.5 秒游戏时间。 |
| 暂停恢复 | 发射前暂停 750ms 墙钟时间，期间保持一球；恢复后按剩余游戏时间发射，累计游戏时间间隔约 0.515 秒。 |
| 停用与重新启用 | 辅助发射器仅生成第一球，停用取消第二次，重新启用不补发或重发；测试总数 3 = 主发射器 2 + 辅助发射器 1。 |
| 实际碰撞过滤 | 球 categoryBits=2 / maskBits=1，三墙与挡板 categoryBits=1 / maskBits=3；矩阵 DEFAULT=3、Ball=1。 |
| 球间穿透 | 两球对向经过，最小采样中心间距约 8（小于直径 96），速度方向不改变。 |
| 环境反弹 | 两球分别通过左、右、上墙，以及静止、水平移动挡板反弹；符号之外的透明圆形区域仍能反弹。 |
| 速度与自转 | 物理更新后线速度模长 30m/s，最新采样最大误差 0；角速度 π/2 rad/s 持续，最新采样最大误差 0，自转角位移与采样时长相符。 |
| 外观 | 两球 fontSize / actualFontSize 均为 64；共享字体呈黑色、透明、居中、无裁切。360px 宽截图墨迹约为 ✖ 28×29px、➕ 27×29px，差异来自不同字形和像素取整。 |
| SpriteFrame 入口 | 临时 32×16 原图、20×8 裁切区域，Visual 为 64×32、trim=false、圆形碰撞半径仍为 48；等比和原图透明边距保留。 |
| 交互与下沿 | 实际鼠标横拖验证挡板左右限位、到达边界后反向；开放下沿允许球离开，不判输或重发。 |
| 静态检查 | TypeScript、git diff --check、场景/Prefab UUID 与 meta 完整性检查通过；领域模型不依赖 cc/DOM/BOM。 |

清理后的正式随机预览已重新加载，无新增 error/warn，也无 DOUBLE 验证日志。

证据：Double-ball-verification.json 保存物理验证日志；Double-ball-lifecycle.json 保存最终暂停、取消及贴图验证日志。Double-ball-preview.png 为诊断画面：验证末尾将两球设为角度 0、位置 x=±100 / y=200 后暂停，以便对比字体大小和居中；正式发球仍随机。

## 验证边界

双球完整物理验收基于 Creator 内部浏览器预览与上述采样场景。Box2D 默认低法向速度反弹阈值等限制继续沿用，未穷尽擦边角度。跨设备字体布局、抖音真机、多指输入和抖音平台素材加载未验证。

## 后续 Web 构建打包（2026-10-12）

用户在实施验收后授权构建打包，沿用 npm run build:web 的 web-mobile 配置，已更新 build/docs 与根目录 docs。Creator 日志明确显示 build success，CLI 返回已知退出码 36，包装脚本确认入口存在并复制产物后返回 0。构建脚本新增复制字体许可证到 licenses/BallSymbols-OFL.txt；字体文件与原始资产一致，碰撞矩阵 DEFAULT=3 / Ball=1 正确进入构建设置。

用户明确当前为 Web 项目，交付产物是根目录 docs，不生成额外压缩包。最终 docs 包含 23 个文件，共 2,213,264 字节；build/docs 仅作为构建中间目录，与 docs 文件内容一致，docs 额外保留 .nojekyll。TypeScript 与构建脚本语法检查通过。

.gitignore 的 native/ 已改为 /native/，只忽略根目录的原生生成物，确保 docs 内的字体目录能够随发布产物提交。

本地 HTTP 实际运行 Web 产物，确认画布、两种符号和字体加载，以及挡板横拖；控制台没有 error/warn。本轮为打包后的基本运行检查，不重新执行全部确定性物理测量。证据见 Web-double-ball-build.json 和 Web-double-ball-preview.png。未推送、发布线上或构建抖音平台包。
