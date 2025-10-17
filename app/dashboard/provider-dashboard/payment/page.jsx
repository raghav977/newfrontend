"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
// import { Bank, Smartphone, Copy, Check } from "lucide-react";
import { CreditCard, Bank, Smartphone,Copy } from "lucide-react";


export default function PaymentSetup() {
  const [esewaId, setEsewaId] = useState("");
  const [khaltiId, setKhaltiId] = useState("");
  const [bankDetails, setBankDetails] = useState({ accountNumber: "", accountName: "", bankName: "" });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    // load saved values if any (local fallback)
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

  const validate = () => {
    const e = {};
    if (esewaId && !/^\d{7,15}$/.test(esewaId.trim())) e.esewaId = "Enter a valid number (7-15 digits)";
    if (khaltiId && !/^\d{7,15}$/.test(khaltiId.trim())) e.khaltiId = "Enter a valid number (7-15 digits)";
    if (bankDetails.accountNumber && !/^[\d\-]{6,24}$/.test(bankDetails.accountNumber.trim()))
      e.accountNumber = "Invalid account number";
    if (bankDetails.accountName && bankDetails.accountName.trim().length < 2) e.accountName = "Provide account holder name";
    if (bankDetails.bankName && bankDetails.bankName.trim().length < 2) e.bankName = "Provide bank name";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    // simulate save; replace with real API call
    try {
      const payload = { esewaId, khaltiId, bankDetails };
      // await fetch('/api/save-payment', { method: 'POST', body: JSON.stringify(payload) })
      localStorage.setItem("provider_payment_info", JSON.stringify(payload));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (value, key) => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    try {
      await navigator.clipboard.writeText(value || "");
      setCopied(key);
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
            <div className="flex items-center gap-3">
              {/* <Smartphone className="w-5 h-5 text-green-600" /> */}
              <div>
                <h2 className="text-lg font-semibold text-green-800">eSewa</h2>
                <p className="text-xs text-slate-500">Mobile / ID used to receive payments via eSewa</p>
              </div>
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
                <Button variant="ghost" onClick={() => handleCopy(esewaId, "esewa")} disabled={!esewaId} title="Copy">
                  {/* <Copy className="w-4 h-4" /> */}
                </Button>
                {copied === "esewa" && <span className="text-sm text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4" />Copied</span>}
              </div>
              {errors.esewaId && <div className="text-xs text-red-600">{errors.esewaId}</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {/* <Smartphone className="w-5 h-5 text-green-600" /> */}
              <div>
                <h2 className="text-lg font-semibold text-green-800">Khalti</h2>
                <p className="text-xs text-slate-500">Mobile / ID used to receive payments via Khalti</p>
              </div>
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
                <Button variant="ghost" onClick={() => handleCopy(khaltiId, "khalti")} disabled={!khaltiId} title="Copy">
                  {/* <Copy className="w-4 h-4" /> */}
                </Button>
                {copied === "khalti" && <span className="text-sm text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4" />Copied</span>}
              </div>
              {errors.khaltiId && <div className="text-xs text-red-600">{errors.khaltiId}</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-green-100">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {/* <Bank className="w-5 h-5 text-green-600" /> */}
              <div>
                <h2 className="text-lg font-semibold text-green-800">Bank Account</h2>
                <p className="text-xs text-slate-500">Provide account details for direct transfers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="col-span-1 md:col-span-1">
                <Label htmlFor="bankName">Bank</Label>
                <Input
                  id="bankName"
                  placeholder="e.g., Nepal Bank"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className={`border ${errors.bankName ? "border-red-300" : "border-green-200"} focus:border-green-500`}
                />
                {errors.bankName && <div className="text-xs text-red-600">{errors.bankName}</div>}
              </div>

              <div className="col-span-1 md:col-span-1">
                <Label htmlFor="accountNumber">Account Number</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="accountNumber"
                    placeholder="e.g., 1234567890"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    className={`border ${errors.accountNumber ? "border-red-300" : "border-green-200"} focus:border-green-500`}
                  />
                  <Button variant="ghost" onClick={() => handleCopy(bankDetails.accountNumber, "bankAcc")} disabled={!bankDetails.accountNumber}>
                    {/* <Copy className="w-4 h-4" /> */}
                  </Button>
                </div>
                {errors.accountNumber && <div className="text-xs text-red-600">{errors.accountNumber}</div>}
                {copied === "bankAcc" && <div className="text-sm text-emerald-600 flex items-center gap-1 mt-1"><Check className="w-4 h-4" />Copied</div>}
              </div>

              <div className="col-span-1 md:col-span-1">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="e.g., John Doe"
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
            // reset to last saved values
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