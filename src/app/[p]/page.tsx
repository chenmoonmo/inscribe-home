"use client";
import { Actions, Protocols } from "@/constants/enums";
import {
  Button,
  Card,
  Checkbox,
  Heading,
  IconButton,
  TextFieldInput,
} from "@radix-ui/themes";
import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import stringify from "json-stable-stringify";
import {
  useAccount,
  useContractRead,
  useContractReads,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import { bytesToHex, toBytes, toHex } from "viem";
import { useContracts } from "@/hooks/use-contracts";
import { inscriptionABI } from "@/abis";
import { useTransactionDialog } from "@/components/transaction-provider";
import NoSSR from "react-no-ssr";
import { useModal } from "connectkit";
import Image from "next/image";
import { formatInput } from "@/utils/format";

export type ExtrnalParamsType =
  | {
      type: "block" | "time";
    }
  | {
      type: "custom";
      key: string;
      value: string;
      disabled?: boolean;
    };

export default function Page({
  params: { p },
}: {
  params: {
    p: string;
  };
}) {
  const { isConnected } = useAccount();
  const { setOpen } = useModal();
  const { showDialog, hideDialog } = useTransactionDialog();
  const { inscription } = useContracts();

  const [type, setType] = useState<Actions>(Actions.deploy); // 协议类型
  const [tick, setTick] = useState<string>("");
  const [max, setMax] = useState<string>("");
  const [lim, setLim] = useState<string>("");
  const [amt, setAmt] = useState<string>("");

  const [uploadFile, setUploadFile] = useState<File | undefined>(undefined);

  const { acceptedFiles, getRootProps, getInputProps, inputRef } = useDropzone({
    maxFiles: 1,
    multiple: false,
  });

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
        functionName: "getActionRequireFieldStr",
        args: [p, "depoly"],
      },
      {
        ...contractInfo,
        functionName: "getActionRequireFieldStr",
        args: [p, "mint"],
      },
    ],
  });

  const [extranlParams, setExtranlParams] = useState<ExtrnalParamsType[]>([]);

  const [registedProtocols, ptype, pAddr] = useMemo(() => {
    if (!pInfo) return [[], Protocols.InsFT, undefined, []];

    const registedProtocolString = pInfo[0].result;
    const pTypeRes = pInfo[1].result;

    const registedProtocols = registedProtocolString?.split(",") ?? [];
    const ptype =
      pTypeRes === "NFT"
        ? Protocols.NFT
        : pTypeRes === "InsnFT"
        ? Protocols.InsFT
        : Protocols.InsnFT;

    const pAddr = pInfo[2].result;
    const rfs = type === Actions.deploy ? pInfo[3].result : pInfo[4].result;
    const rf =
      rfs && rfs.length > 0
        ? rfs?.split(",").map((item) => item.split(":")) ?? []
        : [];

    const ex: ExtrnalParamsType[] = [];

    rf.forEach((item) => {
      if (item[0] === "block" || item[0] === "time") {
        ex.push({
          type: item[0],
        });
      } else {
        const [key, value] = item;
        ex.push({
          type: "custom",
          key,
          value: value ?? "",
          disabled: !!value,
        });
      }
    });

    setExtranlParams(ex);
    return [registedProtocols, ptype, pAddr, rf];
  }, [pInfo, type]);

  const { data: t1 } = useContractReads({
    contracts: [
      {
        address: pAddr,
        abi: [
          {
            inputs: [
              {
                internalType: "string",
                name: "protocol",
                type: "string",
              },
              {
                internalType: "string",
                name: "tick",
                type: "string",
              },
              {
                internalType: "string",
                name: "field",
                type: "string",
              },
            ],
            name: "getFieldData",
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
        functionName: "getFieldData",
        args: [p, tick, "file"],
      },
      {
        address: pAddr,
        abi: [
          {
            inputs: [
              {
                internalType: "string",
                name: "protocol",
                type: "string",
              },
              {
                internalType: "string",
                name: "tick",
                type: "string",
              },
              {
                internalType: "string",
                name: "field",
                type: "string",
              },
            ],
            name: "getFieldData",
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
        functionName: "getFieldData",
        args: [p, tick, "filetype"],
      },
    ],
    enabled: type === Actions.mint && ptype === Protocols.NFT && !!tick,
    onSuccess: (data) => {
      const filedata = data[0].result as string;
      const filetype = (data[1].result as string) || "image/png";
      if (filedata && filetype) {
        const bytes = toBytes(filedata);
        const blob = new Blob([bytes], { type: filetype });
        const file = new File([blob], "file");
        setUploadFile(file);
      }
    },
  });

  const { data: ticksString, refetch: refetchTicksString } = useContractRead({
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
        refetchTicksString();
        setTick("");
        setMax("");
        setLim("");
        setAmt("");
        setExtranlParams((pre) => {
          const newParams = [...pre];
          newParams.forEach((item) => {
            if (item.type === "custom") {
              item.value = "";
            }
          });
          return newParams;
        });
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
    const isExtranlParamsFilled = extranlParams.every((item) => {
      if (item.type === "custom") {
        return !!item.value;
      } else {
        return true;
      }
    });
    if (!isExtranlParamsFilled) return true;

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
  }, [
    acceptedFiles.length,
    amt,
    extranlParams,
    lim,
    max,
    ptype,
    tick,
    ticks,
    type,
  ]);

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

    extranlParams.map((item) => {
      let key = item.type === "custom" ? item.key : item.type;
      let value = item.type === "custom" ? item.value : item.type;
      obj[key] = value;
    });

    const keys = Object.getOwnPropertyNames(obj);

    return stringify(obj, function (a, b) {
      return keys.indexOf(a.key) > keys.indexOf(b.key) ? 1 : -1;
    });
  }, [amt, extranlParams, lim, max, p, ptype, tick, type]);

  const hanldeTypeToggle = (type: Actions) => {
    setType(type);
    setTick("");
    setMax("");
    setLim("");
    setAmt("");
    setExtranlParams((pre) => {
      const newParams = [...pre];
      newParams.forEach((item) => {
        if (item.type === "custom") {
          item.value = "";
        }
      });
      return newParams;
    });
    // reomve file
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleConfirm = async () => {
    const obj: any = {
      p,
      op: type === Actions.deploy ? "deploy" : "mint",
      tick,
    };

    if (type === Actions.deploy) {
      obj.max = max;
      if (ptype !== Protocols.NFT) {
        obj.lim = lim;
      } else {
        const arrayBuffer = await acceptedFiles[0].arrayBuffer();
        obj.file = bytesToHex(new Uint8Array(arrayBuffer));
        obj.filetype = acceptedFiles[0].type;
      }
    } else {
      if (ptype !== Protocols.NFT) {
        obj.amt = amt;
      }
    }

    extranlParams.map((item) => {
      if (item.type === "custom") {
        obj[item.key] = item.value;
      } else {
        obj[item.type] = "";
      }
    });

    const keys = Object.getOwnPropertyNames(obj);

    const jsonString = stringify(obj, function (a, b) {
      return keys.indexOf(a.key) > keys.indexOf(b.key) ? 1 : -1;
    });

    console.log(jsonString);

    showDialog({
      title: "Transaction Confirmation",
      content: "Please confirm the transaction in your wallet",
      status: "loading",
    });
    sendTransaction({
      to: inscription,
      value: BigInt(0),
      data: toHex(jsonString),
    });
  };

  return (
    <NoSSR>
      {isLoading || !registedProtocols.includes(p) ? (
        <main></main>
      ) : (
        <main className="flex flex-col items-center px-5 pt-20">
          <Card size="5" variant="surface">
            <Heading align="center" size="8" color="violet">
              {p}
            </Heading>
            <div className="flex items-center justify-center gap-10 mb-6 mt-10">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  variant="classic"
                  size="1"
                  checked={type === Actions.deploy}
                  onCheckedChange={() => hanldeTypeToggle(Actions.deploy)}
                />
                Deploy
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  variant="classic"
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
                variant="classic"
                size="3"
                value={tick}
                onChange={(e) => {
                  setUploadFile(undefined);
                  setTick(e.target.value);
                }}
              />
              {type === Actions.deploy && ptype === Protocols.NFT && (
                <>
                  <div>file</div>
                  <div
                    {...getRootProps({
                      className:
                        "relative flex flex-col items-center justify-center h-[140px] bg-violet-50 hover:bg-violet-100 rounded-md gap-1 cursor-pointer py-10",
                    })}
                  >
                    <input {...getInputProps()} />
                    {acceptedFiles[0] ? (
                      // 如果是图片或视频则显示相应的预览
                      acceptedFiles[0].type.includes("image") ? (
                        <Image
                          fill
                          alt=""
                          src={URL.createObjectURL(acceptedFiles[0])}
                          className="object-contain"
                        />
                      ) : acceptedFiles[0].type.includes("video") ? (
                        <video
                          src={URL.createObjectURL(acceptedFiles[0])}
                          className="h-[140px] object-contain rounded-md"
                        />
                      ) : (
                        <div className="h-[140px] flex items-center justify-center text-gray-400">
                          {acceptedFiles[0].name}
                        </div>
                      )
                    ) : (
                      <>
                        <IconButton variant="classic">
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
                          .svg,.png,.jpg,.gif,.txt,.pdf,.json,.mp4...(up to
                          380KB)
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
              {type === Actions.deploy && (
                <>
                  <div>max</div>
                  <TextFieldInput
                    variant="classic"
                    size="3"
                    value={max}
                    onChange={(e) => setMax(formatInput(e.target.value))}
                  />
                </>
              )}
              {type === Actions.deploy && ptype !== Protocols.NFT && (
                <>
                  <div>lim</div>
                  <TextFieldInput
                    variant="classic"
                    size="3"
                    value={lim}
                    onChange={(e) => setLim(formatInput(e.target.value))}
                  />
                </>
              )}
              {type === Actions.mint && ptype !== Protocols.NFT && (
                <>
                  <div>amt</div>
                  <TextFieldInput
                    variant="classic"
                    size="3"
                    value={amt}
                    onChange={(e) => setAmt(formatInput(e.target.value))}
                  />
                </>
              )}
              {extranlParams.map((item, index) => {
                if (item.type === "custom") {
                  return (
                    <React.Fragment key={type + item.key + index}>
                      <div>{item.key}</div>
                      <TextFieldInput
                        variant="classic"
                        size="3"
                        value={item.value}
                        disabled={item.disabled}
                        onChange={(e) =>
                          setExtranlParams((pre) => {
                            const newParams = [...pre];
                            (newParams[index] as any).value = e.target.value;
                            return newParams;
                          })
                        }
                      />
                    </React.Fragment>
                  );
                }
              })}
              <div className="col-span-2 text-secondary">
                you are able to inscribe
              </div>
              {type === Actions.mint && ptype === Protocols.NFT && (
                <div className="relative col-span-2 w-40 h-40 bg-violet-100 rounded-md overflow-hidden">
                  {uploadFile && (
                    <Image alt="" src={URL.createObjectURL(uploadFile)} fill />
                  )}
                </div>
              )}
              <div className="col-span-2 border-2 border-primary rounded-md p-4 tracking-wider break-all">
                {json}
              </div>
            </div>
            <div className="w-full flex justify-center">
              {isConnected ? (
                <Button
                  className="w-[300px] !mt-10"
                  variant="classic"
                  size="3"
                  disabled={buttonDisabled}
                  onClick={handleConfirm}
                >
                  Confirm
                </Button>
              ) : (
                <Button
                  className="w-[300px] !mt-10"
                  variant="classic"
                  size="3"
                  onClick={() => setOpen(true)}
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </Card>
        </main>
      )}
    </NoSSR>
  );
}
