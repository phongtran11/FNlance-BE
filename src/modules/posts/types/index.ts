import { Types, Document } from 'mongoose';
import { Post } from '../posts.schema';

export type TUserQueryByMongoose = Document<unknown, object, Post> &
  Omit<
    Post & {
      _id: Types.ObjectId;
    },
    never
  >;
