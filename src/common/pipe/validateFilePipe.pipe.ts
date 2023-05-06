import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

const mimeTypeRegex = ['png', 'webp', 'jpeg', 'svg'];

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    console.log(file);
    if (!mimeTypeRegex.includes(file.mimetype.split('/')[1])) {
      throw new BadRequestException(
        "File Extension Except: 'png', 'webp', 'jpeg', 'svg' ",
      );
    }

    return file;
  }
}
