"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient, getAuthUser } from "@/lib/supabase/client";
import { User, Mail, Save } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    getAuthUser(supabase).then((authUser) => {
      setEmail(authUser?.email || "");
      setName(authUser?.user_metadata?.full_name || "");
    });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { full_name: name } });
    const authUser = await getAuthUser(supabase);
    if (authUser) {
      await supabase.from("profiles").update({ full_name: name }).eq("id", authUser.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03]">
            <User size={18} className="text-white/70" />
          </div>
          <div>
            <h1 className="font-display text-[22px] font-bold tracking-tight">Settings</h1>
            <p className="text-[13px] text-white/30">Manage your profile and preferences</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/[0.05] bg-[#12121a] rounded-2xl p-6"
      >
        <form onSubmit={save} className="space-y-5">
          <div>
            <label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-white/70">
              <User size={13} className="text-white/30" /> Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input-premium w-full"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-[13px] font-medium text-white/70">
              <Mail size={13} className="text-white/30" /> Email
            </label>
            <div className="flex h-10 items-center rounded-xl border border-white/[0.05] bg-[#12121a]/50 px-4">
              <p className="text-[13px] text-white/30">{email}</p>
            </div>
            <p className="mt-1.5 text-[11px] text-white/30">Email cannot be changed</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-white flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] disabled:opacity-40"
            >
              {saving ? (
                "Saving..."
              ) : saved ? (
                <>
                  <Save size={14} /> Saved
                </>
              ) : (
                <>
                  <Save size={14} /> Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
