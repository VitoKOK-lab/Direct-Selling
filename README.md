# LUXKEY 會員商城暨十代分潤系統－示範驗證版

[![LUXKEY CI](https://github.com/VitoKOK-lab/Direct-Selling/actions/workflows/ci.yml/badge.svg)](https://github.com/VitoKOK-lab/Direct-Selling/actions/workflows/ci.yml)

依 LUXKEY 完整系統說明書建置的繁體中文響應式 Web 示範系統。專案只使用固定合成資料與模擬交易，目的是驗證四角色工作流程、200 人推薦組織、獎金計算、4,000 元循環及財務分類流水。

> 本系統不是正式營運環境，不會處理真人個資、正式金流、發票、銀行撥款或法定扣繳。

## 已完成範圍

- 會員、廠商、管理員、財務四個響應式工作台。
- 40 組 Argon2id 測試登入帳號與 HTTP-only 簽章 session。
- 可重複產生的 200 名合成會員、固定推薦關係與 0–7 名有效直推情境。
- 2,000／4,000／12,000 元資金正推、介紹獎金、十代獎金及大水庫分類。
- 凍結／停權暫存、退出／失效不壓縮、月制度版本與會員快照資料模型。
- 4,000 元循環、即刻重銷事件、唯一冪等鍵、購物點數與提領扣繳試算。
- 商品審核、訂單履約、月結預演、年度 2% 分配、稽核與頁面標註。
- PostgreSQL／Prisma schema、初始 migration、固定 seed、Docker 與 API v1。

## 快速啟動

需要 Node.js 22+、pnpm 11+。單純瀏覽示範介面不必先啟動資料庫；API 目前使用固定測試資料，PostgreSQL schema 用於正式持久化接線與驗收。

```bash
cp .env.example .env
pnpm install
pnpm dev
```

開啟 `http://localhost:3000`。

### 測試帳號

所有測試帳號密碼皆為 `Demo1234!`。

| 角色 | 帳號 |
|---|---|
| 會員 | `member01`–`member10` |
| 廠商 | `vendor01`–`vendor10` |
| 管理員 | `admin01`–`admin10` |
| 財務 | `finance01`–`finance10` |

### 啟動 PostgreSQL 與寫入固定資料

```bash
docker compose up -d db
pnpm db:migrate
pnpm db:seed
```

也可直接啟動完整容器環境：

```bash
docker compose up --build
```

## 驗證指令

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install chromium webkit
pnpm test:e2e
```

推送至 `main`、建立 Pull Request，或在 GitHub Actions 手動執行時，`LUXKEY CI` 會自動完成上述檢查，並保留 Playwright HTML 報告 14 天。

## 核心規則

- 訂單先保留 10%，90% 形成業績值。
- 直接推薦人取得業績值 10% 的介紹獎金；同一人符合資格時另取得第一代 5%。
- 最多十代、每代業績值 5%；缺位、退出、失效或未開放代數進大水庫並記錄原因。
- 凍結或停權的獎金進暫存，不直接進大水庫。
- 已結算獎金每滿 4,000 元切分為 2,000 元現金與 2,000 點，並建立一次即刻重銷業績事件。
- 重銷事件與日後商品兌換分離，同一批點數不可重複發獎。
- 示範版只允許結算前退款；已結算沖銷屬正式營運版範圍。

## 文件

- [系統架構](docs/ARCHITECTURE.md)
- [API 介面](docs/API.md)
- [驗收案例](docs/ACCEPTANCE.md)
- [部署指南（Vercel）](docs/DEPLOY.md)
- [UI 設計系統](design-system/luxkey-demo/MASTER.md)

## 正式化邊界

正式招募或交易前需另行完成台灣多層次傳銷報備、參加契約與退貨權利、真人身分驗證、個資告知與安全維護、正式金流／發票、已結算退貨沖銷、備份監控及資安測試。扣繳旗標與 10%／2.11% 僅為測試參數，實際門檻由會計與法務確認。
