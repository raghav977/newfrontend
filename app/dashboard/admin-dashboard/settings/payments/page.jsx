// ...existing code...
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PaymentSetup() {
  const [esewaId, setEsewaId] = useState("");
  const [khaltiId, setKhaltiId] = useState("");
  const [bankDetails, setBankDetails] = useState({ accountNumber: "", accountName: "", bankName: "" });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("provider_payment_info");
      if (raw) {
        const parsed = JSON.parse(raw);
        setEsewaId(parsed.esewaId || "");
        setKhaltiId(parsed.khaltiId || "");
        setBankDetails(parsed.bankDetails || { accountNumber: "", accountName: "", bankName: "" });
      }
    } catch (e) {}
  }, []);

  const isMobileValid = (val) => {
    if (!val) return true; // allow empty (other methods may be provided)
    const s = String(val).trim();
    return /^(98|97)\d{8}$/.test(s);
  };

  const validate = () => {
    const e = {};
    if (esewaId && !isMobileValid(esewaId)) e.esewaId = "eSewa ID must be 10 digits and start with 98 or 97";
    if (khaltiId && !isMobileValid(khaltiId)) e.khaltiId = "Khalti ID must be 10 digits and start with 98 or 97";
    if (bankDetails.accountNumber && !/^[\d\-]{6,24}$/.test(bankDetails.accountNumber.trim()))
      e.accountNumber = "Invalid account number";
    if (bankDetails.accountName && bankDetails.accountName.trim().length < 2) e.accountName = "Provide account holder name";
    if (bankDetails.bankName && bankDetails.bankName.trim().length < 2) e.bankName = "Provide bank name";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    if (!esewaId && !khaltiId && !bankDetails.accountNumber) {
      toast.error("Provide at least one payment method (eSewa, Khalti or Bank).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        esewa_id: esewaId.trim(),
        khalit_id: khaltiId.trim(), // API expects this key name per spec
        bank_name: bankDetails.bankName.trim(),
        account_number: bankDetails.accountNumber.trim(),
        account_holder_name: bankDetails.accountName.trim(),
      };

      const res = await fetch("http://localhost:5000/api/payments/create-payment-account", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        // show API error message if present
        const msg = (body && (body.message || body.data || body.error)) || "Save failed. Please check input.";
        toast.error(msg);
        return;
      }

      // success
      toast.success("Payment account saved successfully.");
      localStorage.setItem(
        "provider_payment_info",
        JSON.stringify({ esewaId: payload.esewa_id, khaltiId: payload.khalit_id, bankDetails: { bankName: payload.bank_name, accountNumber: payload.account_number, accountName: payload.account_holder_name } })
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save payment account error:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value || "");
      setCopied(key);
      toast.info("Copied to clipboard");
      setTimeout(() => setCopied(""), 2000);
    } catch (e) {}
  };

  const anyValue =
    Boolean(esewaId) ||
    Boolean(khaltiId) ||
    Boolean(bankDetails.accountNumber) ||
    Boolean(bankDetails.accountName) ||
    Boolean(bankDetails.bankName);

  return (
    <div className="p-6 lg:p-10">
      <ToastContainer position="top-center" />
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-green-800">Payment Methods</h1>
          <p className="text-sm text-slate-600 mt-1">Add or update your payout methods. Keep at least one method to receive payments.</p>
        </div>
        <div className="text-sm text-slate-500">{new Date().toLocaleDateString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-100">
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-green-800">eSewa</h2>
              <p className="text-xs text-slate-500">Mobile / ID used to receive payments via eSewa</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="esewaId">eSewa ID / Mobile</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="esewaId"
                  placeholder="e.g., 9801234567"
                  value={esewaId}
                  onChange={(e) => setEsewaId(e.target.value)}
                  className={`border ${errors.esewaId ? "border-red-300" : "border-green-200"} focus:border-green-500`}
                />
                <Button variant="ghost" onClick={() => handleCopy(esewaId, "esewa")} disabled={!esewaId} title="Copy">Copy</Button>
              </div>
              {errors.esewaId && <div className="text-xs text-red-600">{errors.esewaId}</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-green-800">Khalti</h2>
              <p className="text-xs text-slate-500">Mobile / ID used to receive payments via Khalti</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="khaltiId">Khalti ID / Mobile</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="khaltiId"
                  placeholder="e.g., 9801234567"
                  value={khaltiId}
                  onChange={(e) => setKhaltiId(e.target.value)}
                  className={`border ${errors.khaltiId ? "border-red-300" : "border-green-200"} focus:border-green-500`}
                />
                <Button variant="ghost" onClick={() => handleCopy(khaltiId, "khalti")} disabled={!khaltiId} title="Copy">Copy</Button>
              </div>
              {errors.khaltiId && <div className="text-xs text-red-600">{errors.khaltiId}</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-green-100">
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-green-800">Bank Account</h2>
              <p className="text-xs text-slate-500">Provide account details for direct transfers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="bankName">Bank</Label>
                <Input
                  id="bankName"
                  placeholder="e.g., PRIME BANK"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className={`border ${errors.bankName ? "border-red-300" : "border-green-200"} focus:border-green-500`}
                />
                {errors.bankName && <div className="text-xs text-red-600">{errors.bankName}</div>}
              </div>

              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="accountNumber"
                    placeholder="e.g., 1234567890"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    className={`border ${errors.accountNumber ? "border-red-300" : "border-green-200"} focus:border-green-500`}
                  />
                  <Button variant="ghost" onClick={() => handleCopy(bankDetails.accountNumber, "bankAcc")} disabled={!bankDetails.accountNumber}>Copy</Button>
                </div>
                {errors.accountNumber && <div className="text-xs text-red-600">{errors.accountNumber}</div>}
                {copied === "bankAcc" && <div className="text-sm text-emerald-600 mt-1">Copied</div>}
              </div>

              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="e.g., Ram"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  className={`border ${errors.accountName ? "border-red-300" : "border-green-200"} focus:border-green-500`}
                />
                {errors.accountName && <div className="text-xs text-red-600">{errors.accountName}</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mt-6 gap-4">
        <div>
          <p className="text-sm text-slate-500">
            Tip: Keep your payment IDs up-to-date. You can use any combination of payment methods.
          </p>
          {saved && <div className="mt-2 text-sm text-emerald-600">Payment methods saved successfully.</div>}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => {
            try {
              const raw = localStorage.getItem("provider_payment_info");
              if (raw) {
                const parsed = JSON.parse(raw);
                setEsewaId(parsed.esewaId || "");
                setKhaltiId(parsed.khaltiId || "");
                setBankDetails(parsed.bankDetails || { accountNumber: "", accountName: "", bankName: "" });
                setErrors({});
              } else {
                setEsewaId("");
                setKhaltiId("");
                setBankDetails({ accountNumber: "", accountName: "", bankName: "" });
                setErrors({});
              }
            } catch (e) {}
          }}>Reset</Button>

          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSave} disabled={saving || !anyValue}>
            {saving ? "Saving..." : "Save Payment Methods"}
          </Button>
        </div>
      </div>
    </div>
  );
}
