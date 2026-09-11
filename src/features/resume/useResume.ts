import { createContext, useContext, type Dispatch } from "react";
import type { ResumeState, ResumeAction } from "../../lib/store/resumeReducer";

export const ResumeStateContext = createContext<ResumeState | null>(null);
export const ResumeDispatchContext = createContext<Dispatch<ResumeAction> | null>(null);

export function useResumeState(): ResumeState {
  const state = useContext(ResumeStateContext);
  if (state === null) {
    throw new Error("useResumeState must be used within a ResumeProvider");
  }
  return state;
}

export function useResumeDispatch(): Dispatch<ResumeAction> {
  const dispatch = useContext(ResumeDispatchContext);
  if (dispatch === null) {
    throw new Error("useResumeDispatch must be used within a ResumeProvider");
  }
  return dispatch;
}
