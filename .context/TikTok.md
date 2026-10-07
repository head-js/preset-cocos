# preset-cocos：需求与 TikTok 平台调查

记录日期：2026-10-07（Asia/Shanghai）

当前状态：暂停实施，等待后续指令。本次仅整理需求与官方文档调查，尚未验证工程打开、编辑器预览、构建或 TikTok DevTool 运行。

## 需求

### 目标

验证 Cocos Creator 能否作为团队（React/Vue 背景）的小游戏开发框架。只验证开发模式，不做游戏。

### 交付物

一个极简工程骨架，构建后能显示 “Hello Cocos”。

### 范围

- 做：工程目录结构、TS 组件写法（一个 Hello 组件）、构建链路。
- 不做：游戏功能、场景编辑与素材管理、UI、美术、音效。

显示 “Hello Cocos” 所需的最小场景与文本输出属于验收所需；不扩展为场景编辑、素材管理或 UI 系统开发。

### 验收标准

1. Cocos Creator 能打开本工程。
2. 场景中挂上 Hello 组件后，编辑器预览显示 “Hello Cocos”。
3. 构建出 TikTok 国际版小游戏产物，在其开发者工具中显示 “Hello Cocos”。

### 约束

- 交付形态是小游戏，不是 H5 网站。浏览器只是编辑器的预览环境，不是交付目标。
- 代码不得依赖 DOM/BOM：`document`、`window`、`localStorage`、裸 `fetch`。
- 平台相关配置从第一天就是一等公民，不留到最后再切。
- 包体有平台上限，引擎模块裁剪需预留位置。

### 原始阻塞项

Cocos Creator 官方构建平台是“字节小游戏”（抖音）。TikTok 国际版小游戏是否同一构建目标，未验证。此项决定技术选型是否成立，优先级最高。

## 官方文档调查

### 来源一：Cocos Creator 3.2

- 文档：[Publish to ByteDance Mini Games](https://docs.cocos.com/creator/3.2/manual/en/editor/publish/publish-bytedance-mini-game.html)
- 文档版本为 3.2，不代表工程已确定使用该版本。
- 发布流程明确要求在构建面板选择 **ByteDance Mini Game** 并填写 AppID。
- 默认构建输出为 `build/bytedance-mini-game`，包含 `game.json` 和 `project.config.json`。
- 文档要求使用 **ByteDance DevTools** 打开构建目录。
- 账号、开发者平台和开发者工具链接均指向国内字节平台（`microapp.bytedance.com`）。
- 英文正文出现 “TikTok” 字样，但仅凭此不能证明产物兼容 TikTok 国际版。
- 文档中的包体限制和工具版本属于该版本的字节平台说明，不应直接作为 TikTok 国际版的当前约束。

### 来源二：TikTok for Developers

- 文档：[Build Mini Games With Cocos](https://developers.tiktok.com/docs/en/build-mini-games-with-cocos)
- 查询时页面标注最后更新于 **2026-08-28**。
- 官方提供 Cocos 接入 TikTok 小游戏的路线：Cocos 项目先生成基础小游戏产物，再适配 TikTok 运行环境。
- [Step 3](https://developers.tiktok.com/docs/en/build-mini-games-with-cocos#step-3-adapt-the-output-to-tiktok-mini-game-runtime) 的关键表述：

  > If Cocos does not provide a dedicated TikTok mini game build target, use a Cocos build output that is closer to a mini game runtime as the base output, then adapt the package structure, entry, resource loading, platform configuration, and platform API calls according to TikTok mini game requirements.

- 该表述是条件说明，不能据此断言所有 Cocos 版本都不存在专用 TikTok 构建目标。
- 需要核对或适配的内容包括：入口文件、包结构、资源加载、分包配置、平台配置及平台 API 调用。
- TikTok 适配应尽可能保存在 Cocos 项目配置或可重复执行的构建脚本中，避免构建后一次性手工修改被下一次构建覆盖。
- 普通网页或 H5 构建产物不能直接提交为 TikTok 小游戏包。
- DevTool 可验证包导入、基础运行、日志、包检查和代码预检查；TikTok App 真机预览用于验证真实运行环境，两者不能等同。
- 总包、主包、分包等大小需符合 TikTok 当前限制。本次未确认具体数值。

## 调查结论与边界

**已确认：TikTok 官方提供 Cocos 接入路径，Cocos 可以继续作为候选框架。**

**未确认：Cocos 的“字节小游戏”与 TikTok 国际版是否属于同一构建目标，以及字节小游戏产物是否能够直接导入并运行于 TikTok DevTool。**

两份文档支持“基础小游戏构建 + TikTok 适配 + 平台验证”的路线，但不支持“字节小游戏构建产物可直接用于 TikTok 国际版”的结论。

“字节小游戏”可作为待验证的基础输出候选；TikTok 文档没有在上述说明中明确指定必须使用该目标。本次也未通过实际构建确认其适配工作量或兼容性。

因此，最高优先级阻塞项尚未完全解除：官方接入路线已确认，实际构建与运行链路仍需验证，技术选型尚不能认定为通过。

## 后续验证入口（尚未执行）

最小验证链路：

`Hello 工程 → 基础小游戏构建 → TikTok 适配 → TikTok DevTool 显示 Hello Cocos`

后续实施需记录选定的 Cocos Creator 版本、构建目标、可重复执行的适配步骤、TikTok 平台配置、DevTool 版本及运行结果。

当前验收范围仍以用户提出的三项标准为准。TikTok App 真机预览属于官方推荐的进一步运行环境验证，不自动扩展为本次新增验收项。

等待用户后续指令后再开始实施或继续调查。
