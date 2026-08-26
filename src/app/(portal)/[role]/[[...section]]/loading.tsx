export default function PortalLoading() {
  return (
    <main id="main-content" className="loading-page" aria-busy="true" aria-label="載入工作台">
      <div className="loading-shell">
        <div className="loading-block loading-logo" />
        <div className="loading-block loading-title" />
        <div className="loading-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="loading-block loading-card" key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
