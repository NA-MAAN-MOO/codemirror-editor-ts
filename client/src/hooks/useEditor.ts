import React, { useState, useCallback, useEffect } from "react";
import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { Extension } from "@codemirror/state";

export default function useEditor(extensions: Extension[]) {
  const [element, setElement] = useState<HTMLElement>();

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    const view = new EditorView({
      state: EditorState.create({
        extensions: [basicSetup, javascript(), ...extensions],
      }),
      parent: element,
    });

    return () => view?.destroy();
  }, [element]);

  return { ref };
}
