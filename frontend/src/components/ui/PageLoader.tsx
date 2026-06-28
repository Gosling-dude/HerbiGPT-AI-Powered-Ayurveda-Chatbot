/** Lightweight fallback shown while a route chunk loads. */
export default function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading">
      <div className="page-loader-mark">🌿</div>
      <div className="page-loader-bar"><span /></div>
    </div>
  );
}
