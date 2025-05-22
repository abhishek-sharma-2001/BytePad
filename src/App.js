import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import NoteEditor from "./components/NoteEditor";
import NotesSidebar from "./components/NotesSidebar";
import './index.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);

  // Initial session check + auth listener
  useEffect(() => {
    console.log("🔁 Checking initial session...");
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("❌ Session fetch error:", error);
      console.log("✅ Initial session:", data);
      setUser(data?.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🧭 Auth state changed: ${event}`);
      console.log("🔐 Session from state change:", session);
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
      console.log("🧹 Cleaned up auth listener.");
    };
  }, []);

  // Fetch notes when user logs in
  useEffect(() => {
    if (user) {
      console.log("👤 User detected. Fetching notes...");
      fetchNotes();
    } else {
      console.log("🚫 No user. Skipping note fetch.");
    }
  }, [user]);

  const fetchNotes = async () => {
    console.log("📨 Fetching notes from Supabase for user:", user.id);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching notes:", error);
    } else {
      console.log("🗂️ Notes received:", data);
      setNotes(data);
    }
  };

  const handleSaveNote = async (note) => {
    const isNew = !note.id;
    console.log(isNew ? "🆕 Saving new note:" : "✏️ Updating note:", note);

    const { error } = isNew
      ? await supabase.from("notes").insert([{ ...note, user_id: user.id }])
      : await supabase.from("notes").update(note).eq("id", note.id);

    if (error) {
      console.error("❌ Save error:", error);
    } else {
      console.log("✅ Note saved successfully.");
      fetchNotes();
    }
  };

  const handleLogin = async () => {
    const redirectUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined;

    console.log("🔐 Login button clicked");
    console.log("➡️ Redirecting to:", redirectUrl);

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  const handleLogout = async () => {
    console.log("🔓 Logging out...");
    await supabase.auth.signOut();
    setUser(null);
    console.log("✅ Logged out.");
  };

  if (!user) {
    console.log("🔐 Not logged in. Showing login button.");
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
