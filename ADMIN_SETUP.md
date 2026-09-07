# 管理后台部署手册

这个项目使用 **GitHub Pages + Decap CMS + Cloudflare Worker OAuth Proxy**。日后在网页表单保存干员资料时，Decap CMS 会把更新提交到 `data/operators.json`；GitHub Pages 会自动重新发布。

## 先上传本次改动

1. 将本项目全部内容提交并推送到 GitHub 仓库的发布分支（通常是 `main`）。
   Windows PowerShell 示例：

   ```powershell
   git add .
   git commit -m "Add CMS operator management"
   git push origin main
   ```

   如果你的发布分支不是 `main`，将命令和下文所有的 `main` 换成实际分支名，例如 `master`。
2. 确认 GitHub Pages 仍以该分支发布，并确认公开网站可以正常打开。
3. 确认 `https://<用户名>.github.io/<仓库名>/admin/` 可访问。此时它会因尚未配置登录而不能使用，这是正常的。

## 创建 Cloudflare OAuth Worker

GitHub Pages 是静态站点，不能安全保存 GitHub OAuth 密钥。因此 Worker **只**负责 GitHub 登录的授权中转，不承载网站内容。

1. 注册或登录 Cloudflare。
2. 在电脑上按 [decap-proxy 的部署说明](https://github.com/sterlingwes/decap-proxy) 部署 Worker。该项目正是 Decap 官方文档推荐的 Cloudflare Worker OAuth 模板。Windows PowerShell 可按下面执行：

   ```powershell
   git clone https://github.com/sterlingwes/decap-proxy.git
   cd decap-proxy
   Copy-Item wrangler.toml.sample wrangler.toml
   npx wrangler login
   npx wrangler deploy
   ```

   首次运行 `npx` 可能会提示下载工具；确认后继续即可。部署前可打开 `wrangler.toml`，把 `name` 改成自己的名称，例如 `ark-cms-oauth`。
3. 给 Worker 取名，例如 `ark-cms-oauth`，部署后记下它的完整地址，例如 `https://ark-cms-oauth.<你的账户>.workers.dev`。
4. 在 Cloudflare Worker 的 **Settings → Variables and Secrets** 中添加两个 Secret：
   - `GITHUB_OAUTH_ID`
   - `GITHUB_OAUTH_SECRET`

不要把这两个值提交到 GitHub，也不要填写到 `admin/config.yml`。

也可在刚才的 `decap-proxy` 文件夹执行以下命令；命令会分别提示你粘贴值，粘贴时终端不会显示内容：

```powershell
npx wrangler secret put GITHUB_OAUTH_ID
npx wrangler secret put GITHUB_OAUTH_SECRET
npx wrangler deploy
```

## 创建 GitHub OAuth App

1. 用仓库所有者的 GitHub 账号打开 **Settings → Developer settings → OAuth Apps → New OAuth App**。
2. `Application name` 可填写“明日方舟练度表后台”。
3. `Homepage URL` 填 Worker 地址，例如 `https://ark-cms-oauth.<你的账户>.workers.dev`。
4. `Authorization callback URL` 必须精确填 Worker 地址加 `/callback`，例如：

   ```text
   https://ark-cms-oauth.<你的账户>.workers.dev/callback
   ```

5. 创建后，复制 `Client ID`；点击生成并复制 `Client secret`。
6. 将它们分别填入上一步 Worker 的 `GITHUB_OAUTH_ID` 和 `GITHUB_OAUTH_SECRET` Secret。

## 连接网站与 Worker

编辑 `admin/config.yml` 的两处占位符：

```yml
repo: "你的GitHub用户名/仓库名"
branch: "你的发布分支"
base_url: "https://你的-worker.你的-cloudflare账户.workers.dev"
```

提交并推送这次修改，等待 GitHub Pages 发布完成。

## 日常新增干员

1. 打开 `https://<用户名>.github.io/<仓库名>/admin/`。
2. 点击 **Login with GitHub**，并使用有该仓库写入权限的 GitHub 账号授权。
3. 选择 **干员资料 → 全部干员**。
4. 在“干员列表”中点击 **Add 干员列表**，填写名称、职业、头像 URL、优先级、专精建议、模组建议。
5. PRTS 页面 URL 可留空；前台会按干员名称自动生成链接。遇到名称与 PRTS 标题不同的干员，再手动填写即可。
6. 点击 **Publish**。保存后会自动创建一次 Git commit，GitHub Pages 发布完成后网站即更新。

只有拥有该仓库写入权限的 GitHub 账号能直接发布。若要交给其他编辑者，可将其作为仓库协作者；不要把 OAuth Secret 发给任何人。

## 故障排查

- **登录后回不到后台**：检查 GitHub OAuth App 的 callback URL 是否与 Worker 地址完全一致，末尾必须是 `/callback`。
- **找不到仓库**：检查 `admin/config.yml` 的 `repo`、`branch`，并确认登录账号有写入权限。
- **保存了但页面没有变化**：在 GitHub 的提交记录确认 `data/operators.json` 已更新，再查看 Actions / Pages 的部署状态；页面可能需要等待一两分钟并强制刷新。
- **头像不显示**：必须填可公开访问、以 `https://` 开头的图片 URL。

## 安全边界

- `admin/` 入口可以被别人打开，但未获 GitHub 写入授权的人无法保存内容。
- GitHub OAuth Client Secret 仅能存在于 Cloudflare Worker 的 Secrets 中。
- 本仓库不保存 Token、Secret 或 Cloudflare 凭据。
