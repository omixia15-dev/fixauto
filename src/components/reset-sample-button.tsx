"use client";

import { en } from "../i18n/en";
import { useDemoCases } from "../store/demo-case-provider";

export function ResetSampleButton() {
  const { reset } = useDemoCases();

  function handleReset() {
    if (window.confirm(en.reset.confirm)) reset();
  }

  return (
    <button className="button button-secondary" type="button" onClick={handleReset}>
      {en.reset.button}
    </button>
  );
}
