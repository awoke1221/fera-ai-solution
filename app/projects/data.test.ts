import assert from "node:assert/strict";
import test from "node:test";

import { projects } from "./data";

test("project slugs are unique and every case study has scope and highlights", () => {
  const slugs = projects.map((project) => project.slug);

  assert.equal(new Set(slugs).size, slugs.length);
  for (const project of projects) {
    assert.ok(project.deliverables.length > 0, `${project.slug} needs deliverables`);
    assert.ok(project.highlights.length > 0, `${project.slug} needs highlights`);
  }
});

test("new projects point to their live sites and current preview assets", () => {
  const expectedProjects = [
    {
      slug: "fiyorina-chiffon",
      website: "https://www.fiyorinachiffon.com/",
      image: "https://www.fiyorinachiffon.com/og-image.jpg",
    },
    {
      slug: "st-mary-st-gabriel-church",
      website: "https://www.stleotc.org/",
      image: "https://www.stleotc.org/church-logo.png",
    },
    {
      slug: "denbegnaye-ai-platform",
      website: "https://www.denbegnayeaiagent.com/",
      image: "https://www.denbegnayeaiagent.com/denbegnaye-og.png",
    },
  ];

  for (const expected of expectedProjects) {
    const project = projects.find((item) => item.slug === expected.slug);

    assert.ok(project, `Missing project ${expected.slug}`);
    assert.equal(project.website, expected.website);
    assert.equal(project.image, expected.image);
  }
});
