# API v1

所有回應皆為 JSON，成功格式為 `{ "data": ..., "demo": true }`。未登入回傳 401，角色越權回傳 403。所有金額欄位使用整數 `amountTwd` 或語意明確的 `*Twd`。

| 方法 | 路徑 | 角色 | 用途 |
|---|---|---|---|
| POST | `/api/v1/auth/login` | 公開 | 建立測試 session |
| POST | `/api/v1/auth/logout` | 已登入 | 清除 session |
| GET | `/api/v1/auth/session` | 已登入 | 取得目前角色 |
| GET | `/api/v1/members` | 會員／管理員／財務 | 自己或會員清單 |
| GET | `/api/v1/organization` | 會員／管理員 | 推薦組織與後代 |
| GET/POST | `/api/v1/products` | 全角色／廠商與管理員 | 商品清單與草稿 |
| GET/POST | `/api/v1/orders` | 全角色／會員 | 角色範圍訂單與模擬結帳 |
| GET/POST | `/api/v1/settlements` | 管理員／財務 | 月結摘要與預演 |
| GET/POST | `/api/v1/withdrawals` | 會員／財務 | 提領清單與申請 |
| GET/POST | `/api/v1/feedback` | 管理員／全角色 | 集中回饋與頁面標註 |
| GET | `/api/v1/reports` | 管理員／財務 | 合成資料營運摘要 |

正式持久化接線時，寫入 API 必須在單一資料庫 transaction 中同時建立事件、分類流水與 audit event；任何外部通知都在 transaction 提交後處理。
