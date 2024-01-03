import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {join} from 'path'

import firebaseAdmin from 'firebase-admin';
import { DecodedIdToken, UserRecord } from 'firebase-admin/lib/auth';

import { TConfigService } from 'src/config';

import { AuthErrorConstants } from '../auth';

@Injectable()
export class FirebaseService {
  private readonly admin: firebaseAdmin.app.App;
  constructor(
    @Inject(ConfigService)
    private configService: TConfigService,
  ) {
    this.admin = firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(join(__dirname, '..', '..', '..', this.configService.get('firebaseCert'))),
      databaseURL: this.configService.get('firebaseDatabaseURL'),
    });

    this.admin.firestore();
  }


  public async verifyToken(token: string): Promise<DecodedIdToken> {
    try {
      return await this.admin.auth().verifyIdToken(token);
    } catch (error) {
      console.log(new Date().toLocaleString());
      console.log(error);
      throw new UnauthorizedException(AuthErrorConstants.TOKEN_EXPIRE);
    }
  }

  public async getUserByUid(uid: string): Promise<UserRecord> {
    return await this.admin.auth().getUser(uid);
  }
}
