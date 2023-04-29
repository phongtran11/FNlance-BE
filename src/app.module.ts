import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { configuration } from './config';
import { AuthModule, UsersModule, FirebaseModule } from 'src/modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: configuration().mongoURI,
      }),
    }),
    AuthModule,
    UsersModule,
    FirebaseModule,
  ],
})
export class AppModule {}
