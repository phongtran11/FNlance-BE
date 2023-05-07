import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { createConnectionMongo } from './database';
import { PostsModule } from './modules/posts/posts.module';
import { UsersModule, FirebaseModule, AuthModule } from './modules';
import { configuration } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    createConnectionMongo(),
    UsersModule,
    PostsModule,
    FirebaseModule,
    AuthModule,
  ],
})
export class AppModule {}
