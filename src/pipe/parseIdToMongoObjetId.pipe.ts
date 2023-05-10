import {
  PipeTransform,
  HttpStatus,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
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

export class ParseMongooseObjectIDToArray
  implements PipeTransform<any, { arrayId: Types.ObjectId[] }>
{
  transform(value: any): { arrayId: Types.ObjectId[] } {
    if (!value.arrayId) {
      throw new BadRequestException('Missing Param arrayId');
    }

    const array = value.arrayId.map((id) => {
      if (!isValidObjectId(id)) {
        throw new HttpException(
          'Invalid mongodb object id',
          HttpStatus.BAD_REQUEST,
        );
      }

      return new Types.ObjectId(id);
    });

    return { arrayId: array, ...value };
  }
}
