import { Types, Document } from 'mongoose';
import { User } from '../user.schema';

export type TPropsUpdateUser = Partial<Record<keyof User, any | any[]>>;

export type TUserObjectMongoose = Document<unknown, object, User> &
  Omit<
    User & {
      _id: Types.ObjectId;
    },
    never
  >;
