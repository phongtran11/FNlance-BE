import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';
import { TUserFromFirebase } from './user.type';

export type TOptionFilterFindMethod<T> = {
  filter: FilterQuery<T>;
  projection: ProjectionType<T>;
  queryOptions: QueryOptions<T>;
};

export type TRequestWithToken = Request & { user: TUserFromFirebase };
