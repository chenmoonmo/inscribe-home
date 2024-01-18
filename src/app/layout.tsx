import "./globals.css";

import { Header } from "../components/header";
import { Providers } from "./providers";

export const metadata = {
  title: "wagmi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-system">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
