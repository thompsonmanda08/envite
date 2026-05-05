"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTheme } from "next-themes";

function Logo({
  href = "/",
  src,
  alt,
  isWhite = false,
  isDark = false,
  className = "",
  isIcon = false,
}: {
  href?: string;
  src?: string;
  alt?: string;
  isWhite?: boolean;
  isDark?: boolean;
  className?: string;
  isIcon?: boolean;
}) {
  const { theme } = useTheme();
  const [logoUrl, setLogoUrl] = useState(`/logo/logo-wordmark.png`);

  useEffect(() => {
    let logoType = "";

    if (isIcon) {
      logoType =
        theme === "light"
          ? `/logo/logo-wordmark.png`
          : "/logo/logo-wordmark-alt.png";
    } else if (isWhite) {
      logoType = "/logo/logo-wordmark-alt.png";
    } else if (isDark) {
      logoType = `/logo/logo-wordmark.png`;
    } else {
      logoType =
        theme === "light"
          ? `/logo/logo-wordmark.png`
          : "/logo/logo-wordmark-alt.png";
    }

    setLogoUrl(logoType);
  }, [isIcon, isWhite, isDark]);

  console.log(theme);

  return (
    <Link
      href={href}
      className={cn(`w-full min-w-fit max-w-max flex items-center`, className)}
    >
      <Image
        className="object-contain transition-all duration-300 ease-in-out sm:h-14 "
        src={src || logoUrl}
        alt="e-nvite logo"
        width={120}
        height={60}
        unoptimized
      />
    </Link>
  );
}

export default Logo;
