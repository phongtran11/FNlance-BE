import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthErrorConstants } from './auth.error';

@Injectable()
export class AuthService {
  public validateHeaderToken = (request: Request): string => {
    let token = request.headers['authorization'] || '';
    token = token.replace(new RegExp('bearer ', 'gmi'), '');

    if (!token) {
      console.log(new Date().toLocaleString());
      console.log('Auth Service');
      throw new BadRequestException(AuthErrorConstants.TOKEN_REQUIRE);
    }

    return token;
  };
}
