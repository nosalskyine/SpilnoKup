export interface JwtPayload {
    userId: string;
    role: string;
    iat: number;
    exp: number;
}
export declare function generateAccessToken(userId: string, role: string): string;
export declare function generateRefreshToken(userId: string): string;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function verifyRefreshToken(token: string): JwtPayload;
//# sourceMappingURL=jwt.d.ts.map