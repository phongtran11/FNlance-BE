import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  EPayForm,
  EPostStatus,
  ETypeOfJob,
  ETypeOfServices,
  ETypeOfWork,
  EWorkingForm,
} from '../enum';

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
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: String, trim: true })
  title: string;

  @Prop({ default: '', type: String, trim: true })
  description: string;

  @Prop({ type: String, default: EPostStatus.ACTIVE })
  status: EPostStatus;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: String })
  location: string;

  @Prop({ type: [Number] })
  budget: [number, number];

  @Prop({ type: Date })
  expiredDay: Date;

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
}

export const PostSchema = SchemaFactory.createForClass(Post);
