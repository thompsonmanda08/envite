import { SignJWT, jwtVerify } from "jose";

export const getSecretKey = () => {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    "dev-only-secret-change-me-please-32+chars";

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }

  return secret;
};

const getKey = () => new TextEncoder().encode(getSecretKey());

export async function encrypt(payload: any, expirationTime: string = "7d") {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be a non-empty object");
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(getKey());
}

export async function decrypt(token: any) {
  if (!token || typeof token !== "string") {
    return { success: false, message: "No session token", data: null };
  }
  if (token.split(".").length !== 3) {
    return { success: false, message: "Invalid token format", data: null };
  }
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
      clockTolerance: 15,
    });

    return payload;
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.code === "ERR_JWT_EXPIRED"
          ? "Token expired"
          : "Failed to verify session",
      data: null,
    };
  }
}
