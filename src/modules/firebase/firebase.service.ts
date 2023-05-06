import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import firebaseAdmin from 'firebase-admin';
import { DecodedIdToken, UserRecord } from 'firebase-admin/lib/auth';

import { configuration, TConfigService } from 'src/common/config';
import { AuthErrorConstants } from '../auth';
import { EUserRoles } from 'src/modules/user/enum';

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
    try {
      await this.admin.auth().setCustomUserClaims(uid, customClaim);
    } catch (error) {
      this.errorException(error);
    }
  }

  public async verifyToken(token: string): Promise<DecodedIdToken> {
    try {
      return await this.admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error(new Date(), error);
      throw new UnauthorizedException(AuthErrorConstants.TOKEN_EXPIRE);
    }
  }

  public async getUserByUid(uid: string): Promise<UserRecord> {
    try {
      const user = await this.admin.auth().getUser(uid);

      return user;
    } catch (error) {
      this.errorException(error);
    }
  }

  private errorException(error: unknown) {
    console.log(new Date(), error);
    throw new InternalServerErrorException();
  }
}
