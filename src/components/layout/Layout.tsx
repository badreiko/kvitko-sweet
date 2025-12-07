import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { BlogNotification } from "../BlogNotification";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <BlogNotification />
    </div>
  );
};

export default Layout;