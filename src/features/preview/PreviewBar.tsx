function formatPreviewLabel(pageCount: number): string {
  if (pageCount <= 0) return "PREVIEW · A4";
  return `PREVIEW · A4 · ${pageCount} ${pageCount === 1 ? "PAGE" : "PAGES"}`;
}

/** Mono caption above the sheets: format, plus the page count once known. */
export function PreviewBar({ pageCount }: { pageCount: number }) {
  return <div className="preview-bar">{formatPreviewLabel(pageCount)}</div>;
}
