import { NextFunction, Request, Response } from "express";
import log from "../config/log.config";
import {
  DecodedJWTObj,
  extractJWTReq,
} from "../modules/interfaces/auth.interfaces";

type routerEncloseFunction = (
  fn: Function,
  formatExchange: Function
) => (req: Request, res: Response, next: NextFunction) => NextFunction | void;

type handlerReturnObject = {
  statusCode: number;
  data: Object;
  headers?: { [key: string]: string }; 
  error: Error;
};

type handlerAuthReturnObject = {
  statusCode: number;
  data: DecodedJWTObj;
  error: Error;
};

const NAMESPACE = "routerEnclose";

/**
 * This function supports Clean Architecture by separating express web framework from controllers.
 *
 * @param fn A controller function
 * @param formatExchange A function processing Request body or simply just Request.
 * @returns Response with status code and either json object or error message depending on the returnObject of controller function.
 */

export const routerEnclose: routerEncloseFunction =
  (fn, formatExchange) => (req, res) => {
    log.info(NAMESPACE, "ROUTER function hit!");
    fn(formatExchange ? formatExchange(req) : req).then(
      (returnObject: handlerReturnObject) => {
        log.info(
          NAMESPACE,
          "testing type of returned object in ROUTER: ",
          typeof returnObject
        );
        if (returnObject.statusCode >= 200 && returnObject.statusCode < 300) {
          if (returnObject.headers && returnObject.headers['Content-Type'] === 'text/csv') {
            // If it's a CSV response, send it directly as text
            res.setHeader("Content-Type", returnObject.headers["Content-Type"]);
            res.setHeader("Content-Disposition", returnObject.headers["Content-Disposition"]);
            return res.status(returnObject.statusCode).send(returnObject.data);
          } else {
            // Otherwise, send JSON data
            return res.status(returnObject.statusCode).json(returnObject.data);
          }
        } else {
          return res
            .status(returnObject.statusCode)
            .json(returnObject.error?.message);
        }
      }
    );
  };

/**
 * This function supports Clean Architecture by by separating express web framework from middleware.
 *
 * @param fn An authentication function
 * @param formatExchange A function processing the Request header or simply just Request.
 * @returns Either NextFunction or Response with statuscode and error message depending on the returnObject of authentication function.
 */
export const routerEncloseAuthentication: routerEncloseFunction =
  (fn, formatExchange) => (req, res, next) => {
    log.info(NAMESPACE, "AUTH function hit!");
    fn(formatExchange ? formatExchange(req) : req).then(
      (returnObject: handlerAuthReturnObject) => {
        log.info(
          NAMESPACE,
          "testing type of returned object in AUTH: ",
          typeof returnObject
        );
        log.info(NAMESPACE, "Returned object in AUTH: ", returnObject);
        log.info(NAMESPACE, "Status code: ", returnObject.statusCode);
        if (returnObject.statusCode >= 200 && returnObject.statusCode < 300) {
          req.body.data = returnObject.data;
          return next();
        } else {
          return res
            .status(returnObject.statusCode)
            .json(returnObject.error?.message);
        }
      }
    );
  };
