import { DataStoredInToken, TokenData } from "@core/interfaces";

import crypto from "crypto";
import jwt from 'jsonwebtoken';

export const isEmtyObject = (obj: any): boolean => {

    console.log(obj)
    if( typeof obj !== 'object'){
        return true
    }

    return !Object.keys(obj).length;
}

export const randomTokenString = () =>{
    return crypto.randomBytes(40).toString('hex');
}

export const generateJwtToken = (userId: string, refreshToken: string): TokenData => {
    const dataInToken: DataStoredInToken= { id: userId};
    const seret: string = process.env.JWT_TOKEN_SECRET ?? "";
    const expireIn = 60;

    return {
        token: jwt.sign(dataInToken, seret, {expiresIn: expireIn}),
        refreshToken: refreshToken
    }
}
