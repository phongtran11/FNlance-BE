import * as path from 'path';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import * as process from 'process';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export type TConfiguration = {
  port: number;
  baseUrl: string;
  mongoURI: string;
  firebaseDatabaseUrl: string;
  // firebase admin cert
  firebaseType: string;
  firebaseProjectId: string;
  firebasePrivateKeyId: string;
  firebasePrivateKey: string;
  firebaseClientEmail: string;
  firebaseClientId: string;
  firebaseAuthUri: string;
  firebaseTokenUri: string;
  firebaseAuthProvider: string;
  firebaseClientX509CertUrl: string;
};

export type TConfigService = ConfigService<TConfiguration>;

export const configuration = (): TConfiguration => ({
  port: +process.env.PORT,
  baseUrl: process.env.BASE_URL,
  mongoURI: process.env.MONGO_URI,
  firebaseDatabaseUrl: process.env.FIREBASE_DATABASE_URL,
  firebaseType: process.env.FIREBASE_TYPE,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebasePrivateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebaseClientId: process.env.FIREBASE_CLIENT_ID,
  firebaseAuthUri: process.env.FIREBASE_AUTH_URI,
  firebaseTokenUri: process.env.FIREBASE_TOKEN_URI,
  firebaseAuthProvider: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  firebaseClientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
});
