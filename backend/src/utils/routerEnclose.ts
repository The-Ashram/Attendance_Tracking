import { NextFunction, Request, Response } from 'express';
import log from '../config/log.config';

type routerEncloseFunction = (fn: Function, formatExchange: Function) => (req: Request, res: Response , next: NextFunction) => NextFunction | void;

type handlerReturnObject = {
    statusCode: number,
    data: Object,
    error: Error
}

const NAMESPACE = "routerEnclose";

/**
 * This function supports Clean Architecture by separating express web framework from controllers.
 * 
 * @param fn A controller function
 * @param formatExchange A function processing Request body or simply just Request.
 * @returns Response with status code and either json object or error message depending on the returnObject of controller function.
 */

export const routerEnclose: routerEncloseFunction = (fn, formatExchange) => (req, res) => {
    log.info(NAMESPACE, "ROUTER function hit!")
    fn(formatExchange ? formatExchange(req) : req).then(
        (returnObject: handlerReturnObject) => {
            log.info(NAMESPACE, "testing type of returned object in ROUTER: ", typeof(returnObject))
            if (returnObject.statusCode >= 200 && returnObject.statusCode < 300) {
                return res.status(returnObject.statusCode).json(returnObject.data);
            } else {
                return res.status(returnObject.statusCode).json(returnObject.error?.message);
            }
        },
    );
};

