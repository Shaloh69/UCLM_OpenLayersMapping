export default function NavLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="fixed left-0 top-0 w-full h-full">
      <div className="relative inset-0">{children}</div>
    </section>
  );
}
