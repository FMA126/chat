import { type Config } from "tailwindcss";
import ht from "@headlessui/tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [ht({ prefix: "ui" })],
} satisfies Config;
