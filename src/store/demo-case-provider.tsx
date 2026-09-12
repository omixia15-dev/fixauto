"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  cloneInitialDemoData,
  updateSharedNote,
  type DemoData,
} from "../domain/sample-case";
import { loadDemoData, resetDemoData, saveDemoData } from "./storage";

type DemoCaseContextValue = {
  data: DemoData;
  ready: boolean;
  notice: string;
  saveSharedNote: (caseId: string, note: string) => void;
  reset: () => void;
};

const DemoCaseContext = createContext<DemoCaseContextValue | null>(null);

export function DemoCaseProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoData>(() => cloneInitialDemoData());
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const stored = loadDemoData(window.localStorage);
    saveDemoData(window.localStorage, stored);
    queueMicrotask(() => {
      setData(stored);
      setReady(true);
    });
  }, []);

  const value = useMemo<DemoCaseContextValue>(
    () => ({
      data,
      ready,
      notice,
      saveSharedNote(caseId, note) {
        const next = updateSharedNote(data, caseId, note);
        saveDemoData(window.localStorage, next);
        setData(next);
        setNotice("Sample note saved. It is shared across all three demo screens.");
      },
      reset() {
        const next = resetDemoData(window.localStorage);
        setData(next);
        setNotice("Fixauto sample data was reset.");
      },
    }),
    [data, notice, ready],
  );

  return (
    <DemoCaseContext.Provider value={value}>
      {children}
    </DemoCaseContext.Provider>
  );
}

export function useDemoCases(): DemoCaseContextValue {
  const context = useContext(DemoCaseContext);
  if (!context) {
    throw new Error("useDemoCases must be used inside DemoCaseProvider.");
  }
  return context;
}
