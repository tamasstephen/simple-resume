import { useEffect, useReducer, type ReactNode } from "react";
import { resumeReducer, initialState } from "../../lib/store/resumeReducer";
import { emptyResume } from "../../lib/schema/resume";
import type { PersistenceProvider } from "../../lib/persistence/PersistenceProvider";
import { ResumeStateContext, ResumeDispatchContext } from "./useResume";

interface ResumeProviderProps {
  persistence: PersistenceProvider;
  children: ReactNode;
}

export function ResumeProvider({ persistence, children }: ResumeProviderProps) {
  const [state, dispatch] = useReducer(
    resumeReducer,
    undefined,
    () => initialState(persistence.load() ?? emptyResume()),
  );

  useEffect(() => {
    persistence.save(state.committed);
  }, [state.committed, persistence]);

  return (
    <ResumeStateContext.Provider value={state}>
      <ResumeDispatchContext.Provider value={dispatch}>{children}</ResumeDispatchContext.Provider>
    </ResumeStateContext.Provider>
  );
}
