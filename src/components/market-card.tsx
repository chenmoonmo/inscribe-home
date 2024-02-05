"use client";
import { Button, Card } from "@radix-ui/themes";
import { UnlistDialog } from "./unlist-dialog";
import { ListDialog } from "./list-dialog";
import { memo } from "react";
import { OrderType } from "@/type/marketplace";
import { formatPrice } from "@/utils/format";
import { useAccount, useSendTransaction, useWaitForTransaction } from "wagmi";
import stringify from "json-stable-stringify";
import { useTransactionDialog } from "./transaction-provider";
import { useContracts } from "@/hooks/use-contracts";
import { toHex } from "viem";
import { useSWRConfig } from "swr";
import { useParams } from "next/navigation";
import { useModal } from "connectkit";

type MarketCardProps<T = boolean> = {
  orderInfo: T extends false
    ? OrderType & { isMyOrder: boolean }
    : {
        tick: string;
        price: string;
        sell_amount: string;
        recv_amount: string;
      };
  hiddenActions?: T;
};

export const MarketCard = memo(
  ({ orderInfo, hiddenActions = false }: MarketCardProps) => {
    const { p, tick } = useParams<{
      p: string;
      tick: string;
    }>();
    const { isConnected, address } = useAccount();
    const { setOpen } = useModal();

    const { showDialog, hideDialog } = useTransactionDialog();
    const { mutate } = useSWRConfig();

    const { inscription } = useContracts();

    const { data, sendTransaction } = useSendTransaction({
      onSuccess: (data) => {
        showDialog({
          title: "Transaction Confirmation",
          content: "Transaction Pending",
          status: "loading",
        });
      },
      onError: (e) => {
        showDialog({
          title: "Transaction Error",
          content: "Please try again",
          status: "error",
        });
        setTimeout(hideDialog, 3000);
      },
    });

    useWaitForTransaction({
      ...data,
      onSuccess: (data) => {
        setTimeout(() => {
          showDialog({
            title: "Transaction Confirmation",
            content: "Transaction Confirmed",
            status: "success",
          });
          mutate(
            `${process.env.NEXT_PUBLIC_API_URL}/getOrderList?protocol=${p}&tick=${tick}`
          );
          mutate(
            `${process.env.NEXT_PUBLIC_API_URL}/getMyOrderList?protocol=${p}&tick=${tick}&user=${address}`
          );
          hideDialog();
        }, 3000);
      },
      onError: (error) => {
        showDialog({
          title: "Transaction Error",
          content: "Please try again",
          status: "error",
        });
        setTimeout(hideDialog, 3000);
      },
    });

    const handleBuy = async () => {
      if (hiddenActions) return;
      const { user, order_id } = orderInfo as OrderType;
      // 铭文信息
      const inscriptionJSON = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getOrderInfo?order_id=${order_id}&user=${user}`
      )
        .then((res) => res.json())
        .then((res) => res.order_info as string);

      const inscriptionInfo = JSON.parse(inscriptionJSON);
      const keys = Object.getOwnPropertyNames(inscriptionInfo);

      const jsonString = stringify(inscriptionInfo, function (a, b) {
        return keys.indexOf(a.key) > keys.indexOf(b.key) ? 1 : -1;
      });

      console.log(inscriptionJSON, inscriptionInfo, jsonString);

      showDialog({
        title: "Transaction Confirmation",
        content: "Please confirm the transaction in your wallet",
        status: "loading",
      });
      sendTransaction({
        to: inscription,
        value: BigInt(inscriptionInfo.rece),
        data: toHex(jsonString),
      });
    };

    return (
      <Card variant="classic" className="w-60 hover:shadow-lg">
        <div className="relative flex flex-col h-[180px] justify-center items-center gap-2 px-3 text-lg border-b-px">
          <div className="absolute top-0 left-0 border-px px-2 rounded-md text-sm">
            {orderInfo.tick}
          </div>
          <div className="text-2xl font-semibold">
            {orderInfo.sell_amount ? formatPrice(orderInfo.sell_amount) : "-"}
          </div>
          <div className="font-medium">
            {orderInfo.price ? formatPrice(orderInfo.price) : "-"} ETH/
            {orderInfo.tick}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 pt-3 text-lg">
          <div className="font-semibold">
            {orderInfo.recv_amount ? formatPrice(orderInfo.recv_amount) : "-"}{" "}
            ETH
          </div>
          {!hiddenActions && (
            <div className="flex items-center gap-2">
              {(orderInfo as { isMyOrder: boolean }).isMyOrder ? (
                <>
                  <UnlistDialog orderInfo={orderInfo as OrderType}>
                    <Button className="w-24" variant="classic" color="ruby">
                      Unlist
                    </Button>
                  </UnlistDialog>
                  <ListDialog orderInfo={orderInfo as OrderType}>
                    <Button className="w-24" variant="classic" color="bronze">
                      Edit
                    </Button>
                  </ListDialog>
                </>
              ) : isConnected ? (
                <Button className="w-24" variant="classic" onClick={handleBuy}>
                  Buy
                </Button>
              ) : (
                <Button
                  variant="classic"
                  color="indigo"
                  onClick={() => setOpen(true)}
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }
);

MarketCard.displayName = "MarketCard";
