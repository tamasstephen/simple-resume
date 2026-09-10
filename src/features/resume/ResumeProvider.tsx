import { useEffect, useReducer, type ReactNode } from "react";
import { resumeReducer, initialState } from "../../lib/store/resumeReducer";
import { emptyResume } from "../../lib/schema/resume";
import type { PersistenceProvider } from "../../lib/persistence/PersistenceProvider";
import { ResumeContext } from "./useResume";

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

  return <ResumeContext.Provider value={{ state, dispatch }}>{children}</ResumeContext.Provider>;
}
