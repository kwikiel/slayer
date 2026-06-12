"use client";
import { useEffect, useState } from "react";

function useLeaderboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    const load = () =>
      fetch("/results/leaderboard.json?ts=" + Date.now())
        .then((r) => r.json())
        .then(setData)
        .catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);
  return data;
}

export function BenchCount() {
  const d = useLeaderboard();
  const n = d ? (d.benchmarks || []).length : 10;
  return <div className="v">{n}</div>;
}

export function MeasureNote() {
  const d = useLeaderboard();
  if (!d) {
    return (
      <p className="pnote" style={{ padding: "12px 18px", margin: 0, borderTop: "1px solid var(--line2)" }}>
        wczytuję pomiary…
      </p>
    );
  }
  const n = (d.benchmarks || []).length;
  const when = d.generated_at ? d.generated_at.slice(0, 10) : "";
  return (
    <p className="pnote" style={{ padding: "12px 18px", margin: 0, borderTop: "1px solid var(--line2)" }}>
      <b style={{ color: "var(--ink)" }}>{n}</b> osi zmierzonych{when ? " · stan " + when : ""} ·{" "}
      <a href="/leaderboard">wszystkie wyniki →</a>
    </p>
  );
}
