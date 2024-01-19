import Link from "next/link";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex justify-end bg-[#ffb1b9]">
        <Link
          className="pr-2 text-blue-600"
          href="https://github.com/FMA126/chat/issues"
          target="_blank"
        >
          Report an issue
        </Link>
      </div>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#ffb1b9] to-[#f26e2b]">
        {children}
      </main>
    </>
  );
}
