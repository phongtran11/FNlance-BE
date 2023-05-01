import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';

import { AuthError, AuthErrorConstants } from 'src/modules/auth';
import { UsersService } from 'src/modules/user';
import { FirebaseService } from 'src/modules/firebase';
import { UserDto } from 'src/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService,
  ) {}

  public validateHeaderToken = (request: Request): string => {
    let token = request.headers['authorization'] || '';
    token = token.replace(new RegExp('bearer ', 'gmi'), '');

    if (!token) {
      throw new BadRequestException(AuthErrorConstants.TOKEN_REQUIRE);
    }

    return token;
  };

  public async validateUserInMongo({ uid }: DecodedIdToken): Promise<UserDto> {
    let user = await this.usersService.getUserByUid(uid);

    if (!user) {
      const userInFirebase = await this.firebaseService.getUserByUid(uid);

      try {
        const newUser = await this.usersService.createUser({
          email: userInFirebase.email,
          password: userInFirebase.passwordSalt,
          displayName: userInFirebase.displayName,
          firebaseId: userInFirebase.uid,
          avatar: userInFirebase.photoURL,
          customClaims: userInFirebase.customClaims,
        });

        user = newUser;
      } catch (error) {
        const err = new AuthError(error);
        console.error(err);
        throw new InternalServerErrorException();
      }
    }

    return user;
  }
}
