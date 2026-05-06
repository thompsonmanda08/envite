"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  src?: string;
  alt?: string;
  className?: string;
  isIcon?: boolean;
  isWhite?: boolean;
  isDark?: boolean;
  isFull?: boolean;
  classNames?: {
    link?: string;
    container?: string;
    image?: string;
  };
};

function Logo({
  href = "/",
  src,
  alt,
  isWhite = false,
  isDark = false,
  isFull = false,
  className = "",
  classNames,
  isIcon = false,
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // SSR has no theme. Default light until mount so server HTML matches first
  // client render, then swap to resolved theme.
  const logoUrl = useMemo(() => {
    const isDarkTheme = mounted && resolvedTheme === "dark";

    if (isIcon) {
      if (isWhite) return "/logo/logo-alt.png";
      if (isDark) return "/logo/logo.png";
      return isDarkTheme ? "/logo/logo-alt.png" : "/logo/logo.png";
    }

    if (isWhite) return "/logo/logo-wordmark-alt.png";
    if (isDark) return "/logo/logo-wordmark.png";
    return isDarkTheme
      ? "/logo/logo-wordmark-alt.png"
      : "/logo/logo-wordmark.png";
  }, [resolvedTheme, mounted, isIcon, isWhite, isDark, isFull]);

  if (isIcon) {
    return (
      <Link href={href} className={classNames?.link}>
        <div
          className={cn(
            "aspect-square flex justify-center w-full max-h-10 items-center min-w-fit",
            "max-w-10 mx-auto rounded-full overflow-clip min-h-10",
            className,
            classNames?.container,
          )}
        >
          <Image
            alt={alt || "logo"}
            className={cn("object-cover object-center", classNames?.image)}
            height={50}
            src={src || logoUrl}
            width={50}
            priority
          />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center h-8 max-w-40",
        className,
        classNames?.link,
        classNames?.container,
      )}
    >
      <Image
        alt={alt || "logo"}
        className={cn(
          "object-contain h-full w-auto transition-all duration-300 ease-in-out",
          classNames?.image,
        )}
        height={80}
        src={src || logoUrl}
        width={200}
        priority
      />
    </Link>
  );
}

export default Logo;
