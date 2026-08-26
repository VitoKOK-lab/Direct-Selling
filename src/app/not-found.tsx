import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="error-page">
      <div className="error-card">
        <span className="eyebrow">404</span>
        <h1>找不到這個頁面</h1>
        <p>此路徑不存在，或已不在目前角色的示範範圍內。</p>
        <Link className="button button-primary" href="/">
          返回系統入口
        </Link>
      </div>
    </main>
  );
}
