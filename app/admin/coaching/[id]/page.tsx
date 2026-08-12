"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { SiteShell } from "@/app/components/site-shell";
import useAuth from "@/app/store/useAuth";

export default function AdminSessionPage() {
  const params: any = useParams();
  const id = params.id;
  const [session, setSession] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const sres = await fetch(`/api/admin/coaching?`);
    // We'll just fetch session via admin list and filter
    const sdata = await sres.json();
    const sess = (sdata.sessions || []).find((s: any) => s.id === id);
    setSession(sess);

    const res = await fetch(`/api/admin/coaching/attendees?session_id=${id}`);
    const data = await res.json();
    setAttendees(data.attendees || []);
    setWaitlist(data.waitlist || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const handlePromote = async (waitlistId: string) => {
    setActionLoading(waitlistId);
    const res = await fetch(`/api/admin/coaching/attendees/promote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ waitlist_id: waitlistId }),
    });
    const data = await res.json();
    if (data?.ok) fetchData();
    else alert(data.error || "Failed to promote");
    setActionLoading(null);
  };

  const handleRemove = async (userId: string) => {
    setActionLoading(userId);
    const res = await fetch(`/api/admin/coaching/attendees/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: id, user_id: userId }),
    });
    const data = await res.json();
    if (data?.ok) fetchData();
    else alert(data.error || "Failed to remove");
    setActionLoading(null);
  };

  if (loading)
    return (
      <SiteShell>
        <div className="wrap">
          <p>Loading…</p>
        </div>
      </SiteShell>
    );

  return (
    <SiteShell>
      <div className="wrap">
        <h1>{session?.title || "Session"}</h1>
        <p>{session?.description}</p>

        <div className="admin-grid">
          <div className="admin-card">
            <h3>Attendees ({attendees.length})</h3>
            <ul>
              {attendees.map((a) => (
                <li key={a.id}>
                  {a.profiles?.full_name || a.profiles?.email}
                  <button
                    className="btn"
                    onClick={() => handleRemove(a.user_id)}
                    disabled={actionLoading === a.user_id}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="admin-card">
            <h3>Waitlist ({waitlist.length})</h3>
            <ul>
              {waitlist.map((w) => (
                <li key={w.id}>
                  {w.profiles?.full_name || w.profiles?.email}
                  <button
                    className="btn"
                    onClick={() => handlePromote(w.id)}
                    disabled={actionLoading === w.id}
                  >
                    Promote
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
