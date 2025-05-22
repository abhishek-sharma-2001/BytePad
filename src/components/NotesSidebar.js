import React from "react";

export default function NotesSidebar({ notes, onSelect, onNew, onLogout }) {
  return (
    <div className="w-1/4 bg-gray-100 p-4 border-r overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Your Notes</h2>
      <button onClick={onNew} className="mb-2 px-3 py-1 bg-green-500 text-white rounded">
        + New Note
      </button>
      <ul>
        {notes.map((note) => (
          <li
            key={note.id}
            onClick={() => onSelect(note)}
            className="cursor-pointer hover:bg-gray-200 p-2 rounded"
          >
            {note.title || "Untitled"}
          </li>
        ))}
      </ul>
      <button onClick={onLogout} className="mt-4 text-red-500">
        Logout
      </button>
    </div>
  );
}
