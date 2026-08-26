# 系統架構

## 執行模型

```text
瀏覽器
  ├─ /member、/vendor、/admin、/finance
  └─ /api/v1/*
          │
          ▼
Next.js 模組化單體
  ├─ Auth / RBAC
  ├─ Commerce / Fulfillment
  ├─ Member Organization
  ├─ Compensation Engine
  ├─ Wallet / Withdrawal
  └─ Feedback / Audit / Reports
          │
          ▼
PostgreSQL + Prisma
  ├─ 業務主檔
  ├─ 月資格快照
  ├─ 冪等業績事件
  └─ 不可覆寫分類流水
```

示範 UI 與 API 讀取 `src/lib/demo-data.ts` 的固定資料，因此未連資料庫也能驗收。`prisma/schema.prisma`、migration 與 seed 已準備好，正式持久化接線時可逐模組把固定 repository 換成 Prisma repository，不需改變頁面與分潤介面。

## 關鍵不變條件

1. 金額以整數臺幣、比例以 basis points 儲存，不使用浮點數。
2. `PerformanceEvent.idempotencyKey` 唯一，相同訂單或重銷事件重試不重複計算。
3. 推薦關係建立後不由一般功能修改；退出或失效只改狀態，不移動節點。
4. 月結依 `MonthlyMemberSnapshot` 與 `CompensationPlanVersion` 計算，歷史批次不讀取會員目前狀態。
5. 獎金、錢包與大水庫以 append-only ledger 表達；正式版更正需建立反向分錄。
6. 凍結／停權先進暫存；退出／失效、缺位或未開放代數依原因進大水庫。

## 分潤資料流

```text
可結算訂單
  → PerformanceEvent（ORDER）
  → 訂單資金正推
  → 介紹獎金 + 最多十代獎金
  → 會員累積／暫存／大水庫
  → 累積每滿 4,000 元
  → 現金 2,000 + 點數 2,000
  → PerformanceEvent（RESALE）
  → 往上再次計算，直到沒有新循環
```

事件總回饋比例小於來源金額，因此循環會收斂；另設 10,000 事件安全上限，避免錯誤參數造成無限處理。

## 安全邊界

- 所有 API 在伺服器再次驗證角色，不依賴側邊欄是否顯示功能。
- 登入密碼使用 Argon2id；session 使用 HMAC 簽章、HTTP-only、SameSite=Lax cookie。
- 登入 API 以來源 IP 做示範級速率限制。
- 匯出、制度、會員狀態與財務操作預留不可覆寫稽核事件。
- 示範資料不包含真人姓名、身分證、銀行或真實聯絡資料。
