import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import NoteEditor from "./components/NoteEditor";
import NotesSidebar from "./components/NotesSidebar";
import './index.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  // console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
  // console.log('Supabase Key:', process.env.REACT_APP_SUPABASE_KEY);
  // console.log('Supabase Client:', supabase);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setNotes(data);
  };

  const handleSaveNote = async (note) => {
    const isNew = !note.id;
    const { data, error } = isNew
      ? await supabase.from("notes").insert([{ ...note, user_id: user.id }])
      : await supabase.from("notes").update(note).eq("id", note.id);

    if (error) {
      console.error("Save error:", error);
    } else {
      fetchNotes();
      alert("Note saved!");
    }
  };

  const handleLogin = async () => {
    const redirectUrl = 'https://byte-pad.vercel.app/auth/callback';
    console.log('Redirecting to:', redirectUrl); // log it
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">BytePad</h1>
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <NotesSidebar
        notes={notes}
        onSelect={setActiveNote}
        onNew={() => setActiveNote({ title: '', content: '' })}
        onLogout={handleLogout}
      />
      <NoteEditor note={activeNote} onSave={handleSaveNote} />
    </div>
  );
}
