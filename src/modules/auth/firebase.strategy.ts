import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

import { FirebaseService } from 'src/modules/firebase';
import { AuthService } from './auth.service';
import { AuthErrorConstants } from './auth.error';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(
  Strategy,
  'firebase',
) {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async validate(request: Request): Promise<any> {
    const token = this.authService.validateHeaderToken(request);

    if (!token) {
      throw new UnauthorizedException(AuthErrorConstants.TOKEN_REQUIRE);
    }

    const user = await this.firebaseService.verifyToken(token);

    if (!user) {
      throw new UnauthorizedException(AuthErrorConstants.ACCOUNT_NOT_EXISTS);
    }

    return await this.authService.validateUserInMongo(user);
  }
}
