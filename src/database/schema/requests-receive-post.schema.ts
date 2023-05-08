import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type RequestsReceivePostSchema = RequestsReceivePost & DocumentType;

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
export class RequestsReceivePost {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: String })
  proposalSkill: string;

  @Prop({ type: String })
  planImplement: string;

  @Prop({ type: Number })
  recommendCost: number;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: Date })
  expectDateDone: Date;
}

export const RequestsReceivePostSchema =
  SchemaFactory.createForClass(RequestsReceivePost);
