import { queryGetUserById } from "./../../db/queries/users.query";
import { getErrorMessage, getErrorName } from "../../utils/errorHandler";
import { generateToken } from "../../utils/jwt";
import log from "./../../config/log.config";
import config from "./../../config/config";
import { LoginRequestBody } from "../interfaces/users.interfaces";
import {
  BadUserRequestError,
  DatabaseRequestError,
} from "../../utils/errorTypes";
import { users, UsersSchema } from "../../db/schema/users.schema";
import { eq, sql } from "drizzle-orm";
import db from "../../config/db";
import { comparePassword } from "../../utils/hashing";
import { DecodedJWTObj } from "../interfaces/auth.interfaces";

type event = {
  source: string;
  payload: Object;
};

type eventHandler = (event: event) => Object;

const NAMESPACE = "Auth-Handler";

const refreshAccessToken: eventHandler = async (event) => {
  log.info(NAMESPACE, "Refresh token validated, user is authorized.");
  const { id } = event.payload as DecodedJWTObj;
  try {
    if (!id) {
      const e = new BadUserRequestError("Missing id parameter", "401");
      throw e;
    }

    const userRequested = await queryGetUserById(id);
    const accessToken = generateToken(userRequested[0], "accessPrivateKey");
    log.info(
      NAMESPACE,
      "---------END OF ACCESS TOKEN REFRESH PROCESS---------"
    );
    return {
      statusCode: 200,
      data: {
        message: "Refreshing of accessToken successful.",
        accessSigningPayload: accessToken,
        userType: userRequested[0],
      },
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code === null ? 500 : code;
    return {
      statusCode: errorCode,
      error: new Error("Refreshing accessToken failed."),
    };
  }
};

export const loginUser: eventHandler = async (event) => {
  const { email, password } = event.payload as LoginRequestBody;

  try {
    if (!email || !password) {
      log.error(NAMESPACE, "Email and password are required ");
      const e = new DatabaseRequestError(
        "Email and password are required",
        "400"
      );
      throw e;
    }

    const usersResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = usersResult[0];

    if (!user) {
      log.error(NAMESPACE, "Invalid user ");
      const e = new DatabaseRequestError("Invalid user", "401");
      throw e;
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      log.error(NAMESPACE, "Invalid password ");
      const e = new DatabaseRequestError("Invalid password", "401");
      throw e;
    }

    const privateKey = Buffer.from(
      config.server.access_private_secret,
      "base64"
    ).toString("ascii");
    // Generate JWT token
    const refreshSecret = Buffer.from(
      config.server.refresh_private_secret,
      "base64"
    ).toString("ascii");

    const accessToken = generateToken(
      { id: user.id, email: user.email, role: user.role },
      privateKey
    );
    const refreshToken = generateToken(
      { id: user.id, email: user.email, role: user.role },
      refreshSecret
    );

    return {
      statusCode: 200,
      data: {
        message: "Login successful",
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  } catch (error) {
    log.error(NAMESPACE, getErrorMessage(error), error);
    const code = parseInt(getErrorName(error));
    const errorCode = code || 400;
    return {
      statusCode: errorCode,
      error: new Error("Get user(s) request failed."),
    };
  }
};

export const validateToken: eventHandler = async (event) => {
  log.info(NAMESPACE, "Token validated, user is authorized.");
  log.info(NAMESPACE, "---------END OF TOKEN VALIDATION PROCESS---------");
  const decoded = event.payload;
  return {
    statusCode: 200,
    data: {
      message: "Authorized user.",
      decodedSignature: decoded,
    },
  };
};

export default {
  loginUser,
  validateToken,
  refreshAccessToken,
};
