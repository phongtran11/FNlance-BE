import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configuration } from './config';
import { AuthModule, UsersModule, FirebaseModule } from 'src/modules';
import { createConnectionMongo } from './database';
import { PostsModule } from './modules/posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    createConnectionMongo(),
    AuthModule,
    UsersModule,
    FirebaseModule,
    PostsModule,
  ],
})
export class AppModule {}
