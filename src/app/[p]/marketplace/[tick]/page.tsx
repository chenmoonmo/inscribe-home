"use client";
import { MarketCard } from "@/components/market-card";
import { OrderType } from "@/type/marketplace";
import { ScrollArea } from "@radix-ui/themes";
import { useMemo } from "react";
import useSWR from "swr";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

export default function Page({
  params: { p, tick },
}: {
  params: {
    p: string;
    tick: string;
  };
}) {
  const { address } = useAccount();

  const { data } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/getOrderList?protocol=${p}&tick=${tick}`,
    (url: string) =>
      fetch(url)
        .then((res) => res.json())
        .then((res) => {
          const orderList = res.order_list as OrderType[];
          return orderList.map((order) => {
            return {
              ...order,
              recv_amount: formatEther(BigInt(order.recv_amount)),
              price: formatEther(BigInt(order.price)),
            };
          });
        })
  );

  const orderList = useMemo(() => {
    return data?.map((item) => {
      return {
        ...item,
        isMyOrder: item.user === address,
      };
    });
  }, [address, data]);

  return (
    <ScrollArea className="mt-5">
      <div
        className="grid grid-flow-row gap-y-8 gap-x-1 p-[1px] pb-14 items-center"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        }}
      >
        {orderList?.map((order) => (
          <MarketCard key={order.user + order.order_id} orderInfo={order} />
        ))}
      </div>
    </ScrollArea>
  );
}
