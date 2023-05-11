import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';
export type TRequestWithToken = Request & { user: DecodedIdToken };

export type TOptionFilterFindMethod<T> = {
  filter: FilterQuery<T>;
  projection: ProjectionType<T>;
  queryOptions: QueryOptions<T>;
};
