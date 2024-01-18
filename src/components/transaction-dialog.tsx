"use client";
import { AnimatePresence, motion } from "framer-motion";
import { atom,useAtomValue } from "jotai";
import { memo, useMemo } from "react";
import { createPortal } from "react-dom";

type DialogProps = {
  title: string;
  content: string;
  status: "loading" | "success" | "error" | "warning";
};

export const dialogAtom = atom<DialogProps | null>(null);

const ICONS = {
  loading: (
    <svg
      width={26}
      height={26}
      viewBox="0 0 26 26"
      xmlns="http://www.w3.org/2000/svg"
      fill="#fff"
    >
      <g clipPath="url(#prefix__clip0_3_2)">
        <path
          d="M12.953.12C5.819.12.036 5.905.036 13.039c0 7.135 5.783 12.918 12.917 12.918 7.135 0 12.917-5.784 12.917-12.918C25.87 5.905 20.087.121 12.953.121zm0 21.788a8.87 8.87 0 110-17.74 8.87 8.87 0 010 17.74z"
          fill="url(#prefix__paint0_linear_3_2)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0,13,13"
            to="360,13,13"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
      </g>
      <defs>
        <linearGradient
          id="prefix__paint0_linear_3_2"
          x1={0.036}
          y1={13.038}
          x2={24.862}
          y2={13.038}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0.419} stopColor="#fff" />
          <stop offset={0.504} stopColor="#D2DFEF" />
          <stop offset={0.695} stopColor="#608EC6" />
          <stop offset={0.755} stopColor="#2781ff" />
        </linearGradient>
        <clipPath id="prefix__clip0_3_2">
          <path fill="#fff" d="M0 0h26v26H0z"></path>
        </clipPath>
      </defs>
    </svg>
  ),
  success: (
    <svg width={22} height={22} xmlns="http://www.w3.org/2000/svg" fill="#fff">
      <path d="M9.802 14.78a.875.875 0 01-.625-.259L5.793 11.14a.886.886 0 010-1.25.886.886 0 011.249 0l2.757 2.758 5.142-5.142a.88.88 0 011.248 0 .88.88 0 010 1.25l-5.764 5.768a.882.882 0 01-.623.257z" />
      <path d="M10.993 21.997c-6.065 0-11-4.935-11-11 0-6.066 4.932-11 11-11 6.069 0 11 4.934 11 11 0 6.065-4.934 11-11 11zm0-20.235c-5.091 0-9.234 4.143-9.234 9.235s4.143 9.234 9.234 9.234c5.092 0 9.235-4.142 9.235-9.234-.003-5.092-4.145-9.235-9.235-9.235z" />
    </svg>
  ),
  error: (
    <svg width={22} height={22} fill="#fff" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#prefix__clip0_16_3)">
        <path d="M12.483 11.053l-.034-.034.034-.034 2.844-2.846a1.07 1.07 0 000-1.517 1.07 1.07 0 00-1.517 0l-2.845 2.845L8.12 6.622a1.07 1.07 0 00-1.518 0c-.42.42-.42 1.1 0 1.517l2.844 2.846.034.034-.034.034L6.602 13.9a1.07 1.07 0 000 1.516 1.07 1.07 0 001.518 0l2.845-2.845 2.845 2.845c.42.421 1.1.421 1.517 0 .421-.42.421-1.099 0-1.516l-2.844-2.847z" />
        <path d="M10.966 21.914C4.95 21.914.055 17.019.055 11.002.055 4.986 4.947.092 10.966.092c6.02 0 10.912 4.894 10.912 10.91 0 6.017-4.895 10.912-10.912 10.912zm0-20.071c-5.05 0-9.16 4.109-9.16 9.16s4.11 9.16 9.16 9.16c5.052 0 9.16-4.11 9.16-9.16-.002-5.051-4.111-9.16-9.16-9.16z" />
      </g>
      <defs>
        <clipPath id="prefix__clip0_16_3">
          <path d="M0 0h22v22H0z" />
        </clipPath>
      </defs>
    </svg>
  ),
  warning: (
    <svg width={22} height={22} fill="#fff" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#prefix__clip0_4_5)">
        <path d="M10.936 15.16a1.07 1.07 0 00-1.043 1.043 1.07 1.07 0 001.043 1.042c.556 0 1.043-.486 1.043-1.043 0-.555-.487-1.042-1.043-1.042zm0-8.73c-.599 0-1.085.486-1.085 1.085l.41 5.606c0 .598.076 1.085.675 1.085.599 0 .675-.486.675-1.085l.41-5.606c0-.6-.486-1.085-1.085-1.085z" />
        <path d="M21.387 16.203L13.812 2.55C13.137 1.335 12.086.64 10.93.64c-1.158 0-2.209.698-2.882 1.914L.481 16.202c-.665 1.199-.71 2.462-.125 3.466.587 1.007 1.71 1.585 3.08 1.585h14.997c1.371 0 2.493-.578 3.079-1.583.586-1.003.54-2.267-.125-3.467zm-1.6 2.46c-.22.377-.712.593-1.354.593H3.436c-.64 0-1.135-.217-1.355-.594-.221-.38-.168-.924.146-1.492L9.795 3.52c.311-.562.725-.884 1.135-.884.41 0 .824.322 1.136.884l7.574 13.652c.316.568.369 1.111.147 1.492z" />
      </g>
      <defs>
        <clipPath id="prefix__clip0_4_5">
          <path d="M0 0h22v22H0z" />
        </clipPath>
      </defs>
    </svg>
  ),
} as const;

export const TransactionDialog = memo(() => {
  const dialog = useAtomValue(dialogAtom);

  const currentIcon = useMemo(() => {
    if (!dialog) return null;
    return ICONS[dialog.status];
  }, [dialog]);

  return createPortal(
    <AnimatePresence>
      {dialog && (
        <motion.div
          initial={{ backgroundColor: "rgba(0,0,0,0)" }}
          animate={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          exit={{ backgroundColor: "rgba(0,0,0,0)" }}
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 z-40"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, translateX: "0" }}
            animate={{ scale: 1, opacity: 1, translateX: "-50%" }}
            exit={{ scale: 0.5, opacity: 0, translateX: "0" }}
            className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[426px] h-[64px] rounded-xl bg-[#5e6169] flex items-stretch overflow-hidden"
          >
            <div className="flex items-center justify-center bg-[#2781ff] aspect-square">
              {currentIcon}
            </div>
            <div className="flex-auto flex flex-col px-[30px] justify-center font-poppins">
              <h1 className="text-base font-bold  text-white">
                {dialog.title}
              </h1>
              <div className="text-xs text-[#bcc3d6]">{dialog.content}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
});

TransactionDialog.displayName = "TransactionDialog";
