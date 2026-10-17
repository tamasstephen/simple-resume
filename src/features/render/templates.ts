import type { ComponentType } from "react";
import { AtsTemplate } from "./AtsTemplate";
import { ExecutiveTemplate } from "./ExecutiveTemplate";
import { MinimalTemplate } from "./MinimalTemplate";
import { executiveStyles } from "./executiveStyles";
import { minimalStyles } from "./minimalStyles";
import { pageStyles as atsStyles } from "./pageStyles";
import { templateSchema, type Resume, type Template } from "../../lib/schema/resume";

export interface TemplateDefinition {
  /** Name shown in the template picker. */
  label: string;
  Component: ComponentType<{ resume: Resume }>;
  /** Page + typography CSS handed to Paged.js alongside the markup. */
  pageStyles: string;
}

/** Every template, keyed by its stored id. Adding one is a new entry here —
 *  the schema's enum keeps the keys and the stored value in step. */
export const TEMPLATES: Record<Template, TemplateDefinition> = {
  minimal: { label: "Minimal", Component: MinimalTemplate, pageStyles: minimalStyles },
  executive: { label: "Executive", Component: ExecutiveTemplate, pageStyles: executiveStyles },
  ats: { label: "ATS Classic", Component: AtsTemplate, pageStyles: atsStyles },
};

/** Picker order follows the schema's enum, which lists the default first. */
export const TEMPLATE_IDS: readonly Template[] = templateSchema.options;
