import { Types, Document } from 'mongoose';
import { Post } from '../posts.schema';

export type TPostQueryByMongoose = Document<unknown, object, Post> &
  Omit<
    Post & {
      _id: Types.ObjectId;
    },
    never
  >;
