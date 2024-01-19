import { Header } from "@/components/header";

export const metadata = {
  title: "Inscribe",
};

export default function RootLayout({
  children,
  params: { p },
}: {
  children: React.ReactNode;
  params: {
    p: string;
  };
}) {
  return (
    <>
      <Header p={p} />
      {children}
    </>
  );
}
