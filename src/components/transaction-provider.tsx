"use client";
import { ReactNode, useCallback, useMemo } from "react";
import { useSetAtom } from "jotai";
import dynamic from "next/dynamic";
import { dialogAtom } from "./transaction-dialog";

const TransactionDialog = dynamic(
  () => import("./transaction-dialog").then((res) => res.TransactionDialog),
  {
    ssr: false,
  }
);

export const TransactionDialogProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <>
      {children}
      <TransactionDialog />
    </>
  );
};

export const useTransactionDialog = () => {
  const setDialog = useSetAtom(dialogAtom);
  const hideDialog = useCallback(() => {
    setDialog(null);
  }, [setDialog]);

  return useMemo(
    () => ({
      showDialog: setDialog,
      hideDialog,
    }),
    [hideDialog, setDialog]
  );
};
