"use client";
import { InscribeForm } from "@/components/inscribe-form";
import NoSSR from "react-no-ssr";

export default function Page({
  params: { p },
}: {
  params: {
    p: string;
  };
}) {
  return (
    <NoSSR>
      <main className="flex flex-col items-center px-5 pt-20 gap-10">
        <InscribeForm p={p} />
      </main>
    </NoSSR>
  );
}
