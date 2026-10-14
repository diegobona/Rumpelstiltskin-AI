# 上线前用户体验检查（2026-10-14）

范围：首页、六个主题内页，以及由这些页面进入的认证、法律和生成操作。使用 Edge 浏览器检查桌面与 390px 手机布局；以本地 Cloudflare 构建预览 `http://127.0.0.1:7002` 为验收环境。本次未部署、未执行远程迁移、未发起新的付费视频任务。

后续更新：用户已改为免登录免费生成一次，以下“登录后才能上传”“页头显示积分”为此前验收记录。当前行为与最新验证见 [免登录试用实现](anonymous-video-trial.md)：免注册选图和生成，注册继承次数，已用后禁止第二次；114 项单元测试、42 项 E2E 和 6 项真实认证/本地 D1 检查通过。部署前新增迁移 0007 也必须应用。

## 已修复

| 用户会遇到的问题 | 最终行为 |
| --- | --- |
| 选完照片才发现必须登录，跳转后照片丢失 | 工具顶部先说明登录要求；登录后才可选择照片，返回原工具页 |
| 未配置的 Google/GitHub/手机/微信入口仍可点击 | 服务端按真实配置输出可用入口；不可用的直达页面提供邮箱登录入口 |
| 登录、注册、找回之间切换丢失返回地址 | 保留经过校验的站内 returnTo；拒绝外部跳转 |
| 注册表单要求无关的头像 URL；已登录仍只有 Sign in | 简化为姓名、邮箱、密码；页头显示账户、余额与退出 |
| 未配置发信却展示重置密码发送表单 | 明确说明自动重置暂不可用，提供 zw83716@gmail.com；配置后才显示发送表单 |
| 刷新页面丢失生成任务，容易重复扣费 | 当前标签页只保存任务 ID，刷新后查询原任务；不保存用户照片、不自动重发生成请求 |
| 状态查询失败后要求重新选照片；过期任务反复重试 | 允许直接 Check video status；已不存在的任务显示恢复提示并解除锁定 |
| Cloudflare 不同实例无法读取内存中的任务 | video_task 持久表保存任务、归属、状态、消费与退款记录 |
| 并发查询可能重复退款；D1 文本余额比较可能错判 | 原子退款批次与终态保护；余额按数值比较 |
| 宠物和合照示例暗示未经验证的能力 | 改为单人舞者、可替换公主和固定草角；标明是参考/插画而非生成视频样本 |
| 工具说明、教程截图和实际流程不完全一致 | 补登录、40 试用积分、暂无积分购买、几分钟等待、临时下载说明；更新四张操作截图 |
| 手机比较表其余列不容易发现 | 保持真实 table，并增加横滑提示 |

用户明确要求保留原始 title/description；No Signup、in seconds、under a minute、30 seconds 等原文没有修改。正文与工具解释当前需要登录、生成通常需要几分钟，不将这些宣传原文当作实测结果。

## 验证结果

- 7 个主题页面逐页浏览，67 处站内链接逐一点击，目标地址均正确；无浏览器异常或整页横向溢出。
- 9 个不同外链从页面点击打开，最终均 HTTP 200；比较信息以对应官网及 FAQ 为准。
- 六个认证页实际浏览；真实本地账号完成注册、40 积分到账、退出、登录与工具页回跳，共 10 项通过。仅该临时账号经身份核对后删除。
- 5 项生成工具浏览器测试通过：匿名门槛、刷新恢复、不存在任务、查询重试，以及照片校验/公主还原/播放/下载/重置。
- 播放与下载使用已有私人测试 MP4，由测试浏览器拦截响应提供；实际播放时间前进，下载文件 SHA-256 与原片一致。未将私人素材放入 public，未执行新的 AutoDL 生成。
- 41/41 页面及工具 E2E 检查通过；109/109 相关单元测试通过；TanStack 类型检查、Cloudflare 生产构建及 Wrangler dry-run 通过。干运行 gzip 3006.20 KiB，没有发布代码。
- 17 个 HTML 路由的 title/description/H1/canonical、10 个资源页 noindex、7 项 sitemap、robots、无 keywords、21 处固定图片 alt/尺寸、内链和法律页检查均通过。
- 实际 curl：首页 H1 为 Rumpelstiltskin AI Video Maker，HTML 中有 36 个段落；教程 H1 为 How to Make a Rumpelstiltskin AI Video，HTML 中有 17 个段落。

证据：`test-results/launch-visitor/report.json`、`test-results/launch-content/`、`test-results/launch-auth/report.json`、`test-results/stage5-audit/report.json` 及 curl 原始 HTML。Playwright 清理范围限制在 `test-results/playwright-seo`，私人原片保留在 `artifacts/private/videos`。

## 部署前后仍需处理的真实条件

1. 新增 `libs/database/drizzle-sqlite/0006_video_tasks.sql` 已在本地应用，**正式部署前必须对确认过的生产 D1 应用迁移**。这次没有修改云端数据库。
2. 核对生产 AutoDL 密钥、认证密钥、D1 与 R2 绑定；R2 当前仍为 r2.dev 开发公开地址，按既有上线清单配置正式媒体域名。
3. 自动密码找回需要生产发信配置与真实收信验证。当前明确使用支持邮箱协助，不伪装成发送成功。
4. 供应商视频 URL 可能过期，当前要求及时下载，不承诺永久视频库。远程供应商提交与本地记录保存之间无法形成跨服务原子事务，极端中断仍需核对供应商记录与消费流水。
5. 示例区为诚实标注的参考图，尚无获准公开的真实人物生成样例。用户提供的私人肖像及测试视频未公开。
6. 部署后在正式域名实际完成一次注册 → 上传 → 生成 → 播放 → 下载，并确认扣费与失败退款。当前本地结果不能替代线上配置验证。

执行顺序与命令见 `stage5-launch-checklist.md`。

## 主要修改位置

- `apps/tanstack-app/src/components/dance-maker.tsx`、`src/lib/dance-generation.ts`、新增 `src/lib/dance-task-session.ts`：上传门槛、任务恢复与错误恢复。
- 认证六个页面及对应表单、`global-header.tsx`、`auth-guard.tsx`、`feature-flags.ts`；新增 `auth-copy.ts`、`auth-navigation.ts`、`use-auth-capabilities.ts`。
- `home-copy.ts`、`tool-page-copy.ts`、`meme-article-copy.ts`、`tutorial-copy.ts`、`generator-comparison.ts`、`legal-copy.ts`、新增 `dance-examples.ts`，以及对应展示组件、步骤图与四张教程截图。
- `libs/ai/video-task-store.ts`、共享任务状态逻辑、`libs/credits`、数据库 schema/迁移及三个框架对共享异步接口的必要适配。
- 新增/更新任务、API、工具浏览器测试与 `scripts/manual/launch-*.mjs` 检查脚本。
