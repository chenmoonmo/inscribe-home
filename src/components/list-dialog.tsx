"use client";
import { Button, Dialog, TextField, TextFieldInput } from "@radix-ui/themes";
import { useAccount, useContractRead, useSignMessage } from "wagmi";
import { MarketCard } from "./market-card";
import { formatInput, formatPrice } from "@/utils/format";
import { FC, ReactNode, useMemo, useState } from "react";
import { encodePacked, formatEther, keccak256, parseEther } from "viem";
import { inscriptionABI } from "@/abis";
import { useContracts } from "@/hooks/use-contracts";
import { useParams } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import { OrderType, TickInfoType } from "@/type/marketplace";
import { useTransactionDialog } from "./transaction-provider";

export const ListDialog: FC<{
  children: ReactNode;
  orderInfo?: OrderType;
}> = ({ orderInfo, children }) => {
  const { mutate } = useSWRConfig();
  const { p, tick } = useParams<{ p: string; tick: string }>();
  const { inscription } = useContracts();
  const { address } = useAccount();
  const { showDialog, hideDialog } = useTransactionDialog();

  const [open, setOpen] = useState(false);

  const [listForm, setListForm] = useState({
    amount: orderInfo?.sell_amount ?? "",
    price: orderInfo?.price ?? "",
  });

  const recv = useMemo(() => {
    if (!listForm.amount || !listForm.price) return undefined;
    return BigInt(listForm.amount) * parseEther(listForm.price);
  }, [listForm.amount, listForm.price]);

  const { data: pAddr } = useContractRead({
    address: inscription,
    abi: inscriptionABI,
    functionName: "getProtocolAddr",
    args: [p],
  });

  const { data: balance } = useContractRead({
    address: pAddr,
    functionName: "getUserBalance",
    abi: [
      {
        inputs: [
          {
            internalType: "string",
            name: "p",
            type: "string",
          },
          {
            internalType: "string",
            name: "tick",
            type: "string",
          },
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
        ],
        name: "getUserBalance",
        outputs: [
          {
            internalType: "uint256",
            name: "balance",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    args: [p, tick, address],
  });

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

  const confirmButtonDisabled = useMemo(() => {
    return (
      !listForm.amount ||
      !listForm.price ||
      BigInt(listForm.amount) > (balance as bigint)
    );
  }, [balance, listForm.amount, listForm.price]);

  const { signMessageAsync } = useSignMessage();

  const handleList = async () => {
    showDialog({
      title: "Transaction Confirmation",
      content: "Please confirm the transaction in your wallet",
      status: "loading",
    });

    let newOrderId;

    if (!orderInfo) {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getOrderId?user=${address}`
      )
        .then((res) => res.json())
        .then((res) => {
          newOrderId = res.new_order_id as number;
        });
    } else {
      newOrderId = orderInfo.order_id;
    }

    const pBytes = encodePacked(["string"], [p]);
    const tickBytes = encodePacked(["string"], [tick]);
    console.log(parseEther(listForm.price), recv);
    const deadline = Math.floor(new Date().valueOf() / 1000 + 7 * 24 * 60 * 60);

    //protocol,tick,user,order_id,amount,deadline,recv
    const packData = encodePacked(
      ["bytes", "bytes", "address", "uint256", "uint256", "uint256", "uint256"],
      [
        pBytes,
        tickBytes,
        address!,
        BigInt(newOrderId!),
        BigInt(listForm.amount),
        BigInt(deadline),
        recv!,
      ]
    );

    const shaInfo = keccak256(packData, "hex");

    console.log(
      [
        pBytes,
        tickBytes,
        address!,
        BigInt(newOrderId!),
        BigInt(listForm.amount),
        BigInt(deadline),
        recv!,
      ],
      packData,
      shaInfo
    );

    try {
      const signature = await signMessageAsync({
        message: {
          raw: shaInfo,
        } as any,
      });
      console.log(signature);

      const searchParams = new URLSearchParams();
      searchParams.append("user", address!);
      searchParams.append("order_id", newOrderId!.toString());
      searchParams.append("protocol", p);
      searchParams.append("tick", tick);
      searchParams.append("amount", listForm.amount);
      searchParams.append("recv", recv!.toString());
      searchParams.append("dead_line", deadline.toString());
      searchParams.append("sign", signature);

      showDialog({
        title: "Transaction Confirmation",
        content: "Transaction Pending",
        status: "loading",
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/newOrder?${searchParams.toString()}`
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
        setOpen(false);
        hideDialog();
        setListForm({
          amount: "",
          price: "",
        });
        mutate(
          `${process.env.NEXT_PUBLIC_API_URL}/getOrderList?protocol=${p}&tick=${tick}`
        );
        mutate(
          `${process.env.NEXT_PUBLIC_API_URL}/getMyOrderList?protocol=${p}&tick=${tick}&user=${address}`
        );
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
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title className="relative flex items-center">
          <span>List</span>
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
        <div className="flex flex-col">
          <div className="self-center mb-4">
            <MarketCard
              hiddenActions
              orderInfo={{
                tick,
                price: listForm.price,
                sell_amount: listForm.amount,
                recv_amount: recv ? formatEther(recv) : "",
              }}
            />
          </div>
          <label className="flex flex-col gap-1">
            <div className="flex justify-between text-secondary font-medium text-sm">
              <span>Selling Amount</span>
              <span>Balance: {String(balance)} </span>
            </div>
            <TextFieldInput
              size="3"
              value={listForm.amount}
              onChange={(e) => {
                setListForm({
                  ...listForm,
                  amount: formatInput(e.currentTarget.value),
                });
              }}
            />
          </label>
          <label className="flex flex-col gap-1 mt-4">
            <div className="text-secondary font-medium text-sm">
              <span>Selling Price</span>
            </div>
            <TextField.Root>
              <TextField.Input
                size="3"
                value={listForm.price}
                onChange={(e) => {
                  setListForm({
                    ...listForm,
                    price: formatInput(e.currentTarget.value),
                  });
                }}
              />
              <TextField.Slot className="text-sm">ETH/{tick}</TextField.Slot>
            </TextField.Root>
          </label>
          <div className="flex flex-col gap-1 mt-4 text-sm text-secondary ">
            <div className="font-medium">Funding Receive Address</div>
            <div className="italic">{address}</div>
          </div>

          <div className="flex justify-between text-secondary font-medium text-sm mt-4">
            <div>Current floor price</div>
            <div>
              {formatPrice(tickInfo?.price)} ETH/{tick}
            </div>
          </div>
          <div className="flex justify-between text-secondary font-medium text-sm mt-2">
            <div>Total</div>
            <div>
              {recv
                ? `list ${listForm.amount} ${tick} for ${formatEther(recv)} ETH`
                : "-"}
            </div>
          </div>
          <Button
            disabled={confirmButtonDisabled}
            size="3"
            className="w-full !mt-5"
            variant="classic"
            onClick={handleList}
          >
            Confirm
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
