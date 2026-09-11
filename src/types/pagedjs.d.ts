declare module "pagedjs" {
  export interface PagedFlow {
    total: number;
  }
  export class Previewer {
    constructor();
    preview(
      content: string | HTMLElement,
      stylesheets: Array<string | Record<string, string>>,
      renderTo: HTMLElement,
    ): Promise<PagedFlow>;
  }
}
