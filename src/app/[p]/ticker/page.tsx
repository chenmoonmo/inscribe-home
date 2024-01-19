"use client";
import { inscriptionABI } from "@/abis";
import { Protocols } from "@/constants/enums";
import { useContracts } from "@/hooks/use-contracts";
import { Heading, Table } from "@radix-ui/themes";
import { useMemo } from "react";
import { useContractRead, useContractReads } from "wagmi";

export default function Page({
  params: { p },
}: {
  params: {
    p: string;
  };
}) {
  const { inscription } = useContracts();

  const contractInfo = {
    address: inscription,
    abi: inscriptionABI,
  };

  const { data: pInfo, isLoading } = useContractReads({
    contracts: [
      {
        ...contractInfo,
        functionName: "getRegisterProtocol",
      },
      {
        ...contractInfo,
        functionName: "getProtocolType",
        args: [p],
      },
      {
        ...contractInfo,
        functionName: "getProtocolAddr",
        args: [p],
      },
      {
        ...contractInfo,
        functionName: "getRf",
        args: [p],
      },
    ],
  });

  console.log(pInfo?.map((item) => item.result));

  const [registedProtocols, ptype, pAddr, rf] = useMemo(() => {
    if (!pInfo) return [[], Protocols.InsFT, undefined, []];

    const registedProtocolString = pInfo[0].result as string;
    const type = pInfo[1].result;

    const registedProtocols = registedProtocolString?.split(",") ?? [];
    const ptype =
      type === "NFT"
        ? Protocols.NFT
        : type === "InsnFT"
        ? Protocols.InsFT
        : Protocols.InsnFT;

    const pAddr = pInfo[2].result;
    const rf = (pInfo[3].result as string)?.split(",") ?? [];

    return [registedProtocols, ptype, pAddr, rf];
  }, [pInfo]);

  const { data: ticksString } = useContractRead({
    address: pAddr,
    abi: [
      {
        inputs: [
          {
            internalType: "string",
            name: "protocolStr",
            type: "string",
          },
        ],
        name: "getTicks",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "getTicks",
    args: [p],
  });

  const ticks = useMemo(
    () => (ticksString as string)?.split(",") ?? [],
    [ticksString]
  );

  return (
    <main className="flex flex-col items-center pt-20 gap-10">
      <Heading size="8" weight="medium">
        The full list of ticker
      </Heading>
      <Table.Root className="w-[1200px]">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Ticker</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Deploy Time</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Progress</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Holders</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {ticks.map((item) => {
            return (
              <Table.Row key={item}>
                <Table.RowHeaderCell>{item}</Table.RowHeaderCell>
                <Table.Cell>-</Table.Cell>
                <Table.Cell>-</Table.Cell>
                <Table.Cell>-</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </main>
  );
}
