"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_BASE = "http://localhost:5000";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalServiceProviders: 0,
    totalServices: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [revenueSeries, setRevenueSeries] = useState([]); // last 7 days revenue
  const [categoryBreakdown, setCategoryBreakdown] = useState([]); // pie chart
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const metricsRes = await fetch(`${API_BASE}/api/admin/dashboard/metrics`, { credentials: "include" });
        const metricsJson = await metricsRes.json().catch(() => ({}));

        const revRes = await fetch(`${API_BASE}/api/admin/dashboard/revenue?range=7`, { credentials: "include" });
        const revJson = await revRes.json().catch(() => ({}));

      
        const catRes = await fetch(`${API_BASE}/api/admin/dashboard/category-breakdown`, { credentials: "include" });
        const catJson = await catRes.json().catch(() => ({}));

        const bookingsRes = await fetch(`${API_BASE}/api/booking/getallbookings?limit=3`, { credentials: "include" });
        const bookingsJson = await bookingsRes.json().catch(() => ({}));

        if (!mounted) return;
        console.log("Fetched dashboard data:", { metricsJson, revJson, catJson, bookingsJson });
        setMetrics(
          metricsJson?.data || metricsJson || {
            totalUsers: 1200,
            totalServiceProviders: 300,
            totalServices: 500,
            totalBookings: 800,
            totalRevenue: 150000,
          }
        );

        setRevenueSeries(
          revJson?.data?.series ||
            revJson?.series || [
              { date: daysAgo(6), value: 1200 },
              { date: daysAgo(5), value: 900 },
              { date: daysAgo(4), value: 1400 },
              { date: daysAgo(3), value: 1700 },
              { date: daysAgo(2), value: 1500 },
              { date: daysAgo(1), value: 2200 },
              { date: daysAgo(0), value: 2000 },
            ]
        );

        setCategoryBreakdown(
          catJson?.data?.categories ||
            catJson?.categories || [
              { label: "Home Services", value: 45 },
              { label: "Cleaning", value: 25 },
              { label: "Room Renting", value: 15 },
              { label: "Other", value: 15 },
            ]
        );

        setRecentBookings(
  (bookingsJson?.data || bookingsJson || []).map(b => ({
    id: b.id,
    customer: b.name,
    service: b.service,
    provider: b.serviceprovider || "N/A",
    confirmedMoney: Number(b.confirmed_money || 0),
    confirmedBidAmount: b.confirmed_bid_amount ? Number(b.confirmed_bid_amount) : null,
    date: b.createdAt || new Date().toISOString(),
    status: b.status,
  }))
);


      } catch (err) {
        console.error("dashboard load error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const lineData = useMemo(() => {
    const labels = revenueSeries.map((p) => format(new Date(p.date), "MMM d"));
    const data = revenueSeries.map((p) => Number(p.value || 0));
    return {
      labels,
      datasets: [
        {
          label: "Revenue",
          data,
          borderColor: "#10B981",
          backgroundColor: "rgba(16,185,129,0.12)",
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [revenueSeries]);

  const pieData = useMemo(() => {
    return {
      labels: categoryBreakdown.map((c) => c.label),
      datasets: [
        {
          data: categoryBreakdown.map((c) => c.value),
          backgroundColor: ["#10B981", "#60A5FA", "#F59E0B", "#FB7185", "#A78BFA"],
        },
      ],
    };
  }, [categoryBreakdown]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of key metrics and performance</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Today: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Total Users" value={metrics.totalUsers} color="green" />
        <MetricCard title="Providers" value={metrics.totalServiceProviders} color="blue" />
        <MetricCard title="Services" value={metrics.totalServices} color="violet" />
        <MetricCard title="Bookings" value={metrics.totalBookings} color="amber" />
        <MetricCard title="Revenue" value={`Rs. ${metrics.totalRevenue}`} color="emerald" />
        <MetricCard title="Gharbeti" value={` ${metrics.totalGharbeti}`} color="emerald" />
      </div>

      {/* main content: charts left, recent bookings right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Revenue (last 7 days)</h3>
                <div className="text-sm text-muted-foreground">Trend and income</div>
              </div>
              <div className="w-full h-56">
                <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent>
                <h4 className="text-md font-semibold mb-2">Category Breakdown</h4>
                <div className="w-full h-48">
                  <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h4 className="text-md font-semibold mb-2">Quick Insights</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>Average booking value: <strong>Rs. {avgBookingValue(recentBookings)}</strong></li>
                  <li>Active providers: <strong>{metrics.totalServiceProviders}</strong></li>
                  <li>Top category: <strong>{topCategory(categoryBreakdown)}</strong></li>
                  <li>Pending bookings: <strong>{recentBookings.filter(b => b.status?.toLowerCase() === "pending").length}</strong></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Recent Bookings</h3>
              <Badge className="bg-green-100 text-green-700">{recentBookings.length} recent</Badge>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading...</div>
              ) : recentBookings.length === 0 ? (
                <div className="text-sm text-slate-500">No recent bookings</div>
              ) : (
                recentBookings.map((b) => (
                    <div key={b.id} className="p-3 border border-green-200 rounded-lg hover:bg-green-50 transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">{b.customer}</div>
                                <div className="text-sm text-slate-600">{b.service} · {format(new Date(b.date), "MMM d, yyyy")}</div>
                                <div className="text-sm text-slate-600">Provider: {b.provider}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">Rs. {b.confirmedBidAmount !== null ? b.confirmedBidAmount : b.confirmedMoney}</div>
                                <StatusBadge status={b.status} />
                            </div>
                        </div>
                    </div>
                    
                ))

              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* -------- helpers & small components -------- */

function MetricCard({ title, value, color = "green" }) {
  const colorMap = {
    green: "bg-emerald-50 text-emerald-800",
    blue: "bg-blue-50 text-blue-800",
    violet: "bg-violet-50 text-violet-800",
    amber: "bg-amber-50 text-amber-800",
    emerald: "bg-emerald-50 text-emerald-800",
  };
  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
        <div className={`px-3 py-2 rounded-md ${colorMap[color]}`}> </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
  if (s === "pending") return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>;
  if (s === "cancelled") return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
  return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function avgBookingValue(bookings = []) {
  if (!bookings.length) return 0;
  const sum = bookings.reduce((s, b) => s + Number(b.amount || 0), 0);
  return Math.round(sum / bookings.length);
}

function topCategory(categories = []) {
  if (!categories.length) return "N/A";
  const sorted = [...categories].sort((a, b) => (b.value || 0) - (a.value || 0));
  return sorted[0].label;
}