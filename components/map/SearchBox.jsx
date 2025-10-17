"use client";

import React, {
  forwardRef,
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";

const NominatimUrl = (q, limit = 6) =>
  `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}&addressdetails=1&q=${encodeURIComponent(
    q
  )}`;

const SearchBox = forwardRef(function SearchBox({ onLocationSelect, placeholder = "Search place or address..." }, ref) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      setSearchTerm("");
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlight(-1);
    },
  }));

  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);

    return () => {
      clearTimeout(debounceRef.current);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchSuggestions = async (q) => {
    setLoading(true);
    setShowSuggestions(true);
    setHighlight(-1);
    try {
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const res = await fetch(NominatimUrl(q), {
        signal: ac.signal,
        headers: {
          "Accept-Language": "en",
          "User-Agent": "upaayax-clone/1.0 (your@email.example)",
        },
      });
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      const items = (json || []).map((it) => ({
        lat: it.lat,
        lng: it.lon,
        display_name: it.display_name,
        raw: it,
        address: it.address || {},
        type: it.type,
        class: it.class,
      }));
      setSuggestions(items);
    } catch (err) {
      if (err.name !== "AbortError") console.debug("Search error", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleSelect = (item) => {
    setSearchTerm(item.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setHighlight(-1);
    if (typeof onLocationSelect === "function") {
      onLocationSelect({
        lat: item.lat,
        lng: item.lng,
        name: item.display_name,
        raw: item.raw,
      });
    }
  };

  const onKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = highlight >= 0 ? suggestions[highlight] : suggestions[0];
      if (sel) handleSelect(sel);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const onDocClick = (ev) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(ev.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-full">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
        />
        <button
          type="button"
          onClick={() => {
            if (searchTerm && searchTerm.trim().length >= 2) fetchSuggestions(searchTerm);
            inputRef.current?.focus();
          }}
          className="px-3 py-2 bg-green-600 text-white rounded text-sm"
        >
          Search
        </button>
      </div>

      {showSuggestions && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-50 max-h-56 overflow-auto">
          {loading && <div className="p-2 text-sm text-gray-500">Searching...</div>}
          {!loading && suggestions.length === 0 && (
            <div className="p-2 text-sm text-gray-500">No results</div>
          )}
          {!loading &&
            suggestions.map((s, i) => (
              <div
                key={`${s.lat}-${s.lng}-${i}`}
                role="option"
                aria-selected={highlight === i}
                onMouseEnter={() => setHighlight(i)}
                onMouseLeave={() => setHighlight(-1)}
                onClick={() => handleSelect(s)}
                className={`px-3 py-2 cursor-pointer hover:bg-green-50 ${
                  highlight === i ? "bg-green-50" : ""
                }`}
              >
                <div className="text-sm font-medium text-gray-800">{s.display_name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {s.class ? `${s.class} ${s.type}` : ""}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
});

export default SearchBox;