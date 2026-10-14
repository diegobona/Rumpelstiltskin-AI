# 阶段 5 验收记录

2026-10-14。本地 Cloudflare 构建预览 `http://127.0.0.1:7002`；线上域名尚未部署验收。公司名称为 ColdStone co.，支持邮箱为 zw83716@gmail.com。

## 内链

1. 首页 More AI Video Tools 从 pageRegistry 清单读取全部六个内页，用 h3 包链接，顺序及锚文本与要求一致。
2. 六个内页正文区域均有 Rumpelstiltskin AI 链回首页。
3. A、B、E 正文彼此互链，共六条定向链接。
4. F → D → A 路径已连通。
5. 目标词锚文本只对应一个目标路径。站内链接无 nofollow；21 处 SSR 外链仅有 rel=nofollow，没有 target；生成完成后的 Open video 外链也使用同一规则。

## 十条验收

| 项目 | 结果 | 实际证据 |
| --- | --- | --- |
| title 唯一、对应目标词 | 通过 | 17 页 title 各一条且不重复；7 个主题页逐一匹配 pageRegistry |
| H1 唯一、语义标题骨架 | 通过 | 17 页 H1 各一个；主题页使用 H2/H3，无跳级；简短认证/支付表单保留单 H1 |
| description 唯一 | 通过 | 17 页各一条非空 description |
| canonical 指向自身 | 通过 | 17 页均为 HTTPS 裸域自己的路径，查询参数不进入 canonical |
| sitemap 与 robots | 通过 | sitemap 含首页及六个内页共 7 条；robots 为 User-agent: *、Allow: /，指向 sitemap |
| 无 keywords meta | 通过 | 17 页总数为 0；构建源代码检查同时通过 |
| 图片 alt、尺寸 | 通过 | 21 处固定 SSR 图片均有非空 alt；原图及 width/height 属性均至少 300×300 |
| SSR 正文 | 通过 | 实际 curl：首页 H1 与 36 个 p；教程 H1 与 17 个 p；禁用 JavaScript 仍能读取 |
| 资源页 noindex | 通过 | 6 个认证页、2 个支付结果页、2 个法律页均 noindex, follow |
| 无站内死链 | 通过 | 141 处站内链接、15 个不同目标 URL（含返回查询参数）全部 200；无失效 fragment |

图片验收针对发布的固定素材，响应式布局可缩小显示尺寸；用户自行上传的预览图不属于固定发布素材。当前未注册独立 /account、/checkout、/pricing 页面，未凭空新增；统一 SEO 工具已覆盖此类路径的默认 noindex。资源页不放入 sitemap，robots 允许抓取其 noindex 声明。

curl 首页 H1：Rumpelstiltskin AI Video Maker。

curl 教程 H1：How to Make a Rumpelstiltskin AI Video。

www 本地上游模拟实际响应：301，Location 为 https://rumpelstiltskin-ai.co/signin?returnTo=%2Faccount。未知页面返回 404、SSR 标题和首页链接。

## 运行记录与文件

- TanStack 类型检查、Cloudflare 生产构建通过；9 项 SEO 单元测试通过。
- Stage 1/2/3/4/5 相关 E2E 共 36 项通过，www 用独立本地上游和 curl 验证。仅相关测试，不运行收费视频生成或支付测试。
- 最后调整生成结果外链后，再次构建、类型检查及 Stage 5 的 16 项验收均通过。
- 法律页在 1440 和 390 宽度无横向溢出；首页 JavaScript 启用后无页面错误、console.error 或 hydration 错误。
- `test-results/stage5-audit/report.json`：10 条验收、5 条内链规则及所有页面元信息。
- 同目录包含各页 HTML、`curl-home.html`、`curl-how-to-make-rumpelstiltskin-ai-video.html`、`robots.txt`、`sitemap.xml`、`www-redirect.txt`。
- `test-results/stage5-visual/report.json` 与截图：桌面/手机检查结果。
- 检查入口：`scripts/manual/stage5-audit.mjs`、`tests/e2e/specs/stage5-site.spec.ts`。

## 上线入口

法律页面为 /privacy-policy、/terms-of-service；全站共用 site-footer.tsx，认证页面原来的 # 法律链接已修正。

统计 Token 填在 `apps/tanstack-app/src/lib/analytics.ts` 的 `analyticsConfig.cloudflareWebAnalyticsToken`。当前为空，SiteAnalytics 不输出统计脚本。启用后更新隐私政策，并重新构建部署。

按顺序执行的配置、部署、线上验证及 Search Console 操作见 [上线清单](stage5-launch-checklist.md)。该清单也列出了已有视频任务内存存储、供应商临时结果链接及宣传承诺与实际体验的差异；本次 SEO 验收通过不代表这些生产问题已解决。
