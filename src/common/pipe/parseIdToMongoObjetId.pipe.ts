import { PipeTransform, HttpStatus, HttpException } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';

export class ParseMongooseObjectID
  implements PipeTransform<string, Types.ObjectId>
{
  transform(value: string): Types.ObjectId {
    if (!isValidObjectId(value)) {
      throw new HttpException(
        'Invalid mongodb object id',
        HttpStatus.BAD_REQUEST,
      );
    }
    return new Types.ObjectId(value);
  }
}
