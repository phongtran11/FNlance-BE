import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EUserMajor } from 'src/enums';

export type UserDocument = User & Document;

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
export class User {
  @Prop({ type: String, unique: true })
  email: string;

  @Prop({ type: String })
  password?: string;

  @Prop({ type: String })
  username?: string;

  @Prop({ type: String })
  firebaseId: string;

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: Object, default: { customRole: 'user' } })
  customClaims: Record<string, any>;

  @Prop({ type: [Types.ObjectId], ref: 'Post' })
  postsId: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Post' })
  postsReceive: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Post' })
  postSendOffer: Types.ObjectId[];

  @Prop({ type: String })
  address: string;

  @Prop({ type: [String] })
  major: EUserMajor[];

  @Prop({ type: String })
  phoneNumber: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
