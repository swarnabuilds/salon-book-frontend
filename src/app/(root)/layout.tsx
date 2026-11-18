import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 antialiased">
      <Navbar />
      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer component will be rendered here later */}
      <Footer />
    </div>
  );
}



