import {Inject, Injectable, InternalServerErrorException, UnauthorizedException} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

import firebaseAdmin from 'firebase-admin';
import { DecodedIdToken, UserRecord } from 'firebase-admin/lib/auth';

import { TConfigService } from 'src/config';

import { AuthErrorConstants } from '../auth';

@Injectable()
export class FirebaseService {
  private  admin: firebaseAdmin.app.App;
  constructor(
    @Inject(ConfigService)
    private configService: TConfigService,
  ) {
    this.getFirebaseSecret((secret) => {
      this.admin = firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(secret),
        databaseURL: this.configService.get('firebaseDatabaseURL'),

      } );
      this.admin.firestore();
    });
  }

  private async getFirebaseSecret (callback: (secret: string) => void){
    const client = new SecretsManagerClient({
      region: "ap-southeast-2",
      credentials: {
        secretAccessKey:  this.configService.get('awsSecretAccessKey'),
        accessKeyId: this.configService.get('awsAccessKeyId')
      }
    });

    try {
      const response =  await client.send(
        new GetSecretValueCommand({
          SecretId: "fnlance/be",
          VersionStage: "AWSCURRENT",
        })
      )
      callback(JSON.parse(response.SecretString))
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException()
    }

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
