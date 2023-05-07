import { Types, Document } from 'mongoose';
import { Post } from '../schema/posts.schema';

export type TPostQueryByMongoose = Document<unknown, object, Post> &
  Omit<
    Post & {
      _id: Types.ObjectId;
    },
    never
  >;

export type TUpdateUserProp = Partial<Record<keyof Post, any>>;
