import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Humanbase",
    short_name: "Humanbase",
    description: "A date-first personal notes timeline.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1eb",
    theme_color: "#f4f1eb",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
