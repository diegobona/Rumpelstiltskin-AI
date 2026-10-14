# 免登录免费生成一次

适用范围：TanStack Start 的首页和两个工具内页，使用同一个 DanceMaker。没有新增页面、改动用户指定 SEO 文本或改动五镜头提示词。

## 用户流程

访客直接选择舞者照片、可选公主照片，勾选照片使用权限后生成。Better Auth 原生 anonymous 插件自动建立访客会话，不需要邮箱或密码。继续使用 TinyShip 的上传、积分扣除/失败退款、AutoDL H3 任务查询和下载链路；内部积分不再作为页头余额展示。

签名 HttpOnly Cookie 标识浏览器，D1 的 video_trial 同时约束浏览器与会话用户。提交时用一条原子 UPDATE 占用机会；生成成功后用完，供应商失败且退款完成后恢复。重复点击、刷新与状态重试不会重复提交。注册/登录继承使用记录，匿名任务和流水转移到正式账号；已用账号换浏览器不能再次领取。已有成功生成记录也计入一次限制。

## 限制与配置

- `config/videoTrial.ts`：访客 Cookie 最长一年；IP 每小时 10 次匿名会话、20 次上传、5 次生成提交。IP 是短期防刷辅助，同一 Wi-Fi 并非永远只能一个人用。
- `BETTER_AUTH_SECRET` 用于认证和访客签名，生产使用至少 32 字符随机密钥。不要随意轮换，否则旧访客识别会失效。
- 只信任 Cloudflare Request 上下文携带的客户端 IP；计数器保存按窗口生成的 HMAC，不保存原始 IP。Better Auth 自己的会话仍可能记录 IP，隐私页已说明。
- 无登录身份无法绝对识别一个自然人。清 Cookie、换浏览器或设备并换网络仍可能绕过；当前未加入指纹采集或验证码。
- 仅有浏览器 Cookie 而没有原会话时，不暴露原视频任务。生成结果仍应及时下载，供应商 URL 不保证永久有效。
- 供应商提交与本地数据库无法组成跨服务事务，极端中断需要核对任务与消费流水。普通失败退款和并发防重已有自动处理。

## 部署

SQLite/D1 和 PostgreSQL schema 同步提供 `0007_anonymous_video_trial.sql`，包含 `user.is_anonymous`、`video_trial` 和 `video_trial_rate`。本地 D1 已应用；本次没有部署或迁移云端。

部署新版前，在确认好的生产 D1 上执行项目现有 `d1 migrations apply DB --remote --config wrangler.jsonc`，包含尚未应用的 0006/0007，然后构建部署。完整命令见 `stage5-launch-checklist.md`。直接部署新代码而漏迁移会造成认证与生成接口错误。

## 验证

- 114 项 AI/任务/下载/限额单元测试通过，其中 20 个并发预占只有一个成功，8 个并发匿名 API 提交只发出一个供应商请求。
- 42 项页面与生成工具 E2E 通过：真实匿名会话配合模拟生成响应；刷新恢复、失败查询恢复、播放下载、使用后禁用、SSR/SEO/内链均通过。
- `scripts/manual/anonymous-trial-audit.mjs` 的 6 项真实认证与本地 D1 集成检查通过：免注册会话、拒绝其他 AI API、已用服务端拦截、注册继承任务与额度、新浏览器登录不重置、退出不重置。仅种入本次临时完成任务，未发起 AutoDL 生成或 R2 上传，临时账号及计数已清理。
- 四张教程截图重新从当前工具截取，未使用用户私人肖像作为公开样例。
- 最终类型检查、生产构建和 Wrangler 部署 dry-run 通过；重新启动最终构建后，首页/工具 7 项浏览器检查、6 项匿名继承检查与 10 项原有认证检查再次通过。没有执行真实部署。

运行：仓库根目录 `node node_modules/vitest/vitest.mjs run tests/unit/ai`；本地预览启动后执行 `node scripts/manual/anonymous-trial-audit.mjs`，此脚本会向本地 SQLite 写临时数据，请不要与其他认证或数据库测试并行运行。E2E 使用 `tests/e2e/seo.config.ts`；www 测试按 `seo-foundation.md` 开启端口 7003 的第二个本地 upstream。Windows 下重新构建前先停止预览，避免其锁定 dist/server/.wrangler。
