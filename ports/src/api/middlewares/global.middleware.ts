import { NextFunction, Request, Response } from "express";


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
    res.status(500).json(err);
    return;
};

export const ceva: (req: Request, res: Response, next: NextFunction) => void = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(200).json({name: "Ricardo"})
};
