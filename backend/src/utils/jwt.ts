import { access } from "fs";
// utils/jwt.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config";
import log from "../config/log.config";
import { AuthenticationError } from "./errorTypes";
import { DecodedJWTObj } from "../modules/interfaces/auth.interfaces";
import { queryGetUserById } from "../db/queries/users.query";
import { getErrorMessage } from "./errorHandler";

const NAMESPACE = "JWT-UTILS";

export const generateToken = (payload: object, secret: string): string => {
  try {
    const token = jwt.sign(payload, secret, {
      expiresIn: "1h",
    });
    return token;
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    throw new AuthenticationError("Error while signing in", "401");
  }
};

const isJwtPayload = (payload: string | JwtPayload): payload is JwtPayload => {
  return (payload as JwtPayload).exp !== undefined;
};

export const verifyAccessToken = async (token: string) => {
  const tokenuse = Buffer.from(
    config.server.access_public_secret,
    "base64"
  ).toString("ascii");

  jwt.verify(token, tokenuse, (error) => {
    if (error) {
      const e = new AuthenticationError("JWT failed.", "403");
      throw e;
    }
  });
  const decoded = jwt.decode(token) as DecodedJWTObj;
  const id = decoded.id;
  const user = await queryGetUserById(id);
  // have to multiply by 1000 because the issued at time is in seconds but getTime() returns in milliseconds
  if (user[0].updatedAt.getTime() > decoded.iat * 1000) {
    log.info(NAMESPACE, "updated at time: ", user[0].updatedAt.getTime());
    log.info(NAMESPACE, "decoded is time: ", decoded.iat * 1000);
    const e = new AuthenticationError(
      "User details updated, token invalidated.",
      "403"
    );
    throw e;
  }
  return decoded;
};

export const verifyRefreshToken = async (token: string) => {
  const tokenuse = Buffer.from(
    config.server.refresh_public_secret,
    "base64"
  ).toString("ascii");
  jwt.verify(token, tokenuse, (error) => {
    if (error) {
      throw error;
    }
  });
  const decoded = jwt.decode(token) as DecodedJWTObj;
  const id = decoded.id;
  const user = await queryGetUserById(id);
  // have to multiply by 1000 because the issued at time is in seconds but getTime() returns in milliseconds
  if (user[0].updatedAt.getTime() > decoded.iat * 1000) {
    log.info(NAMESPACE, "updated at time: ", user[0].updatedAt.getTime());
    log.info(NAMESPACE, "decoded is time: ", decoded.iat * 1000);
    const e = new AuthenticationError(
      "User details updated, token invalidated.",
      "403"
    );
    throw e;
  }
  return decoded;
};
