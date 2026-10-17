declare module "pagedjs" {
  export interface PagedFlow {
    total: number;
  }
  /** Owns the <style> elements a preview run adds to <head>. */
  export interface Polisher {
    destroy(): void;
  }
  export class Previewer {
    constructor();
    polisher: Polisher;
    preview(
      content: string | HTMLElement,
      stylesheets: Array<string | Record<string, string>>,
      renderTo: HTMLElement,
    ): Promise<PagedFlow>;
  }
}
