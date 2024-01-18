import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.memo(
  React.forwardRef<any, ButtonProps>(
    ({ children, onClick, className, ...props }, ref) => {
      return (
        <button
          ref={ref}
          className={`${className} p-[18px] text-center w-full box-border bg-[#0083FF] hover:bg-opacity-80 rounded-xl text-sm leading-3 font-poppins font-semibold cursor-pointer disabled:bg-[#2D3037] disabled:text-secondary  disabled:cursor-not-allowed transition-colors`}
          onClick={onClick}
          {...props}
        >
          {children}
        </button>
      );
    }
  )
);

Button.displayName = "Button";
