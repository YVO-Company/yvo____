import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role?: string;
                companyId?: string;
                email?: string;
            };
        }
    }
}
