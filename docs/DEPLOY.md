# 部署指南（Vercel）

本示範系統的 API 目前使用固定測試資料，**執行期不需要 PostgreSQL**，因此可以直接部署到 Vercel 免費方案。Prisma schema 僅供日後正式持久化接線使用，不影響部署。

## 一、前置需求

- GitHub 帳號（本 repo：`VitoKOK-lab/Direct-Selling`）
- Vercel 帳號（可直接用 GitHub 登入：<https://vercel.com/signup>）

## 二、部署步驟

1. 登入 Vercel 後點 **Add New… → Project**。
2. 選擇 **Import Git Repository**，授權並選取 `VitoKOK-lab/Direct-Selling`。
3. Vercel 會自動偵測 Next.js 與 pnpm，以下設定保持預設即可：
   - Framework Preset：`Next.js`
   - Build Command：`pnpm build`
   - Install Command：`pnpm install`
4. 展開 **Environment Variables**，加入：

   | 名稱 | 值 | 說明 |
   |---|---|---|
   | `SESSION_SECRET` | 至少 32 字元的隨機字串 | 簽章 session cookie 用，**務必自行產生** |
   | `NEXT_PUBLIC_DEMO_LABEL` | `示範資料／非正式交易` | 頁面示範標註（可省略，省略時使用預設文案） |

   產生隨機密鑰的指令：

   ```bash
   openssl rand -base64 48
   ```

5. 點 **Deploy**，約 1–2 分鐘完成後即可取得 `https://<project>.vercel.app` 網址。

之後每次推送到 `main`，Vercel 會自動重新部署；Pull Request 也會自動獲得預覽網址。

## 三、部署後驗證

1. 開啟部署網址，應導向登入頁。
2. 用測試帳號登入（密碼皆為 `Demo1234!`）：
   - 會員 `member01`、廠商 `vendor01`、管理員 `admin01`、財務 `finance01`
3. 確認四個角色工作台、組織圖與獎金報表頁面皆可瀏覽。

## 四、注意事項

- 本系統為示範驗證版，只有合成資料與模擬交易，請勿當作正式營運環境。
- `DATABASE_URL` 目前不需要設定；未來接上真實資料庫時，建議搭配 Vercel Postgres／Neon／Supabase 並補上 `prisma migrate deploy` 流程。
- 若改用自有伺服器，可直接使用 repo 內的 `Dockerfile` 與 `docker-compose.yml`：

  ```bash
  docker compose up --build
  ```
