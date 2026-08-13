import React from "react";
import TutorialCard from "../components/tutorial-card";
import { getAllTutorials } from "../../lib/tutorials";

export default async function TutorialsPage() {
  const tutorials = await getAllTutorials();

  return (
    <main style={{ padding: 24 }}>
      <h1>Tutorials</h1>
      <p>Free tutorials and posts — open access.</p>
      <div style={{ display: "grid", gap: 12 }}>
        {tutorials.map((t) => (
          <TutorialCard key={t.slug} tutorial={t} />
        ))}
      </div>
    </main>
  );
}
