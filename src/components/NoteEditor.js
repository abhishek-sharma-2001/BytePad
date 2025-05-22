import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";

export default function NoteEditor({ note, onSave }) {
  const [content, setContent] = useState(note?.content || "");
  const [title, setTitle] = useState(note?.title || "");

  useEffect(() => {
    setContent(note?.content || "");
    setTitle(note?.title || "");
  }, [note]);

  const handleSave = () => {
    onSave({ ...note, content, title });
  };

  return (
    <div className="flex-1 p-4">
      <input
        className="w-full text-2xl font-bold mb-2 border-b p-2"
        placeholder="Note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <CodeMirror
        value={content}
        height="500px"
        extensions={[markdown(), python(), java()]} // supports all 3
        onChange={(val) => setContent(val)}
        className="border rounded"
      />
      <button
        onClick={handleSave}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>
  );
}
