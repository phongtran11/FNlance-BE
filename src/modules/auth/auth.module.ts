import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../user';
import { AuthService } from './auth.service';
import { FirebaseAuthStrategy } from './firebase.strategy';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, FirebaseAuthStrategy],
})
export class AuthModule {}
