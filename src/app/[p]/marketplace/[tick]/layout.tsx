"use client";
import { Button, Card, Heading } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classNames from "classnames";
import { ReactNode } from "react";
import useSWR from "swr";
import { ListDialog } from "@/components/list-dialog";
import { TickInfoType } from "@/type/marketplace";
import NoSSR from "react-no-ssr";
import { formatEther } from "viem";
import { formatPrice } from "@/utils/format";

export default function Layout({
  params: { p, tick },
  children,
}: {
  params: {
    p: string;
    tick: string;
  };
  children: ReactNode;
}) {
  const pathname = usePathname();

  const { data: tickInfo } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/getTickInfo?protocol=${p}&tick=${tick}`,
    (url: string) =>
      fetch(url)
        .then((res) => res.json())
        .then((res) => {
          const tickInfo = res.tick_info as TickInfoType;
          return {
            ...tickInfo,
            totalSupply: tickInfo.total_supply,
            price: formatEther(BigInt(tickInfo.price)),
            volume24: formatEther(BigInt(tickInfo.volume_24)),
            marketCap: formatEther(BigInt(tickInfo.market_cap)),
            minter:
              formatEther(BigInt(tickInfo.market_cap) * BigInt(100)) + "%",
          };
        })
  );

  return (
    <NoSSR>
      <main className="flex justify-center">
        <div
          className="flex flex-col py-2 w-full"
          style={{
            maxWidth: "1200px",
            height: "calc(100vh - 80px)",
          }}
        >
          <Card size="3" variant="classic">
            <div className="grid grid-cols-4 grid-rows-2 gap-y-8 items-center">
              <Heading size="9" className="flex justify-center row-span-2">
                {tick}
              </Heading>
              <div>
                <div className="text-gray-500 italic">Price</div>
                <div className="font-bold">
                  {tickInfo?.price ? formatPrice(tickInfo?.price) : "-"} ETH
                </div>
              </div>
              <div>
                <div className="text-gray-500 italic">Volume 24H</div>
                <div className="font-bold">
                  {tickInfo?.volume24 ? formatPrice(tickInfo?.volume24) : "-"}{" "}
                  ETH
                </div>
              </div>
              <div>
                <div className="text-gray-500 italic">Marketcap</div>
                <div className="font-bold">
                  {tickInfo?.marketCap ? formatPrice(tickInfo?.marketCap) : "-"}{" "}
                  ETH
                </div>
              </div>
              <div>
                <div className="text-gray-500 italic">Total Supply</div>
                <div className="font-bold">{tickInfo?.totalSupply ?? "-"}</div>
              </div>
              <div>
                <div className="text-gray-500 italic">Holders</div>
                <div className="font-bold">{tickInfo?.holders ?? "-"}</div>
              </div>
              <div>
                <div className="text-gray-500 italic">Deployed</div>
                <div className="font-bold">2023/01/02 23:12:12</div>
              </div>
            </div>
          </Card>
          <Card
            size="3"
            variant="classic"
            className="min-h-0 flex-1 !mt-4 flex flex-col"
          >
            <div className="flex justify-between">
              <div className="flex gap-8 text-lg font-bold">
                <Link
                  href={pathname.endsWith("order") ? `./` : ""}
                  className={classNames(
                    "flex items-center hover:text-[var(--accent-9)]",
                    {
                      "text-[var(--accent-9)]": !pathname.endsWith("order"),
                    }
                  )}
                >
                  Listings
                </Link>
                <Link
                  href={pathname.endsWith("order") ? `./` : `./${tick}/order`}
                  className={classNames(
                    "flex items-center hover:text-[var(--accent-9)]",
                    {
                      "text-[var(--accent-9)]": pathname.endsWith("order"),
                    }
                  )}
                >
                  My Order
                </Link>
              </div>
              <ListDialog>
                <Button size="3" variant="classic" className="w-[140px]">
                  List
                </Button>
              </ListDialog>
            </div>
            {children}
          </Card>
        </div>
      </main>
    </NoSSR>
  );
}
