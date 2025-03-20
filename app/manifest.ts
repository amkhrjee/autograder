import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Autograder",
    short_name: "Autograder",
    description: "Automatic grading for Tezpur University",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/Memo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/Memo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
