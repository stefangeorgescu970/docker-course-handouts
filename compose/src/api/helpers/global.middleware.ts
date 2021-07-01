import { NextFunction, Request, Response } from "express";
import { getUser, KeyValue } from "./cassandra.service";


export const logRequest: (req: Request, res: Response, next: NextFunction) => void = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log(`${req.path} context`, {
        query: JSON.stringify(req.query),
        body: JSON.stringify(req.body),
    });
    next();
};

export const errorHandlerMiddleware: (err: Error, req: Request, res: Response, next: NextFunction) => void = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(500).json({error: err.message});
    return;
};

export const ceva: (req: Request, res: Response, next: NextFunction) => void = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {    
    const {result, error} = await getUser(req.params.user_id as string)
    if (!result) {
        next(error);
        return;
    }    
    res.status(200).json(result)    
};
