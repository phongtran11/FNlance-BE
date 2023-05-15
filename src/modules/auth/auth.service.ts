import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuthErrorConstants } from './auth.error';

@Injectable()
export class AuthService {
  public validateHeaderToken = (request: Request): string => {
    let token = request.headers['authorization'] || '';
    token = token.replace(new RegExp('bearer ', 'gmi'), '');

    if (!token) {
      Logger.log('token required', 'AuthService');
      throw new BadRequestException(AuthErrorConstants.TOKEN_REQUIRE);
    }

    return token;
  };
}
