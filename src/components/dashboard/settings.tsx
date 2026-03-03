
import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";

const SettingsPage: React.FC = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [swagName, setSwagName] = useState("");
  const [swagSuccess, setSwagSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [swagList, setSwagList] = useState<{ id: string; content: string }[]>([]);
  const [copiedSwagId, setCopiedSwagId] = useState<string | null>(null);

  const handleCreateSwag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swagName.trim()) return;
    try {
      const res = await fetch("/api/swag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: swagName.trim() }),
      });
      if (res.ok) {
        setSwagSuccess(true);
        setSwagName("");
        await fetchSwagList();
        setTimeout(() => setSwagSuccess(false), 2000);
      }
    } catch {
      // Optionally handle error
    }
  };

  const fetchSwagList = async () => {
    const res = await fetch("/api/swag");
    if (res.ok) {
      const data = await res.json();
      setSwagList(Array.isArray(data.swag) ? data.swag : []);
    }
  };

  useEffect(() => {
    fetchSwagList();
  }, []);

  const getSwagUrl = (content: string) => {
    return `${typeof window !== "undefined" ? window.location.origin : "https://velamini.com"}/chat/${encodeURIComponent(content.replace(/\s+/g, "-").toLowerCase())}`;
  };

  const handleCopySwagUrl = async (swagId: string, content: string) => {
    const swagUrl = getSwagUrl(content);
    try {
      await navigator.clipboard.writeText(swagUrl);
      setCopiedSwagId(swagId);
      setTimeout(() => setCopiedSwagId(null), 1500);
    } catch {
      setCopiedSwagId(null);
    }
  };

  return ( 
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center py-12 px-4">
      {/* Header */}
      <div className="w-full max-w-6xl mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl shadow-xl shadow-violet-200 dark:shadow-violet-900/30">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Settings</h1>
            <p className="text-slate-600 dark:text-slate-400 text-xl mt-2">Manage your virtual self and preferences</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start justify-center w-full max-w-6xl">
        {/* Share & Swag column */}
        <div className="flex flex-col gap-10 flex-1 min-w-[400px] max-w-2xl">
          {/* Share Your Virtual Self */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/20 overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Share Your Virtual Self</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Allow others to chat with your AI-powered virtual self</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-6 rounded-2xl bg-white/60 dark:bg-slate-700/40 border border-slate-200/60 dark:border-slate-600/40">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    className="toggle toggle-lg toggle-primary"
                    aria-label="Toggle sharing"
                    checked={isSharing}
                    onChange={() => setIsSharing((v) => !v)}
                  />
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${isSharing ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-200 dark:shadow-green-900/30" : "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-300"}`}>
                    {isSharing ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Create Swag */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/20 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create Swag</h2>
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">NEW</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Create personalized merchandise links</p>
                </div>
              </div>
              
              <form className="space-y-6" onSubmit={handleCreateSwag}>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Swag Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Velamini T-shirt, Custom Mug..."
                    className="w-full px-4 py-4 bg-slate-50/70 dark:bg-slate-700/70 border border-slate-200/80 dark:border-slate-600/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                    value={swagName}
                    onChange={e => setSwagName(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-violet-500/30 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-violet-200 dark:shadow-violet-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={!swagName.trim()}
                >
                  Create Swag
                </button>
                {swagSuccess && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                    <div className="p-2 bg-green-500 rounded-full">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-green-800 dark:text-green-200 font-medium">Swag created successfully!</span>
                  </div>
                )}
              </form>
              {/* Swag List */}
              {swagList.length > 0 && (
                <div className="mt-8 p-6 bg-slate-50/70 dark:bg-slate-700/30 rounded-2xl border border-slate-200/60 dark:border-slate-600/40">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Your Swag Collection
                  </h3>
                  <div className="space-y-3">
                    {swagList.map(swag => (
                      <div key={swag.id} className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-600/30 hover:shadow-lg transition-all duration-300">
                        <span className="text-slate-900 dark:text-slate-100 font-medium truncate max-w-xs">{swag.content}</span>
                        <button
                          className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                            copiedSwagId === swag.id 
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200 dark:shadow-green-900/30" 
                              : "bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 text-slate-700 dark:text-slate-200 hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-900/50 dark:hover:to-purple-900/50 hover:text-violet-700 dark:hover:text-violet-300"
                          }`}
                          onClick={() => handleCopySwagUrl(swag.id, swag.content)}
                          type="button"
                        >
                          {copiedSwagId === swag.id ? "Copied!" : "Copy URL"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copy Swag URL column removed: now handled per swag item */}
      </div>
    </div>
	);
};

export default SettingsPage;

