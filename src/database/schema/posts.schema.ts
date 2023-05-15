import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  EPostStatus,
  ETypeOfJob,
  ETypeOfServices,
  ETypeOfWork,
  EWorkingForm,
  EPayForm,
  EStatusPostReceive,
} from 'src/enums';

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
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userReceived?: Types.ObjectId;

  @Prop({ type: String, trim: true, required: true })
  title: string;

  @Prop({ default: '', type: String, trim: true, required: true })
  description: string;

  @Prop({ type: String, default: EPostStatus.ACTIVE })
  status?: EPostStatus;

  @Prop({ type: String, default: EStatusPostReceive.PENDING })
  workingStatus?: EStatusPostReceive;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: String })
  location: string;

  @Prop({ type: [Number], required: true })
  budget: [number, number];

  @Prop({ type: Date })
  expiredDay: Date;

  @Prop({ type: Date })
  dateReceived?: Date;

  @Prop({ type: Date })
  dateFinished?: Date;

  @Prop({ type: String, default: ETypeOfJob.DEVELOP_WEBSITE })
  typeOfJob: ETypeOfJob;

  @Prop({ type: String, default: ETypeOfServices.BUILD_MOBILE_APP })
  typeOfServices: ETypeOfServices;

  @Prop({ type: String, default: ETypeOfWork.PART_TIME })
  typeOfWork: ETypeOfWork;

  @Prop({ type: String, default: EWorkingForm.REMOTE })
  workingForm: EWorkingForm;

  @Prop({ type: String, default: EPayForm.MONTH })
  payForm: EPayForm;

  @Prop({ type: [Types.ObjectId], ref: 'Request_receive_post' })
  listRequest?: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Request_receive_post' })
  requestReceived?: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
