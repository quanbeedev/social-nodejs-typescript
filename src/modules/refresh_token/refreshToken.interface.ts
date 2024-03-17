export interface IRefreshToken {
    user: string,
    token: string,
    expired: Date,
    created: Date,
    revoked: Date,
    replaceByToken: string,
    isActive: boolean,
    isExprired: boolean
}