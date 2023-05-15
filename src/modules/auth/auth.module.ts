import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { FirebaseAuthStrategy } from './firebase.strategy';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [PassportModule, FirebaseModule],
  providers: [AuthService, FirebaseAuthStrategy],
})
export class AuthModule {}
