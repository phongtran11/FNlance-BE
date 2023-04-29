import { BadRequestException, Injectable } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';

import { AuthError, AuthErrorConstants } from 'src/modules/auth';
import { User, UsersRepository } from 'src/modules/user';
import { FirebaseService } from 'src/modules/firebase';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UsersRepository,
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

  public async validateUserInMongo({
    uid,
    email,
  }: DecodedIdToken): Promise<User> {
    let user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      const userInFirebase = await this.firebaseService.getUserByUid(uid);

      try {
        const newUser = await this.userRepository.createUser({
          email: userInFirebase.email,
          password: userInFirebase.passwordSalt,
          displayName: userInFirebase.displayName,
          firebaseId: userInFirebase.uid,
          avatar: userInFirebase.photoURL,
          customClaims: userInFirebase.customClaims,
        });

        user = newUser;
      } catch (error) {
        throw new AuthError(error);
      }
    }

    return user;
  }
}
