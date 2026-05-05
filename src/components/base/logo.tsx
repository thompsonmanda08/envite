"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

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
      className={cn(`w-full min-w-fit max-w-max flex items-center`, className)}
      href={href}
    >
      <Image
        unoptimized
        alt="e-nvite logo"
        className="object-contain transition-all duration-300 ease-in-out sm:h-14 "
        height={60}
        src={src || logoUrl}
        width={120}
      />
    </Link>
  );
}

export default Logo;
