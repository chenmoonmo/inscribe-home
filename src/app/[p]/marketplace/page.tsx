"use client";
import { TickInfoType } from "@/type/marketplace";
import { formatPrice } from "@/utils/format";
import { Heading, Table } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import NoSSR from "react-no-ssr";
import useSWR from "swr";
import { formatEther } from "viem";

export default function Page({
  params: { p },
}: {
  params: {
    p: string;
  };
}) {
  const router = useRouter();

  const { data: tickList } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/getSwapTickInfo?protocol=${p}`,
    (url: string) =>
      fetch(url)
        .then((res) => res.json())
        .then((res) => {
          const tickInfo = res.tick_info as TickInfoType[];
          return tickInfo.map((tick) => ({
            ...tick,
            totalSupply: tick.total_supply,
            price: formatEther(BigInt(tick.price)),
            volume24: formatEther(BigInt(tick.volume_24)),
            marketCap: formatEther(BigInt(tick.market_cap)),
            minter: formatEther(BigInt(tick.market_cap) * BigInt(100)) + "%",
          }));
        })
  );

  return (
    <main className="flex flex-col items-center pt-20 gap-8">
      <Heading size="8">The {p} Marketplace</Heading>
      <Table.Root className="w-[1200px]">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Token</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Volume 24H</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Marketcap</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Total Supply</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Holders</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Minted</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tickList?.map((tick) => (
            <Table.Row
              key={tick.tick}
              className="hover:bg-gray-50 bg-opacity-10 cursor-pointer"
              onClick={() => router.push(`/${p}/marketplace/${tick.tick}`)}
            >
              <Table.RowHeaderCell>{tick.tick}</Table.RowHeaderCell>
              <Table.Cell>{formatPrice(tick.price)} ETH</Table.Cell>
              <Table.Cell>{formatPrice(tick.volume24)} ETH</Table.Cell>
              <Table.Cell>{formatPrice(tick.marketCap)} ETH</Table.Cell>
              <Table.Cell>{tick.total_supply}</Table.Cell>
              <Table.Cell>{tick.holders}</Table.Cell>
              <Table.Cell>{tick.minter}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </main>
  );
}
