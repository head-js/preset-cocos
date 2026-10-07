# 首次无缓存加载：具体下载内容与耗时

分析日期：2026-10-08（Asia/Shanghai）。按用户澄清，本记录只讨论首次无缓存访问，不用缓存访问作对照。只分析，不优化、不调整产物、不实现进度条。

## 核心结论

当前首屏实际下载的项目子资源响应体共 1,228,769 字节，约 1.23 MB；解压后共 5,043,124 字节，约 5.04 MB。这里采用十进制 KB/MB，不含 HTML、跳转响应、favicon 和 HTTP 头。

其中四个文件合计 1,155,551 字节，占实际传输响应体的 **94.04%**：

| 文件 | 内容 | 解压后大小 | 实际压缩响应体 | 传输量占比 |
| --- | --- | ---: | ---: | ---: |
| cocos-js/_virtual_cc-BPqwYeUi.js | 合并的 Cocos 引擎实现 | 3,132.27 KB | 779.82 KB | 63.46% |
| cocos-js/assets/bullet.release.wasm-BWZhVGCB.wasm | Bullet/Ammo 3D 物理运行库 | 469.15 KB | 182.22 KB | 14.83% |
| assets/internal/import/0f/0fcbd05f8.9a806.json | 内置 shader/effect 和材质包 | 1,058.08 KB | 113.12 KB | 9.21% |
| cocos-js/assets/spine-BUh5FZoK.wasm | Spine 骨骼动画运行库 | 201.76 KB | 80.40 KB | 6.54% |
| 其余实际请求的项目子资源 | 入口、加载器、配置、业务脚本、场景等 | 181.86 KB | 73.22 KB | 5.96% |

大文件来源集中在当前构建包含的引擎能力、配套运行库与内置渲染资源。游戏画面简单，并不意味着构建出的引擎只包含这些画面使用的功能。

## 大文件具体是什么

### 引擎合并 JS：779.82 KB 实际传输，是最大项

不是名称为 cc.62b18.js 的约 10.68 KB 入口，真正的引擎代码在其依赖 _virtual_cc-BPqwYeUi.js 中。

实际构建日志 temp/builder/log/web-mobile10-8-2026 10-51.log 的 229–230 行记录：

- engineModulesConfigKey 为 defaultConfig。
- includeModules 包含 2d、3d、animation、audio、custom-pipeline、dragon-bones、graphics、light-probe、marionette、particle、particle-2d、physics-2d-box2d、physics-ammo、skeletal-animation、spine-3.8、terrain、tiled-map、video、webview 等。
- split 为 false，引擎主体被合并。
- LOAD_BULLET_MANUALLY 与 LOAD_SPINE_MANUALLY 都为 false。

项目 settings/v2/packages/engine.json 只记录版本，没有项目级模块选择内容。产物中也能确认 Terrain、ParticleSystem、SkeletalAnimation、MeshRenderer、DragonBones、Box2D 等实现或导出。

因此，即使本场景主要使用 2D Graphics 和 Box2D，首次仍需下载这个包含广泛引擎模块的合并 JS。构建未生成 source map，不能准确给出合并 JS 内每个功能模块各占多少字节；不能拿模块名称出现次数冒充体积分析。

### Bullet WASM：182.22 KB 实际传输

这是 3D 物理运行库。Ball.ts 使用 Box2D 2D 物理，但当前构建另包含 physics-ammo，并默认在启动阶段加载 Bullet。浏览器请求记录证实该 WASM 实际下载，game.init 等待其异步初始化委托完成。

因此它确实属于首屏网络负担，而不是仅存在于输出目录的备用文件。

### 内置资源 JSON：113.12 KB 实际传输，解压后 1.06 MB

解开其 Cocos 序列化结构，共包含 32 个资源项，其中 16 个 cc.EffectAsset、15 个 cc.Material、1 个 cc.PhysicsMaterial。

按 JSON 资源项重新紧凑序列化计数，EffectAsset 共约 1,054.78 KB，材质与物理材质共约 2.66 KB；体积几乎全部来自 shader/effect。顶点 shader 字符串约 439.59 KB，片元 shader 字符串约 352.45 KB，其余为 effect 配置、反射信息等。资源项的重新序列化计数包含项内结构，不代表可直接相加得到独立压缩下载量。

主要资源项（解压后的序列化大小）：

| 内置 effect | 大小 |
| --- | ---: |
| particles/builtin-particle-gpu | 201.62 KB |
| legacy/terrain | 196.01 KB |
| pipeline/deferred-lighting | 167.49 KB |
| particles/builtin-particle | 125.89 KB |
| builtin-unlit | 109.87 KB |
| particles/builtin-billboard | 68.49 KB |
| particles/builtin-particle-trail | 46.83 KB |
| pipeline/planar-shadow | 45.92 KB |

这个包不是球桌图片或网格素材。它包含粒子、地形、延迟光照、阴影、天空盒等内置渲染资源，而且在首屏前由 builtinResMgr.loadBuiltinAssets 加载。配置列出 32 个 builtinAssets，与包内项目对应。

### Spine WASM：80.40 KB 实际传输

这是 Spine 骨骼动画运行库。本场景没有 Spine 动画，但当前构建包含 spine-3.8 且默认自动加载。首次请求记录同样证实该 WASM 实际下载并参与启动等待。

## 哪些文件下载慢

从两次首次无缓存观测分别列出数据。入口为用户确认的 https://head-js.github.io/preset-cocos/ ，该入口会跳转至 https://head.js.org/preset-cocos/ 。第一次直接测最终 HTTPS 地址；第二次从用户指定入口开始，两次页面及子资源相同。

首次无缓存测量采用本机 Chrome、390 × 844 视口、DPR 2，禁用浏览器缓存，不施加网络或 CPU 限速。记录 System.import、game.init 阶段、Main 启动和首帧，同时收集 Resource Timing/CDP。

较慢一次，导航到游戏首帧 23.64 秒：

| 大文件 | 请求总耗时 | 首字节等待 | 收到首字节后的下载时间 |
| --- | ---: | ---: | ---: |
| 引擎合并 JS | 4.73 秒 | 0.41 秒 | **4.32 秒** |
| Bullet WASM | 2.96 秒 | 1.30 秒 | **1.66 秒** |
| 内置 shader/effect JSON | 1.48 秒 | 0.33 秒 | **1.15 秒** |
| Spine WASM | 2.01 秒 | 0.32 秒 | **1.69 秒** |

从用户指定入口开始那次，导航到游戏首帧 11.88 秒：

| 大文件 | 请求总耗时 | 首字节等待 | 收到首字节后的下载时间 |
| --- | ---: | ---: | ---: |
| 引擎合并 JS | 1.92 秒 | 0.35 秒 | **1.57 秒** |
| Bullet WASM | 0.64 秒 | 0.48 秒 | **0.16 秒** |
| 内置 shader/effect JSON | 0.51 秒 | 0.20 秒 | **0.31 秒** |
| Spine WASM | 0.64 秒 | 0.23 秒 | **0.41 秒** |

时间分别取 duration、responseStart-requestStart、responseEnd-responseStart。请求总耗时还可能包含排队等开销；三个数不必精确相加。WASM 请求部分并行，不能直接把表内时间相加当成页面耗时。两次观测相隔不同时间，也不能用页面总耗时相减来计算跳转代价。

引擎主体是传输量最大、单次下载时间最长的明确首要项；Bullet/Spine 和内置 shader 包是后续大项。当前线路下它们的下载确实慢。完整等待还包含小文件首字节时间、多阶段依赖，以及约 2 秒启动图时间，不能把全部 11.88/23.64 秒都当成大文件的响应体传输时间。

## 与业务资源及磁盘产物区分

当前实际请求的 main/index.0da8f.js 解压后 11.79 KB、压缩传输 3.89 KB；Main 场景 JSON 解压后 2.24 KB、压缩传输 0.98 KB。两者合计仅约 4.87 KB 实际传输，占项目子资源传输量约 0.40%。底纹、球桌、球和挡板使用 Graphics 绘制，没有大量图片或音频下载。

输出目录中还有 940.15 KB 的 bullet.release.asm-BkLSQOF6.js、356.24 KB 的 spine.asm-CuMHFj9t.js 等备用实现，但本次支持 WASM 的浏览器没有请求它们。不能把它们算成此次首屏实际下载量。

## 进度条可行性

可以实现。需要在 Web 启动入口显示，才能覆盖这些大文件的下载；只在 Main 场景添加进度条会出现太晚。当前 SystemJS 引擎导入没有现成的统一字节进度回调，适合先显示启动阶段状态；场景资源阶段可使用 Cocos onProgress(finished, total, item)。若要求引擎 JS、WASM 和所有内置资源的真实总字节百分比，需另行设计加载观测/控制。HTML 返回前的跳转与连接等待无法由页面自身显示进度。本次不实现。

原始请求记录与观测脚本暂存于 /tmp/cocos-audit-*.json、/tmp/cocos-loading-audit*.cjs；本文件保存结论与核心数据。
