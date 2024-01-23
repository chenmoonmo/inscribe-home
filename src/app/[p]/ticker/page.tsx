"use client";
import { inscriptionABI } from "@/abis";
import { Protocols } from "@/constants/enums";
import { useContracts } from "@/hooks/use-contracts";
import { Heading, Table } from "@radix-ui/themes";
import { useMemo } from "react";
import NoSSR from "react-no-ssr";
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

  const { data: pAddr } = useContractRead({
    ...contractInfo,
    functionName: "getProtocolAddr",
    args: [p],
  });

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
    enabled: !!pAddr,
  });

  const ticks = useMemo(
    () => (ticksString as string)?.split(",") ?? [],
    [ticksString]
  );

  return (
    <NoSSR>
      <main className="flex flex-col items-center pt-20 gap-8">
        <Heading size="8">The full list of ticker</Heading>
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
    </NoSSR>
  );
}
