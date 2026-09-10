import { createContext, useContext, type Dispatch } from "react";
import type { ResumeState, ResumeAction } from "../../lib/store/resumeReducer";

export interface ResumeContextValue {
  state: ResumeState;
  dispatch: Dispatch<ResumeAction>;
}

export const ResumeContext = createContext<ResumeContextValue | null>(null);

export function useResume(): ResumeContextValue {
  const value = useContext(ResumeContext);
  if (value === null) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return value;
}
