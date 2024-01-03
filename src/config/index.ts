import * as path from 'path';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import * as process from 'process';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export type TConfiguration = {
  port: number;
  baseUrl: string;
  mongoURI: string;
  firebaseDatabaseURL: string
  awsAccessKeyId: string
  awsSecretAccessKey: string
};

export type TConfigService = ConfigService<TConfiguration>;

export const configuration = (): TConfiguration => ({
  port: +process.env.PORT,
  baseUrl: process.env.BASE_URL,
  mongoURI: process.env.MONGO_URI,
  firebaseDatabaseURL: process.env.FIREBASE_DATABASE_URL,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
