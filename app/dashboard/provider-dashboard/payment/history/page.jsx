"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Eye } from "lucide-react";
import { format } from "date-fns";

const API_BASE = "http://localhost:5000";

export default function PaymentHistory() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState(null);

  // UI state
  const [page, setPage] = useState(1);
  const limit = 10;
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/api/provider/payments/history?page=${page}&limit=${limit}`,
          { credentials: "include" }
        ).catch(() => null);

        let data = null;
        if (res && res.ok) {
          data = await res.json().catch(() => null);
          // normalize: expect array at data.data or data.invoices or response itself
          data = data?.data || data?.invoices || data || [];
        }

        if (!mounted) return;

        if (!data || !Array.isArray(data) || data.length === 0) {
          // fallback sample data so UI shows while backend missing
          setInvoices(sampleData());
        } else {
          setInvoices(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load payment history");
        setInvoices(sampleData());
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [page]);

  // client-side filter/search
  const filtered = invoices
    .filter((inv) => {
      if (statusFilter !== "all") return String(inv.status || "").toLowerCase() === statusFilter;
      return true;
    })
    .filter((inv) => {
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return String(inv.invoice_id || "").toLowerCase().includes(q) ||
        String(inv.customer || "").toLowerCase().includes(q);
    });

  const handleView = (url) => {
    if (!url) return alert("Invoice not available");
    window.open(url, "_blank");
  };

  const handleDownload = async (url, invoiceId) => {
    if (!url) return alert("Invoice not available");
    try {
      const resp = await fetch(url, { credentials: "include" });
      if (!resp.ok) {
        alert("Failed to download invoice");
        return;
      }
      const blob = await resp.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      // try to keep original extension if available
      const ext = (resp.headers.get("content-disposition") || "").match(/filename="?(.+?)"?$/);
      const filename = ext ? ext[1] : `${invoiceId || "invoice"}.pdf`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  return (
    <div className="lg:p-10">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Payment History</h1>
            <p className="text-sm text-slate-500 mt-1">All invoices, payouts and payment records. You can view or download invoices.</p>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Input
                  placeholder="Search invoice id or customer..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-w-0"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border border-slate-200 px-3 py-2 bg-white"
                >
                  <option value="all">All status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="text-sm text-slate-500">
                {loading ? "Loading..." : `${filtered.length} records`}
              </div>
            </div>

            {error && <div className="text-red-600 mb-3">{error}</div>}

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left text-sm text-slate-700 border-b">
                    <th className="px-3 py-2">Invoice ID</th>
                    <th className="px-3 py-2">Invoice To</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-sm text-slate-500">No records found</td>
                    </tr>
                  ) : (
                    filtered.map((inv) => (
                      <tr key={inv.invoice_id || inv.id} className="border-b last:border-b-0 hover:bg-slate-50">
                        <td className="px-3 py-3 align-top">
                          <div className="font-medium text-sm">{inv.invoice_id || `#${inv.id || "N/A"}`}</div>
                          <div className="text-xs text-slate-400">{inv.reference || ""}</div>
                        </td>

                        <td className="px-3 py-3 align-top">
                          <div className="text-sm">{inv.customer || inv.invoice_to || "—"}</div>
                          <div className="text-xs text-slate-400">{inv.email || ""}</div>
                        </td>

                        <td className="px-3 py-3 align-top">
                          <div className="text-sm font-medium">Rs. {Number(inv.amount || inv.total || 0).toLocaleString()}</div>
                          <div className="text-xs text-slate-400">{inv.currency || "NPR"}</div>
                        </td>

                        <td className="px-3 py-3 align-top">
                          <div className="text-sm">{inv.date ? format(new Date(inv.date), "MMM d, yyyy") : "—"}</div>
                          <div className="text-xs text-slate-400">{inv.time ? format(new Date(inv.time), "HH:mm") : ""}</div>
                        </td>

                        <td className="px-3 py-3 align-top">
                          <StatusBadge status={inv.status} />
                        </td>

                        <td className="px-3 py-3 align-top">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleView(inv.invoice_url || inv.pdf_url)}>
                              <Eye className="w-4 h-4" /> <span className="ml-2 hidden sm:inline">View</span>
                            </Button>

                            <Button size="sm" onClick={() => handleDownload(inv.invoice_url || inv.pdf_url, inv.invoice_id || inv.id)}>
                              <Download className="w-4 h-4" /> <span className="ml-2 hidden sm:inline">Download</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* simple pagination controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-500">Page {page}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
                <Button size="sm" onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "unknown").toLowerCase();
  if (s === "completed" || s === "paid" || s === "success") return <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>;
  if (s === "pending") return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
  if (s === "failed" || s === "cancelled") return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
  return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
}

// fallback sample data when backend not available
function sampleData() {
  const now = new Date();
  return [
    {
      id: 1,
      invoice_id: "INV-2025-001",
      invoice_to: "Ram Shrestha",
      customer: "Ram Shrestha",
      email: "ram@example.com",
      amount: 1200,
      currency: "NPR",
      date: now.toISOString(),
      status: "completed",
      invoice_url: `${API_BASE}/sample-invoices/INV-2025-001.pdf`,
    },
    {
      id: 2,
      invoice_id: "INV-2025-002",
      invoice_to: "Gita Rai",
      customer: "Gita Rai",
      email: "gita@example.com",
      amount: 800,
      currency: "NPR",
      date: new Date(now.getTime() - 86400000).toISOString(),
      status: "pending",
      invoice_url: `${API_BASE}/sample-invoices/INV-2025-002.pdf`,
    },
    {
      id: 3,
      invoice_id: "INV-2025-003",
      invoice_to: "Suman Karki",
      customer: "Suman Karki",
      email: "suman@example.com",
      amount: 1500,
      currency: "NPR",
      date: new Date(now.getTime() - 2 * 86400000).toISOString(),
      status: "failed",
      invoice_url: `${API_BASE}/sample-invoices/INV-2025-003.pdf`,
    },
  ];
}