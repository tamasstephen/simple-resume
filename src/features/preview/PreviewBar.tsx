import type { ReactNode } from "react";

function formatPreviewLabel(pageCount: number): string {
  if (pageCount <= 0) return "PREVIEW · A4";
  return `PREVIEW · A4 · ${pageCount} ${pageCount === 1 ? "PAGE" : "PAGES"}`;
}

/** Bar above the sheets: format and page count on the left, controls that
 *  shape the preview (the template picker) on the right. */
export function PreviewBar({ pageCount, children }: { pageCount: number; children?: ReactNode }) {
  return (
    <div className="preview-bar">
      <span className="preview-bar__label">{formatPreviewLabel(pageCount)}</span>
      {children}
    </div>
  );
}
