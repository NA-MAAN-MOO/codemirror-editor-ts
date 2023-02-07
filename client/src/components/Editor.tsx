import useEditor from "../hooks/useEditor";
import { Extension } from "@codemirror/state";

type CodeMirrorProps = {
  extensions: Extension[];
};

const Editor = ({ extensions }: CodeMirrorProps) => {
  const { ref } = useEditor(extensions);

  return <div ref={ref} />;
};

export default Editor;
