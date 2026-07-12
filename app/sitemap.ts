import { MetadataRoute } from "next";
import { projects } from "./projects/data";
import { insights } from "./insights/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const projectEntries = projects.map((project) => ({
    url: `https://feraisolutions.com/projects/${project.slug}`,
    lastModified: new Date(),
  }));

  const insightEntries = insights.map((insight) => ({
    url: `https://feraisolutions.com/insights/${insight.slug}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: "https://feraisolutions.com",
      lastModified: new Date(),
    },
    ...projectEntries,
    ...insightEntries,
  ];
}
