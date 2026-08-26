"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="zh-Hant">
      <body>
        <main id="main-content" className="error-page">
          <div className="error-card">
            <span className="eyebrow">SYSTEM NOTICE</span>
            <h1>頁面暫時無法顯示</h1>
            <p>示範系統遇到非預期錯誤，請重新載入；所有操作仍屬非正式交易。</p>
            <button className="button button-primary" type="button" onClick={reset}>
              重新載入
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
