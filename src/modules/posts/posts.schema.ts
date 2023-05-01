import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EPostStatus } from 'src/common/enums';

export type PostDocument = Post & Document;

@Schema({
  toJSON: {
    virtuals: true,
    transform: (_, converted) => {
      delete converted._id;
    },
  },
  toObject: {
    getters: true,
  },
  versionKey: false,
  timestamps: true,
  minimize: false,
})
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'user' })
  userId: Types.ObjectId;

  @Prop({ type: String, trim: true })
  title: string;

  @Prop({ default: '', type: String, trim: true })
  description: string;

  @Prop({ type: String, default: EPostStatus.ACTIVE })
  status: EPostStatus;

  @Prop({ type: [String] })
  tag: string[];

  @Prop({ type: String })
  location: string;

  @Prop({ type: [Number] })
  budget: [number, number];

  @Prop({ type: Date })
  expiredDay: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
