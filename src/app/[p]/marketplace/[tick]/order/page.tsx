"use client";
import { UnlistDialog } from "@/components/unlist-dialog";
import { OrderStatus } from "@/constants/enums";
import { OrderType } from "@/type/marketplace";
import { formatPrice } from "@/utils/format";
import { Button, Table } from "@radix-ui/themes";
import useSWR from "swr";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

// my order
export default function Page({
  params: { p, tick },
}: {
  params: {
    p: string;
    tick: string;
  };
}) {
  const { address } = useAccount();

  const { data: orderList } = useSWR(
    address
      ? `${process.env.NEXT_PUBLIC_API_URL}/getMyOrderList?protocol=${p}&tick=${tick}&user=${address}`
      : null,
    (url: string) =>
      fetch(url)
        .then((res) => res.json())
        .then((res) =>
          (res.order_list as OrderType[]).map((order) => ({
            ...order,
            price: formatEther(BigInt(order.price)),
            recv_amount: formatEther(BigInt(order.recv_amount)),
          }))
        )
  );

  return (
    <Table.Root
      className="relative mt-5"
      style={{
        height: "calc(100% - 60px)",
      }}
    >
      <Table.Header>
        <Table.Row className="sticky top-0 z-100 bg-white">
          <Table.ColumnHeaderCell>State</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Token</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {orderList?.map((order) => (
          <Table.Row key={order.order_id}>
            <Table.Cell>
              <span className="flex h-full items-center">
                {OrderStatus[order.status]}
              </span>
            </Table.Cell>
            <Table.Cell>
              <span className="flex h-full items-center">{order.tick}</span>
            </Table.Cell>
            <Table.Cell>
              <span className="flex h-full items-center">
                {order.sell_amount}
              </span>
            </Table.Cell>
            <Table.Cell>
              <span className="flex h-full items-center">
                {formatPrice(order.price)}
              </span>
            </Table.Cell>
            <Table.Cell>
              <span className="flex h-full items-center">-</span>
            </Table.Cell>
            <Table.Cell width="100px">
              {order.status === OrderStatus.Listed && (
                <UnlistDialog orderInfo={order}>
                  <Button variant="classic" color="ruby">
                    Unlist
                  </Button>
                </UnlistDialog>
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
