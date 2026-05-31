"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function NewStartupForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [form, setForm]       = useState({ startupName: "", idea: "", industry: "Food Tech", country: "", targetAudience: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/startups", form);
      onClose();
      router.push(`/startups/${data.data._id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create startup");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-bg2 border border-border2 rounded-xl p-7 w-full max-w-lg animate-slide-up">
        <h2 className="text-2xl font-bold mb-5">🚀 Launch New Startup</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="label">Startup name</label>
            <input className="input" placeholder="e.g. CampusEats" required
              value={form.startupName} onChange={e => setForm(p => ({ ...p, startupName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Your idea</label>
            <textarea className="input min-h-[80px] resize-y leading-relaxed" placeholder="Describe your startup idea..."
              required value={form.idea} onChange={e => setForm(p => ({ ...p, idea: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Industry</label>
              <select className="input" value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}>
                {["Food Tech","HealthTech","EdTech","FinTech","SaaS","E-Commerce","AI / ML","CleanTech","LogisticsTech"].map(i => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Country</label>
              <input className="input" placeholder="e.g. Bangladesh" required
                value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Target audience</label>
            <input className="input" placeholder="e.g. University students aged 18–25" required
              value={form.targetAudience} onChange={e => setForm(p => ({ ...p, targetAudience: e.target.value }))} />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <div className="flex gap-2.5 justify-end mt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><span className="spinner w-3.5 h-3.5" /> Creating...</> : "✦ Generate with AI"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}