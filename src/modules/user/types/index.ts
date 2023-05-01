import { Document, Types } from 'mongoose';
import { User } from '../user.schema';

export type TUserQueryByMongoose = Document<unknown, object, User> &
  Omit<
    User & {
      _id: Types.ObjectId;
    },
    never
  >;
