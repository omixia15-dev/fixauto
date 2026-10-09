"use client";

import { useState } from "react";
import { en } from "../i18n/en";
import { useDemoCases } from "../store/demo-case-provider";

export function ResetSampleButton() {
  const { reset, ready } = useDemoCases();
  const [error, setError] = useState("");

  function handleReset() {
    if (!window.confirm(en.reset.confirm)) return;
    try { reset(); setError(""); } catch { setError("Reset failed. Allow browser storage and try again."); }
  }

  return (
    <div><button disabled={!ready} className="button button-secondary" type="button" onClick={handleReset}>
      {en.reset.button}
    </button>{error ? <p role="alert">{error}</p> : null}</div>
  );
}
