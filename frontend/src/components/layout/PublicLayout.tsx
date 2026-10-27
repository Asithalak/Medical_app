import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col print:min-h-0 print:block">
      <Header />
      <main className="flex-1 pt-24 print:pt-0 print:block">{children}</main>
      <Footer />
    </div>
  );
}
