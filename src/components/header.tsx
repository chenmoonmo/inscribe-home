"use client";
import classnames from "classnames";
import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navs = [
  {
    name: "Inscribe",
    href: "/",
  },
  {
    name: "Ticker",
    href: "/ticker",
  },
  {
    name: "Marketplace",
    href: "",
  },
  {
    name: "Balance",
    href: "/balance",
  },
];

export const Header = ({ p }: { p: string }) => {
  const pathname = usePathname();
  return (
    <header className="flex items-center justify-between h-20 px-5">
      <div className="flex items-center">
        <div className="flex items-center gap-[42px]">
          {Navs.map((item) => (
            <Link
              key={item.name}
              href={`/${p}${item.href}`}
              className={classnames(
                "font-extrabold text-lg hover:text-[var(--accent-9)]",
                (item.href === "/" && pathname.endsWith(p)) ||
                  (item.href !== "" && pathname.endsWith(item.href))
                  ? "text-[var(--accent-9)]"
                  : "text-[#1F2127]",
                {
                  "pointer-events-none": item.href === "",
                  "text-gray-400": item.href === "",
                }
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      <ConnectKitButton />
    </header>
  );
};
