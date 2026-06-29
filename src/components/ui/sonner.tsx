"use client";

import { Toaster as SonnerToaster } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Sonner = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Sonner };
