import { PipeTransform, HttpStatus, HttpException } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';

export class ParseMongooseObjectID
  implements PipeTransform<any, Types.ObjectId>
{
  transform(value: any): Types.ObjectId {
    if (typeof value === 'object') {
      value = value.id;
    }

    if (!isValidObjectId(value)) {
      throw new HttpException(
        'Invalid mongodb object id',
        HttpStatus.BAD_REQUEST,
      );
    }
    return new Types.ObjectId(value);
  }
}
