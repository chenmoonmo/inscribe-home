"use client";
import { Actions, Protocols } from "@/constants/enums";
import {
  Button,
  Checkbox,
  Heading,
  IconButton,
  TextFieldInput,
} from "@radix-ui/themes";
import { FC, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import stringify from "json-stable-stringify";
import {
  useContractRead,
  useContractReads,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import { toHex } from "viem";
import { useContracts } from "@/hooks/use-contracts";
import { inscriptionABI } from "@/abis";
import { useTransactionDialog } from "./transaction-provider";

export const InscribeForm: FC<{ p: string }> = ({ p }) => {
  const { showDialog, hideDialog } = useTransactionDialog();
  const { inscription } = useContracts();

  const [type, setType] = useState<Actions>(Actions.deploy); // 协议类型
  const [tick, setTick] = useState<string>("");
  const [max, setMax] = useState<string>("");
  const [lim, setLim] = useState<string>("");
  const [amt, setAmt] = useState<string>("");

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

    const registedProtocolString = pInfo[0].result;
    const type = pInfo[1].result;

    const registedProtocols = registedProtocolString?.split(",") ?? [];
    const ptype =
      type === "NFT"
        ? Protocols.NFT
        : type === "InsnFT"
        ? Protocols.InsFT
        : Protocols.InsnFT;

    const pAddr = pInfo[2].result;
    const rf = pInfo[3].result?.split(",") ?? [];

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

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    multiple: false,
  });

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
        setTick("");
        setMax("");
        setLim("");
        setAmt("");
        hideDialog();
      }, 2000);
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

  const buttonDisabled = useMemo(() => {
    if (type === Actions.deploy) {
      if (ptype === Protocols.NFT) {
        return !tick || !max || !acceptedFiles.length || ticks.includes(tick);
      } else {
        return !tick || !max || !lim || ticks.includes(tick);
      }
    } else {
      if (ptype === Protocols.NFT) {
        return !tick || !ticks.includes(tick);
      } else {
        return !tick || !amt || !ticks.includes(tick);
      }
    }
    1;
  }, [acceptedFiles.length, amt, lim, max, ptype, tick, ticks, type]);

  const json = useMemo(() => {
    const obj: any = {
      p: p,
      op: type === Actions.deploy ? "deploy" : "mint",
      tick: tick,
    };

    if (type === Actions.deploy) {
      obj.max = max;
      if (ptype !== Protocols.NFT) {
        obj.lim = lim;
      }
    } else {
      if (ptype !== Protocols.NFT) {
        obj.amt = amt;
      }
    }
    rf?.forEach((item) => {
      obj[item] = "";
    });
    const keys = Object.getOwnPropertyNames(obj);

    return stringify(obj, function (a, b) {
      return keys.indexOf(a.key) > keys.indexOf(b.key) ? 1 : -1;
    });
  }, [amt, lim, max, p, ptype, rf, tick, type]);

  const hanldeTypeToggle = (type: Actions) => {
    setType(type);
    setTick("");
    setMax("");
    setLim("");
    setAmt("");
  };

  console.log(acceptedFiles);

  const handleConfirm = () => {
    showDialog({
      title: "Transaction Confirmation",
      content: "Please confirm the transaction in your wallet",
      status: "loading",
    });
    sendTransaction({
      to: inscription,
      value: BigInt(0),
      data: toHex(json),
    });
  };

  if (isLoading) return <></>;

  return (
    <div>
      <Heading align="center">{p}</Heading>
      <div className="flex flex-col items-center w-[673px] rounded-md border-px py-10 mt-8">
        <div className="flex items-center justify-center gap-10 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              size="1"
              checked={type === Actions.deploy}
              onCheckedChange={() => hanldeTypeToggle(Actions.deploy)}
            />
            Deploy
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              size="1"
              checked={type === Actions.mint}
              onCheckedChange={() => hanldeTypeToggle(Actions.mint)}
            />
            Mint
          </label>
        </div>
        <div className="grid w-[550px] grid-cols-[max-content,1fr] gap-x-10 gap-y-4 items-center italic">
          <div>tick</div>
          <TextFieldInput
            size="3"
            value={tick}
            onChange={(e) => setTick(e.target.value)}
          />
          {type === Actions.deploy && ptype === Protocols.NFT && (
            <>
              <div>file</div>
              <div
                {...getRootProps({
                  className:
                    "flex flex-col items-center justify-center h-[140px] bg-gray-800 rounded-md gap-1 cursor-pointer",
                })}
              >
                <input {...getInputProps()} />
                <IconButton variant="soft">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.81825 1.18188C7.64251 1.00615 7.35759 1.00615 7.18185 1.18188L4.18185 4.18188C4.00611 4.35762 4.00611 4.64254 4.18185 4.81828C4.35759 4.99401 4.64251 4.99401 4.81825 4.81828L7.05005 2.58648V9.49996C7.05005 9.74849 7.25152 9.94996 7.50005 9.94996C7.74858 9.94996 7.95005 9.74849 7.95005 9.49996V2.58648L10.1819 4.81828C10.3576 4.99401 10.6425 4.99401 10.8182 4.81828C10.994 4.64254 10.994 4.35762 10.8182 4.18188L7.81825 1.18188ZM2.5 9.99997C2.77614 9.99997 3 10.2238 3 10.5V12C3 12.5538 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2238 12.2239 9.99997 12.5 9.99997C12.7761 9.99997 13 10.2238 13 10.5V12C13 13.104 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2238 2.22386 9.99997 2.5 9.99997Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </IconButton>
                <div>Click to upload or drag and drop</div>
                <div>
                  .svg,.png,.jpg,.gif,.txt,.pdf,.json,.mp4...(up to 380KB)
                </div>
              </div>
            </>
          )}
          {type === Actions.deploy && (
            <>
              <div>max</div>
              <TextFieldInput
                size="3"
                value={max}
                onChange={(e) => setMax(e.target.value)}
              />
            </>
          )}
          {type === Actions.deploy && ptype !== Protocols.NFT && (
            <>
              <div>lim</div>
              <TextFieldInput
                size="3"
                value={lim}
                onChange={(e) => setLim(e.target.value)}
              />
            </>
          )}
          {type === Actions.mint && ptype !== Protocols.NFT && (
            <>
              <div>amt</div>
              <TextFieldInput
                size="3"
                value={amt}
                onChange={(e) => setAmt(e.target.value)}
              />
            </>
          )}
          <div className="col-span-2 text-gray-400">
            you are able to inscribe
          </div>
          {type === Actions.mint && ptype === Protocols.NFT && (
            <div className="col-span-2 w-40 h-40 bg-gray-800 rounded-md"></div>
          )}
          <div className="col-span-2 border-px rounded-sm p-4 tracking-wider break-all">
            {json}
          </div>
        </div>
        <Button
          className="w-[300px] !mt-10"
          size="3"
          disabled={buttonDisabled}
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};

InscribeForm.displayName = "InscribeForm";
