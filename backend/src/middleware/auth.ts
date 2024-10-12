// middleware/auth.ts
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt";
import log from "../config/log.config";
import { extractJWTReq } from "../modules/interfaces/auth.interfaces";
import { getErrorMessage } from "../utils/errorHandler";

type event = {
  source: string;
  payload: object;
};

type eventHandler = (event: event) => Object;

const NAMESPACE = "Auth-Middleware";

/**
 * This function verifies if both the access and refresh tokens stored in the header are valid or not.
 *
 * @param event An event variable received from the express router containing both access and refresh tokens.
 * @returns An object containing the statusCode and either an object containing the decoded jwt payload for both tokens or an error.
 */
export const extractBothJWT: eventHandler = async (event) => {
  log.info(NAMESPACE, "Validating token...");
  const { accessToken, refreshToken } = event.payload as extractJWTReq;

  if (accessToken && refreshToken) {
    try {
      const accessDecoded = await verifyAccessToken(accessToken);
      log.info(NAMESPACE, "Access token validated.");
      const refreshDecoded = await verifyRefreshToken(refreshToken);
      log.info(NAMESPACE, "Refresh token validated.");

      log.info(
        NAMESPACE,
        "Access & Refresh tokens are stored in req.data as Object."
      );
      return {
        statusCode: 200,
        data: {
          accessDecoded: accessDecoded,
          refreshDecoded: refreshDecoded,
        },
      };
    } catch (error) {
      log.error(NAMESPACE, getErrorMessage(error), error);
      return {
        statusCode: 401,
        error: new Error("Failed to verify JWT Tokens!"),
      };
    }
  } else {
    log.error(NAMESPACE, "Missing JWT tokes!");
    return {
      statusCode: 401,
      error: new Error("User is unauthorized!"),
    };
  }
};

/**
 * This function verifies if the refresh token stored in the header is valid or not.
 *
 * @param eventAn Am event variable received from the express router containing the refresh token.
 * @returns An object containing the statusCode and either the decoded jwt payload for refresh token or an error.
 */
export const extractRefreshJWT: eventHandler = async (event) => {
  log.info(NAMESPACE, "Validating token...");

  const { refreshToken } = event.payload as extractJWTReq;

  if (refreshToken) {
    try {
      const refreshDecoded = verifyRefreshToken(refreshToken);
      log.info(NAMESPACE, "Refresh token validated.");
      const decoded = refreshDecoded; // passing the decoded to the endpoint, saving the variable to the middleware that is going to use this payload next
      log.info(NAMESPACE, "Refresh token stored in locals.");
      return {
        statusCode: 200,
        data: decoded,
      };
    } catch (error) {
      log.error(NAMESPACE, getErrorMessage(error), error);
      return {
        statusCode: 401,
        error: new Error("Failed to verify refresh token!"),
      };
    }
  } else {
    log.error(NAMESPACE, "Missing JWT refresh token!");
    return {
      statusCode: 401,
      error: new Error("User is unauthorized!"),
    };
  }
};
