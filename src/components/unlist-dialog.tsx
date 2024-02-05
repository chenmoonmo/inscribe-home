"use client";
import { Button, Dialog } from "@radix-ui/themes";
import { MarketCard } from "./market-card";
import { FC, ReactNode } from "react";
import { OrderType } from "@/type/marketplace";
import { encodePacked, keccak256, parseEther } from "viem";
import { useParams } from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { useSWRConfig } from "swr";
import { useTransactionDialog } from "./transaction-provider";

export const UnlistDialog: FC<{
  children: ReactNode;
  orderInfo: OrderType;
}> = ({ orderInfo, children }) => {
  const { p, tick } = useParams<{
    p: string;
    tick: string;
  }>();

  const { address } = useAccount();
  const { mutate } = useSWRConfig();
  const { showDialog, hideDialog } = useTransactionDialog();

  const { signMessageAsync } = useSignMessage();

  const handleUnlist = async () => {
    showDialog({
      title: "Transaction Confirmation",
      content: "Please confirm the transaction in your wallet",
      status: "loading",
    });

    const pBytes = encodePacked(["string"], [p]);
    const tickBytes = encodePacked(["string"], [tick]);
    const deadline = 0;

    //protocol,tick,user,order_id,amount,deadline,recv
    const packData = encodePacked(
      ["bytes", "bytes", "address", "uint256", "uint256", "uint256", "uint256"],
      [
        pBytes,
        tickBytes,
        address!,
        BigInt(orderInfo.order_id),
        BigInt(orderInfo.sell_amount),
        BigInt(deadline),
        parseEther(orderInfo.recv_amount),
      ]
    );

    const shaInfo = keccak256(packData, "hex");
    try {
      const signature = await signMessageAsync({
        message: { raw: shaInfo } as any,
      });

      showDialog({
        title: "Transaction Confirmation",
        content: "Transaction Pending",
        status: "loading",
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cancleOrder?user=${address}&order_id=${orderInfo.order_id}&sign=${signature}`
      ).then((res) => res.json());

      if (res.errCode !== 200) {
        throw new Error("Transaction Failed");
      }

      showDialog({
        title: "Transaction Confirmation",
        content: "Transaction Confirmed",
        status: "success",
      });
      setTimeout(() => {
        mutate(
          `${process.env.NEXT_PUBLIC_API_URL}/getOrderList?protocol=${p}&tick=${tick}`
        );
        mutate(
          `${process.env.NEXT_PUBLIC_API_URL}/getMyOrderList?protocol=${p}&tick=${tick}&user=${address}`
        );
        hideDialog();
      }, 1000);
    } catch (e) {
      showDialog({
        title: "Transaction Error",
        content: "Please try again",
        status: "error",
      });
      setTimeout(() => {
        hideDialog();
      }, 2000);
      return;
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title className="relative flex items-center">
          <span>Unlist</span>
          <Dialog.Close className="absolute right-2 cursor-pointer">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </Dialog.Close>
        </Dialog.Title>
        <div className="flex flex-col items-center gap-5">
          <div className="self-center mb-4">
            <MarketCard hiddenActions orderInfo={orderInfo} />
          </div>
          <div className="text-secondary">
            Note: we just unlist the items from our database for now
          </div>
          <Button
            size="3"
            className="w-full"
            variant="classic"
            onClick={handleUnlist}
          >
            Confirm
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
