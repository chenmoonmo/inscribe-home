"use client";
import { inscriptionABI } from "@/abis";
import { useContracts } from "@/hooks/use-contracts";
import { formatAmount } from "@/utils/format";
import { Button, Select, Table, TextFieldInput } from "@radix-ui/themes";
import { useMemo, useState } from "react";
import { useContractRead } from "wagmi";

export default function Page({ params: { p:currentP } }: { params: { p: string } }) {
  const { inscription } = useContracts();
  const [addr, setAddr] = useState("");
  const [p, setP] = useState(currentP);
  const [tick, setTick] = useState("");

  const { data: registedProtocolString } = useContractRead({
    address: inscription,
    abi: inscriptionABI,
    functionName: "getRegisterProtocol",
  });

  const { data: pAddr } = useContractRead({
    address: inscription,
    abi: inscriptionABI,
    functionName: "getProtocolAddr",
    args: [p],
  });

  const { data: balance } = useContractRead({
    address: pAddr,
    abi: [
      {
        inputs: [
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
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "getUserBalance",
    args: [tick, addr],
  });

  console.log(pAddr, balance);

  const registedProtocols = useMemo(() => {
    const arr = registedProtocolString?.split(",") ?? [];
    return arr;
  }, [registedProtocolString]);

  return (
    <main className="flex flex-col items-center px-5 pt-20 gap-10">
      <div className="flex items-center gap-2">
        <TextFieldInput
          placeholder="Wallet Address"
          size="3"
          className="!w-[400px]"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
        />
        <Select.Root size="3" value={p} onValueChange={setP}>
          <Select.Trigger />
          <Select.Content position="popper">
            {registedProtocols?.map((item) => (
              <Select.Item key={item} value={item}>
                {item}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <TextFieldInput
          placeholder="Tick"
          size="3"
          className="!w-[120px]"
          value={tick}
          onChange={(e) => setTick(e.target.value)}
        />
        {/* <Button size="3">Confirm</Button> */}
      </div>
      <Table.Root className="w-[1200px]">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Wallet Address</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>p</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Tick</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Balance</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {pAddr && tick && addr && !!balance && (
            <Table.Row>
              <Table.RowHeaderCell>{addr}</Table.RowHeaderCell>
              <Table.Cell>{p}</Table.Cell>
              <Table.Cell>{tick}</Table.Cell>
              <Table.Cell>{formatAmount(balance.toString())}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </main>
  );
}
