import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Trophy, Plus, Crown } from "lucide-react";
import { API } from "../store/socStore";

const ACHIEVEMENTS = [
  { id: "first-blood", label: "First Blood", points: 50 },
  { id: "honey-trap", label: "Honey Trap", points: 100 },
  { id: "kernel-pwn", label: "Kernel Pwn", points: 200 },
  { id: "exfil-master", label: "Exfil Master", points: 300 },
  { id: "ghost", label: "Ghost", points: 500 },
];

export default function CTF() {
  const [board, setBoard] = useState([]);
  const [handle, setHandle] = useState("");
  const [achievement, setAchievement] = useState(ACHIEVEMENTS[0].id);

  const load = async () => {
    try {
      const r = await axios.get(`${API}/ctf/leaderboard`);
      setBoard(r.data);
    } catch {}
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  const submit = async () => {
    if (!handle.trim()) return;
    const ach = ACHIEVEMENTS.find((a) => a.id === achievement);
    try {
      await axios.post(`${API}/ctf/score`, { handle: handle.trim(), points: ach.points, achievement: ach.label });
      setHandle("");
      load();
    } catch {}
  };

  return (
    <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      <div className="glass rounded-md overflow-hidden" data-testid="ctf-leaderboard">
        <div className="px-4 pt-3 pb-2 border-b border-white/5 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#ff9f1c]" />
          <span className="label-mono">CTF Leaderboard</span>
        </div>
        <div className="divide-y divide-white/5">
          {board.length === 0 && <div className="px-5 py-12 text-center text-zinc-500 font-mono text-sm">no players yet — log a capture to begin</div>}
          {board.map((p, i) => {
            const rank = i + 1;
            const color = rank === 1 ? "#ff9f1c" : rank === 2 ? "#39ff14" : rank === 3 ? "#00f0ff" : "#52525B";
            return (
              <motion.div
                key={p.handle}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="px-5 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors"
              >
                <div className="w-10 grid place-items-center">
                  {rank === 1 ? <Crown className="w-5 h-5" style={{ color }} /> : <span className="font-mono text-sm font-bold" style={{ color }}>#{rank}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-mono text-sm truncate">{p.handle}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.achievements.slice(0, 4).map((a) => (
                      <span key={a} className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-sm border border-[#ff9f1c]/30 bg-[#ff9f1c]/5 text-[#ff9f1c]">{a}</span>
                    ))}
                    {p.achievements.length > 4 && <span className="text-[9px] font-mono text-zinc-500">+{p.achievements.length - 4}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono text-xl" style={{ color, textShadow: `0 0 8px ${color}55` }}>{p.points}</div>
                  <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">pts</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-md p-5 space-y-3 h-fit" data-testid="ctf-submit">
        <div className="flex items-center gap-2 mb-1">
          <Plus className="w-4 h-4 text-[#39ff14]" />
          <span className="label-mono">Log Capture</span>
        </div>
        <div>
          <div className="label-mono mb-1">Handle</div>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="ghostshell"
            data-testid="ctf-handle"
            className="w-full bg-black/50 border border-white/10 px-3 py-2 text-[12px] font-mono text-white outline-none focus:border-[#39ff14]/50 rounded-sm"
          />
        </div>
        <div>
          <div className="label-mono mb-1">Achievement</div>
          <select
            value={achievement}
            onChange={(e) => setAchievement(e.target.value)}
            data-testid="ctf-achievement"
            className="w-full bg-black/50 border border-white/10 px-3 py-2 text-[12px] font-mono text-white outline-none focus:border-[#39ff14]/50 rounded-sm"
          >
            {ACHIEVEMENTS.map((a) => {
              const label = `${a.label} (+${a.points})`;
              return <option key={a.id} value={a.id}>{label}</option>;
            })}
          </select>
        </div>
        <button onClick={submit} data-testid="ctf-submit-btn" className="btn-neon w-full">Submit Capture</button>
      </div>
    </div>
  );
}
