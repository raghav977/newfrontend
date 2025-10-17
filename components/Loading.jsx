import React from "react";

export default function Loading({ perPage = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: perPage }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse p-6 bg-white rounded-xl shadow-sm border border-slate-100"
        >
          <div className="h-36 bg-slate-100 rounded-md mb-4" />
          <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
          <div className="flex gap-2 mt-3">
            <div className="h-8 w-24 bg-slate-100 rounded" />
            <div className="h-8 w-24 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
