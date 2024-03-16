import { NextFunction, Request, Response } from "express";

import { DataStoredInToken } from "@core/interfaces";
import { Logger } from "@core/utils";
import jwt from 'jsonwebtoken';

const authMiddleWare = ( req: Request, res: Response, next: NextFunction) =>{
    const token = req.header('x-auth-token');

    if( !token ) return res.status(401).json({ message: "User not authorize"});

    try {
        const user = jwt.verify(token, process.env.JWT_TOKEN_SECRET ?? "") as DataStoredInToken;

        if( !req.user ) req.user = { id: ""};

        req.user.id = user.id
        next()
    } catch (error) {
        Logger.error(`[ERROR] message: ${token}`);

        if( error.name === 'TokenExpriedError'){
            res.status(401).json({message: "Token was exprired"});
        }else{
            res.status(401).json({message: "Token is not valid"});
        }
    }
}
export default authMiddleWare;