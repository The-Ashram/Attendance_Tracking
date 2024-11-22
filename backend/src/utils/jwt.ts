// utils/jwt.ts
import jwt from "jsonwebtoken";
import config from "../config/config";
import log from "../config/log.config";
import { AuthenticationError } from "./errorTypes";
import { DecodedJWTObj } from "../modules/interfaces/auth.interfaces";
import { queryGetUserById } from "../db/queries/users.query";
import { getErrorMessage } from "./errorHandler";

const NAMESPACE = "JWT-UTILS";

export const generateToken = (payload: object, secret: string, tokenType: string): string => {
  try {
    let expireTime;
    if (tokenType == "accessToken") {
      expireTime = "1h";
    } else if (tokenType == "refreshToken") {
      expireTime = "12h";
    } else {
      const e = new AuthenticationError(
        "Invalid tokenType provided. Must be 'accessToken' or 'refreshToken'.",
        "400"
      );
      throw e;
    }
    const token = jwt.sign(payload, secret, {
      algorithm: "RS256",
      expiresIn: expireTime,
    });
    return token;
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    throw new AuthenticationError("JWT token generation failed.", "401");
  }
};

export const verifyAccessToken = async (token: string) => {
  const tokenUsed = Buffer.from(
    config.server.access_public_secret,
    "base64"
  ).toString("ascii");

  jwt.verify(token, tokenUsed, (error) => {
    if (error) {
      log.error(NAMESPACE, getErrorMessage(error), error);
      const e = new AuthenticationError(
        "JWT access token verification failed.",
        "403"
      );
      throw e;
    }
  });
  const decoded = jwt.decode(token) as DecodedJWTObj;
  const id = decoded.id;
  const user = await queryGetUserById(id);
  // have to multiply by 1000 because the issued at time is in seconds but getTime() returns in milliseconds
  const updatedAtTime = new Date(user[0].updatedAt).getTime();
  const issuedAtTime = decoded.iat * 1000;
  const TOLERANCE_MS = 1000;
  // have to multiply by 1000 because the issued at time is in seconds but getTime() returns in milliseconds
  if (updatedAtTime > (issuedAtTime + TOLERANCE_MS)) {
    log.info(NAMESPACE, "updated at time: ", updatedAtTime);
    log.info(NAMESPACE, "issuedAtTime: ", issuedAtTime);
    log.info(NAMESPACE, "tolerance: ", TOLERANCE_MS);
    log.info(NAMESPACE, "decoded is time: ", issuedAtTime + TOLERANCE_MS);
    const e = new AuthenticationError(
      "User details updated, token invalidated.",
      "403"
    );
    throw e;
  }
  return decoded;
};

export const verifyRefreshToken = async (token: string) => {
  const tokenUsed = Buffer.from(
    config.server.refresh_public_secret,
    "base64"
  ).toString("ascii");
  jwt.verify(token, tokenUsed, (error) => {
    if (error) {
      log.error(NAMESPACE, getErrorMessage(error), error);
      const e = new AuthenticationError(
        "JWT access token verification failed.",
        "403"
      );
      throw e;
    }
  });
  const decoded = jwt.decode(token) as DecodedJWTObj;
  const id = decoded.id;
  const user = await queryGetUserById(id);
  const updatedAtTime = new Date(user[0].updatedAt).getTime();
  const issuedAtTime = decoded.iat * 1000;
  const TOLERANCE_MS = 1000;
  // have to multiply by 1000 because the issued at time is in seconds but getTime() returns in milliseconds
  if (updatedAtTime > (issuedAtTime + TOLERANCE_MS)) {
    log.info(NAMESPACE, "updated at time: ", updatedAtTime);
    log.info(NAMESPACE, "issuedAtTime: ", issuedAtTime);
    log.info(NAMESPACE, "tolerance: ", TOLERANCE_MS);
    log.info(NAMESPACE, "decoded is time: ", issuedAtTime + TOLERANCE_MS);
    const e = new AuthenticationError(
      "User details updated, token invalidated.",
      "403"
    );
    throw e;
  }
  return decoded;
};
