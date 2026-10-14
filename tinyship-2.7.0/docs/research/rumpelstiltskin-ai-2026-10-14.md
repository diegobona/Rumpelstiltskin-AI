# Rumpelstiltskin AI 竞品调研

调研日期：2026-10-14（Asia/Shanghai）。目标项目：rumpelstiltskin-ai.co；技术约束：复用 Tinyship 的 TanStack Start 应用。

## 结论

建议将第一版定位为「上传照片，成为 Rumpelstiltskin 踮脚舞视频中的主角」的专用 AI 视频工具。优先验证一个固定模板、单人照片和短视频输出，再考虑双角色、宠物和更多场景。

目前能确认的需求包含制作视频、了解梗来源、辨认是否来自电影、寻找模板和配乐。产品可用性与生成效果比模板参数数量更值得优先投入；SEO 页面应围绕这些不同问题提供实际内容。

这是产品方向判断，依据是本次搜索结果及竞品页面，不能据此推断搜索量、收入、转化率或 Google 排名。

## 调研范围与证据边界

- 按 `rumpelstiltskin ai` 检索相关网站，阅读公开产品页、教程和工程自述，检查部分站点 HTML 元数据及 sitemap。
- 用户明确要求 Google 搜索。直接请求 Google 搜索页（英文、美国地区参数及普通网页模式）仅返回跳转提示，搜索工具不能读取该页；浏览器入口也因连接错误不可用。因此本报告是相关网站核查，**不能声称是 Google 实时前十或按其排名整理的结果**。
- 未获得浏览器截图或完成按钮交互测试。下面的布局与配色观察来自公开 HTML / CSS，不代表实际屏幕审核。
- 不登录、不上传个人照片、不付费、不触发生成。因此输出规格、生成速度、退款和隐私等属于各站公开承诺，没有被独立实测。
- 没有获得可验证的 Google 搜索量、难度、增长曲线和排名数据。
- 本地框架检查仅阅读源码，没有启动应用、验证 API 凭证或修改应用功能。

## 关键词是什么

在这次检索中，`rumpelstiltskin ai` 主要指一个复古奇幻风格的 AI 视频梗：小个子角色在草堆场景中做出嘘声、踮脚和跳舞动作，旁边有人观看。传播版本常搭配 RiFF RAFF 的歌曲，并通过 AI 替换人物。Know Your Meme 将它与 1987 年真实电影区分，并记录了 Instagram 原帖及后来的 TikTok 改编。[梗来源记录](https://knowyourmeme.com/memes/ai-rumpelstiltskin-tip-toein-in-my-jordans)

不能将裸词 `rumpelstiltskin` 的全部流量都算作 AI 工具需求：它还对应童话人物、电影及其他角色版本。

| 意图 | 可承接的词与问题 | 页面用途 |
| --- | --- | --- |
| 直接制作 | rumpelstiltskin ai generator / video / dance | 主工具页 |
| 学习制作 | how to make rumpelstiltskin ai video / template / prompt | 教程及模板说明 |
| 了解来源 | is rumpelstiltskin ai / meme origin / 1987 | 有来源的解释页 |
| 记得歌词 | tip toeing in my jordans ai / tiptoe meme | 梗与歌曲说明，链接回生成器 |
| 判断效果 | examples / one photo / two photos | 输入照片与完整输出对照 |

这些是内容分组建议，不是经过搜索量工具验证的关键词清单。

## 独立站怎么做

下表为页面公开展示的功能及美元标价；同名域名容易混淆，链接均指向实际检查的站点。

| 网站 | 输入与输出 | 收费 / 转化设计 | 值得观察的点 |
| --- | --- | --- | --- |
| [rumpelstiltskin-ai.net](https://rumpelstiltskin-ai.net/) | 1 张照片；两种场景；仅脸与头发 / 保留整个人物外观；8 秒、9:16、480p 或 720p、静音 | 500 积分 $4.99，标清 220 积分、高清 460 积分；无免费生成 | 工具直接出现在首页，展示同一输入在不同模板和模式下的结果 |
| [rumpelstiltskinai.app](https://rumpelstiltskinai.app/) | 1 张照片；免费静态肖像预览；付费生成 12 秒视频 | $4.99 / 1 次，$9.99 / 3 次；预览需 Google 登录，页面承诺一次免费重做 | 先帮助用户判断人脸像不像，再出售动画；静态预览不能证明视频中的一致性 |
| [rumpelstiltskin-ai.app](https://rumpelstiltskin-ai.app/) | 舞者照片必选，第二角色可选；10/20/30 秒、720p/1080p、横竖版；静音或原创配乐 | 首个 10 秒 720p 视频 $8.99；新账户可看前 5 秒预览 | 参数丰富；单人、双人、宠物示例均配有独立示例页 |
| [rumplestiltskinai.com](https://rumplestiltskinai.com/) | 1 或 2 张照片；13 秒、720p、16:9；页面注明 Seedance 2.0 | $6.99 / 1 次，$14.99 / 3 次，$39.99 / 10 次；邮件交付 | 单双人同价，首屏直接展示套餐和输入到输出对照；域名采用另一种拼写 |
| [airumpelstiltskin.app](https://airumpelstiltskin.app/) | 2 张照片，分别扮演舞者与观看者；15 秒、16:9、静音 | 标清 $6.99，高清 $9.99；积分包 | 固定双角色和场景，几乎无需用户配置；教程、prompt、电影辨析页回链工具 |
| [RumpelMeme](https://rumpelmeme.com/) | 可选择舞者、观看者或两个角色；10 秒、720p | $7.99 / 次；另有免费文字模板编辑器 | 同时承接免费做梗图和付费视频；首页长样片被明确标为多段素材剪辑研究，并非购买流程的完整输出证据 |
| [rumpelstiltskin-ai.com](https://www.rumpelstiltskin-ai.com/generator) | 固定舞者放入用户背景照片 / 视频；也有文字生成新场景和人物替换路线 | 背景合成有免费水印预览，$4.99 / 30 积分可解锁一个；另售 AI 重绘 | 预制舞者素材复用，导出 MP4、GIF、贴纸、透明与绿幕版本；是不同于每次重新生成整段视频的路线 |

额外对照：

- [rumpelstiltskinai.video](https://rumpelstiltskinai.video/) 的首页公开写明第二角色仍为 beta，可能替换失败，末尾可能出现上传照片的静态画面；12 秒 480p 需 100 积分，起步包 $9.99。说明双人替换需要单独验证，不能仅因界面有两个上传框就认定功能可靠。
- [rumpelstiltskinaigen.com](https://rumpelstiltskinaigen.com/) 当前页面显示生成和结账不可用，并说明样片舞步不是原梗动作的精确复现。搜索摘要曾展示另一版样片说明；本报告以本次打开页面为准。

## 页面与商业模式的共同点

源码布局对照：[rumpelstiltskin-ai.net](https://rumpelstiltskin-ai.net/) 以浅灰绿底、白色圆角卡和深青色按钮组织首页，H1 后直接出现完整工具；[rumpelstiltskinai.app](https://rumpelstiltskinai.app/) 使用衬线标题，桌面布局为左侧介绍与入口、右侧视频，移动端改为顺序排列。后者 SSR 中的上传与视频按钮带 disabled，需要浏览器 hydration 后才能判断实际可交互状态，本次未能验证。

常见路径是：看示例 → 上传照片 → 登录 → 购买视频次数或积分 → 等待任务 → 预览 / 下载。付费点有差异：有的先收费生成，有的先提供静态预览，有的提供截断视频或水印合成预览。

本次独立站样本多数强调一次付款和无订阅。不能直接比较各站「积分」数字，因为它们的单价及每次消耗不同；应换算相同输出规格的实际美元成本。

首页通常将生成器、效果示例、三步教程、价格和 FAQ 放在同一页。针对照片型生成器，比单独放原梗视频更有说服力的证据是「输入照片 + 未剪辑完整输出 + 参数说明」。RumpelMeme 的剪辑示例和第二角色 beta 页面也说明，展示素材与实际交付能力需要分开判断。

## 综合平台怎么做

| 平台专页 | 页面公开功能 | 成本与引流方式 |
| --- | --- | --- |
| [MakeViral](https://www.makeviral.ai/templates/ai-rumpelstiltskin-dance) | 1 图或 2 图；提供参考片替换、整个人物替换和新舞蹈生成；默认 15 秒、720p、16:9 | 默认 228 积分；[定价页](https://www.makeviral.ai/pricing) 中覆盖该次消耗的最小一次性包为 $39.99 / 450 积分；长模板说明页与简化制作页分开 |
| [FYPNova](https://fypnova.ai/rumpelstiltskin-ai) | 1 张照片，15 秒、16:9、含声音、无水印 | 60 积分 / 次；[一次性包](https://fypnova.ai/pricing) 为 $14.90 / 60 积分；一个趋势对应一个专页，并互链其他趋势 |
| [ImagesArt](https://imagesart.ai/rumpelstiltskin-ai-video-generator) | 1 图与可选第二角色、人或宠物、横竖版；重新生成舞蹈，配 AI 原创音乐 | 注册 15 免费积分，可试一次 4 秒 480p Lite；Standard 5 秒 59、10 秒 117 积分；首页提供样例、操作步骤和价格 |

各平台的最低通用模板价不能直接作为这个梗模板的价格。例如 FYPNova 宣传的最低每视频价对应其他低消耗模板，需要按这个模板的 60 积分计算。

本次精确关键词与限定域名检索未查到 Clipfly、DreamFace、Pollo、insMind、flux1 的可确认专页。这是检索范围内未查到，不是证明它们没有相关功能。

此外能查到 Rumpelstiltskin 角色聊天页面，但与舞蹈视频梗是不同产品需求；本项目首页不宜同时混入角色聊天定位。

## SEO 的实际做法

本次直接请求公开 sitemap 得到以下条目数。它们是站点提交的 URL 数量，不代表已收录或有排名。

| sitemap | 条目数 | 内容组织 |
| --- | --- | --- |
| [rumpelstiltskin-ai.net/sitemap.xml](https://rumpelstiltskin-ai.net/sitemap.xml) | 135 | 多语言版本，加教程、1987 电影辨析、定价及其他舞蹈工具 |
| [rumpelstiltskin-ai.app/sitemap.xml](https://rumpelstiltskin-ai.app/sitemap.xml) | 10 | 3 个示例页、定价、故障排查、教程、歌曲关键词与电影问题 |
| [rumpelstiltskinai.app/sitemap.xml](https://rumpelstiltskinai.app/sitemap.xml) | 15 | 英文与少量中文、来源、真实电影、演员对照、歌曲与教程 |
| [rumpelmeme.com/sitemap.xml](https://rumpelmeme.com/sitemap.xml) | 30 | 工具、示例、多个有具体场景的模板页及来源 / 歌曲解释 |

公开 HTML 检查还确认，前三个照片型站点与 RumpelMeme 都提供主词标题、description 和 canonical；部分站点有 FAQPage、WebApplication / SoftwareApplication 和 VideoObject 等 JSON-LD。结构化数据的存在不能证明搜索引擎会显示富结果。

对本项目，首批内容建议：

1. 主工具页：`Rumpelstiltskin AI Video Generator`，围绕一个可靠模板承接制作需求。
2. 完整生成示例页：说明上传照片、分辨率、时长及实际结果。
3. 制作教程页：照片要求、操作步骤、如何添加平台配乐。
4. 梗来源与 1987 电影辨析页：给出可核查来源，避免误称这部真实电影不存在。
5. `Tip Toeing in My Jordans` 解释页：承接记得歌词的用户，链接回制作入口。
6. 清晰的定价页：可购买次数、输出规格和失败后的处理方式。

先把英文内容和真实输出做完整；是否扩展语言及更多页面，待实际访问和转化数据出现后决定。

## 生成技术的启示

公开页面体现至少三种路线：参考视频驱动的人物替换、人物与场景参考图加预设分镜生成、预制舞者与新背景合成。

[CreateFaceless 的工程自述](https://createfaceless.com/en/blog/how-we-built-rumpelstiltskin-ai) 提供了较具体的第二种路线：先用照片与服装素材制作人物静态参考，再将人物及场景参考送入视频任务，最后通过 FFmpeg 完成裁切、格式和影片风格处理。它说明身份漂移、镜头变化与舞步控制是不同的问题，并承认技术有效的 MP4 仍可能表演不佳。这是产品方的开发记录，不是本次独立测试或对所有照片的质量证明。

不能把普通首帧图生视频直接等同于可精确复刻原梗的工具。下一阶段应先比较真实输出：脸是否稳定、动作是否可识别、全身及脚步是否完整、第二角色是否正确，以及失败和重试后的平均成本。模型名称与参数需要按准备使用的供应商实际接口核实，不能只照抄竞品标注。

## 本地 Tinyship / TanStack Start 适配情况

现有应用在 `apps/tanstack-app`。源码已有 TanStack Start / Router、React、Vite，以及以下可复用能力：

| 能力 | 源码位置 | 用途 |
| --- | --- | --- |
| 登录 | `libs/auth/auth.ts`、`src/routes/api/auth/$.ts` | Better Auth、邮箱及社交登录 |
| 付款 | `libs/payment/index.ts`、TanStack payment API | Stripe、Creem 等 adapter；已有发起支付和 webhook 路由 |
| 积分 | `libs/credits/service.ts`、`config/credits.ts` | 数据库余额及流水、扣费和退款 |
| AI 视频 | `libs/ai/video.ts`、`config/aiVideo.ts`、`src/routes/api/video-generate/` | 供应商 adapter、任务创建与状态查询 |
| 上传存储 | `libs/storage/`、`src/routes/api/upload.ts` | OSS / S3 / R2 / COS；现有图片上传流程 |
| 页面内容 | `src/routes/$lang/`、`src/lib/seo.ts` | 首页、定价、博客、基础 title / description |

其中 `src/` 路径均相对 `apps/tanstack-app/`。本次只核查源代码存在，不代表环境已配置或外部服务可用。

需要补齐的关键点：

- **任务持久化与补偿。** `libs/ai/video-task-store.ts:24` 使用进程内 Map，任务 TTL 为 24 小时；异步状态和退款依赖用户请求状态接口。正式产品需要数据库任务记录、独立于页面轮询的任务更新，以及持久化的扣款 / 退款幂等信息，才能恢复页面关闭和运行实例变化后的任务。
- **模板专用输入。** 将通用 prompt / 模型选择界面替换为照片、角色与少量产品参数；参考视频或多图输入能力需核实 adapter 和供应商接口。
- **完整 SEO。** 当前 `src/lib/seo.ts` 只有基础 metadata；本次搜索未找到 TanStack 应用中的 canonical、hreflang、OG、JSON-LD、robots 和 sitemap 实现。博客详情还需按文章输出可读取正文与独立 metadata。
- **交付存储。** 生成结果应有可恢复的「我的视频」记录和稳定下载地址，不能仅依赖前端状态或供应商短期 URL。

## 建议的第一版

英文首页采用复古奇幻主题，在首屏并列放「真实视频示例」与「上传照片」入口。主流程先做单人舞者、一个固定模板、明确时长和分辨率、异步进度、历史记录及 MP4 下载；第二角色在实测通过后再开放。

商业模式优先一次购买或小次数包。静态免费预览可以作为候选方案，但必须先验证它与最终视频的相似度及成本；不要在模型路线未验证前承诺免费完整视频或稳定双人替换。

下一阶段最有价值的工作是验证生成路线并制作若干可公开的真实样片，然后基于已有 auth / payment / credits / storage 完成 TanStack 工具站。页面与产品文案应跟随实际交付能力。
