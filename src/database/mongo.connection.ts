import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { configuration } from 'src/config';

export const createConnectionMongo = (): DynamicModule => {
  return MongooseModule.forRootAsync({
    useFactory: async () => ({
      uri: configuration().mongoURI,
    }),
  });
};
