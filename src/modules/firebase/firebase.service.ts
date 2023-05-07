import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import firebaseAdmin from 'firebase-admin';
import { DecodedIdToken, UserRecord } from 'firebase-admin/lib/auth';

import { TConfigService, configuration } from 'src/config';
import { EUserRoles } from 'src/enums';

import { AuthErrorConstants } from '../auth';

@Injectable()
export class FirebaseService {
  private readonly admin: firebaseAdmin.app.App;
  private database: firebaseAdmin.firestore.Firestore;

  constructor(
    @Inject(ConfigService)
    private configService: TConfigService,
  ) {
    const serviceAccount = this.getFirebaseJson();

    this.admin = firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(
        serviceAccount as firebaseAdmin.ServiceAccount,
      ),
      databaseURL: this.configService.get('firebaseDatabaseUrl'),
    });

    this.database = this.admin.firestore();
  }

  private getFirebaseJson() {
    const {
      firebaseType,
      firebasePrivateKey,
      firebaseClientX509CertUrl,
      firebaseClientEmail,
      firebaseProjectId,
      firebasePrivateKeyId,
      firebaseClientId,
      firebaseAuthUri,
      firebaseTokenUri,
      firebaseAuthProvider,
    } = configuration();

    return {
      type: firebaseType,
      project_id: firebaseProjectId,
      private_key_id: firebasePrivateKeyId,
      private_key: firebasePrivateKey,
      client_email: firebaseClientEmail,
      client_id: firebaseClientId,
      auth_uri: firebaseAuthUri,
      token_uri: firebaseTokenUri,
      auth_provider_x509_cert_url: firebaseAuthProvider,
      client_x509_cert_url: firebaseClientX509CertUrl,
    };
  }

  private async updateCustomClaim(
    uid: string,
    customClaim: { customRole: EUserRoles },
  ): Promise<void> {
    await this.admin.auth().setCustomUserClaims(uid, customClaim);
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
