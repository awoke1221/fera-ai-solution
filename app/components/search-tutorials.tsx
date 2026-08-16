"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import TutorialCard from "./tutorial-card";

export default function SearchTutorials({
  tutorials: initialTutorials,
}: {
  tutorials: any[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState(initialTutorials);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimer = useRef<number | null>(null);

  useEffect(() => {
    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current);
    }

    if (!searchQuery.trim()) {
      setResults(initialTutorials);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchTimer.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/tutorials/search?q=${encodeURIComponent(searchQuery)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimer.current) {
        window.clearTimeout(searchTimer.current);
      }
    };
  }, [searchQuery, initialTutorials]);

  return (
    <>
      <div
        style={{
          marginBottom: 32,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search tutorials by title, topic, or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(148,163,184,0.3)",
            fontSize: "1rem",
            fontFamily: "inherit",
            backgroundColor: "rgba(255,255,255,0.5)",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              "rgba(148,163,184,0.6)";
            (e.target as HTMLInputElement).style.backgroundColor =
              "rgba(255,255,255,0.8)";
            (e.target as HTMLInputElement).style.boxShadow =
              "0 0 0 3px rgba(2,132,199,0.1)";
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              "rgba(148,163,184,0.3)";
            (e.target as HTMLInputElement).style.backgroundColor =
              "rgba(255,255,255,0.5)";
            (e.target as HTMLInputElement).style.boxShadow = "";
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            style={{
              padding: "8px 12px",
              background: "rgba(148,163,184,0.1)",
              border: "1px solid rgba(148,163,184,0.3)",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {searchQuery && (
        <div
          style={{
            marginBottom: 24,
            padding: "12px 16px",
            background: "rgba(2,132,199,0.05)",
            border: "1px solid rgba(2,132,199,0.1)",
            borderRadius: "8px",
            fontSize: "0.875rem",
            color: "#0284c7",
          }}
        >
          {isSearching ? (
            <>🔄 Searching...</>
          ) : (
            <>
              Found <strong>{results.length}</strong> result
              {results.length !== 1 ? "s" : ""} for "
              <strong>{searchQuery}</strong>"
            </>
          )}
        </div>
      )}

      <div style={{ display: "grid", gap: 24 }}>
        {results.length > 0 ? (
          <div className="tutorials-grid">
            {results.map((tutorial) => (
              <TutorialCard key={tutorial.slug} tutorial={tutorial} />
            ))}
          </div>
        ) : searchQuery ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: "#64748b",
              borderRadius: "12px",
              background: "rgba(148,163,184,0.05)",
            }}
          >
            <p style={{ fontSize: "1.125rem", marginBottom: 8 }}>
              No tutorials found
            </p>
            <p style={{ fontSize: "0.875rem" }}>
              Try different keywords or browse by section and tags above.
            </p>
          </div>
        ) : (
          <div className="tutorials-grid">
            {results.map((tutorial) => (
              <TutorialCard key={tutorial.slug} tutorial={tutorial} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
