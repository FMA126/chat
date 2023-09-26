export function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#ffb1b9] to-[#f26e2b] p-1 md:p-4 lg:p-8">
        {children}
      </div>
    </>
  );
}
