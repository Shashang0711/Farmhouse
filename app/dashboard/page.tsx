"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { apiGet } from "../lib/backend-api";

type Farm = { id: string };
type User = { id: string };
type Decoration = { id: string };

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [farmCount, setFarmCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [decorationCount, setDecorationCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && user.role !== "ADMIN") {
      router.replace("/farms");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const [farms, users, decorations] = await Promise.all([
          apiGet<Farm[]>("/farms", token),
          apiGet<User[]>("/users", token),
          apiGet<Decoration[]>("/decorations", token)
        ]);
        setFarmCount(farms.length);
        setUserCount(users.length);
        setDecorationCount(decorations.length);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load analytics");
      }
    };
    void load();
  }, [token]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="page">
      <h1>Dashboard</h1>
      {error && <p className="error">{error}</p>}
      <section className="card dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">Total Farms</div>
          <div className="stat-value">
            {farmCount !== null ? farmCount : "—"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">
            {userCount !== null ? userCount : "—"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Decorations</div>
          <div className="stat-value">
            {decorationCount !== null ? decorationCount : "—"}
          </div>
        </div>
      </section>
    </div>
  );
}

