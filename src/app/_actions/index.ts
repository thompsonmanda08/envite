"use server";

import { ImageKitInvalidRequestError } from "@imagekit/next";

export async function uploadImageAuth() {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new ImageKitInvalidRequestError(
      "ImageKit keys missing: set NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY",
    );
  }

  const { getUploadAuthParams } = await import("@imagekit/next/server");
  const { token, expire, signature } = getUploadAuthParams({
    privateKey,
    publicKey,
  });

  return {
    success: true,
    data: { token, expire, signature, publicKey },
  };
}
