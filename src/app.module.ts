import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configuration } from './common/config';
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
    UsersModule,
    PostsModule,
    FirebaseModule,
    AuthModule,
  ],
})
export class AppModule {}
