import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

export type TRequestWithToken = Request & { user: DecodedIdToken };
