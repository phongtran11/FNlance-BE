import { DecodedIdToken } from 'firebase-admin/auth';
import { Types, Document } from 'mongoose';
import { User } from 'src/database';

export type TPropsUpdateUser = Partial<Record<keyof User, any | any[]>>;

export type TUserObjectMongoose = Document<unknown, object, User> &
  Omit<
    User & {
      _id: Types.ObjectId;
    },
    never
  >;

export type TUserFromFirebase = DecodedIdToken & { name: string };
