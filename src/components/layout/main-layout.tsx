export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#ffb1b9] to-[#f26e2b]">
      {children}
    </main>
  );
}
