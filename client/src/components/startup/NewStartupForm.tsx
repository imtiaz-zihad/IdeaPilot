"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const INDUSTRIES = [
  "Food Tech", "HealthTech", "EdTech", "FinTech", "SaaS",
  "E-Commerce", "AI / ML", "CleanTech", "LogisticsTech",
];

interface Props { onClose: () => void; }

export default function NewStartupForm({ onClose }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    startupName: "", idea: "", industry: "Food Tech",
    country: "", targetAudience: "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
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
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div className="w-full max-w-[480px] bg-bg2 border border-border2 rounded-[18px] p-7 slide-up">

        <h2 className="text-[18px] font-bold text-text mb-5">🚀 Launch New Startup</h2>

        <form onSubmit={submit} className="flex flex-col gap-3.5">

          {/* Startup name */}
          <div>
            <label className="label">Startup name</label>
            <input
              className="input"
              placeholder="e.g. CampusEats"
              required
              value={form.startupName}
              onChange={set("startupName")}
            />
          </div>

          {/* Idea */}
          <div>
            <label className="label">Your idea</label>
            <textarea
              className="input min-h-[80px] resize-y leading-relaxed"
              placeholder="Describe your startup idea in detail..."
              required
              value={form.idea}
              onChange={set("idea")}
            />
          </div>

          {/* Industry + Country */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Industry</label>
              <select className="input" value={form.industry} onChange={set("industry")}>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Country</label>
              <input
                className="input"
                placeholder="e.g. Bangladesh"
                required
                value={form.country}
                onChange={set("country")}
              />
            </div>
          </div>

          {/* Target audience */}
          <div>
            <label className="label">Target audience</label>
            <input
              className="input"
              placeholder="e.g. University students aged 18–25"
              required
              value={form.targetAudience}
              onChange={set("targetAudience")}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-[12px] text-danger">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading
                ? <><span className="spinner w-3.5 h-3.5" /> Creating...</>
                : "✦ Generate with AI"
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}