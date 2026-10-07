# preset-cocos

Cocos Creator 3.8.6 的竖屏 2D 挡板弹球工程。

## Web 构建

```bash
npm run build:web
```

需要本机安装 Creator 3.8.6；默认使用 `/Applications/Cocos/Creator/3.8.6/CocosCreator.app/Contents/MacOS/CocosCreator`，也可通过 `COCOS_CREATOR_BIN` 指定可执行文件。

脚本读取 `build-config/web-mobile.json`，先构建到 `build/docs`，成功生成入口后替换仓库根目录的 `docs`，并创建 `.nojekyll` 以供 GitHub Pages 使用。最终发布目录为 **`docs`**。

当前 Web 项目的交付产物是根目录 `docs`；`build/docs` 为构建中间目录，不额外生成 ZIP 压缩包。

构建脚本同时将符号字体的 SIL OFL 1.1 许可证复制到 `docs/licenses/BallSymbols-OFL.txt`，随 Web 产物一起分发。

`.gitignore` 仅忽略根目录 `/native/`；`docs/assets/**/native/` 内的字体等发布资源应随 `docs` 一起提交。

## 引擎模块

`settings/v2/packages/engine.json` 定义 `paddle-2d` 模块配置，Web 构建通过 `engineModulesConfigKey` 明确选择它。保留基础运行、WebGL/WebGL2、2D/UI、Graphics、2D 相交检测、Box2D 和现有渲染管线；当前不包含 3D、Bullet、Spine、DragonBones、地形、粒子等功能模块。

Creator 3.8.6 会根据 `modules.configs.paddle-2d.cache` 中的功能开关重新生成 `includeModules`。手动调整配置时需同步开关和名单；组合选项还需设置 `_option`，例如 `physics-2d` 选择 `physics-2d-box2d`。新增功能若依赖已关闭的模块，应先启用相应模块，再构建并验证。
