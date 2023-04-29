import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(User);
