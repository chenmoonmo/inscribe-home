import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Inscribe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-system">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
