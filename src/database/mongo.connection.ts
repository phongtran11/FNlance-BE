import { DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { configuration } from 'src/common/config';

export const createConnectionMongo = (): DynamicModule => {
  return MongooseModule.forRootAsync({
    useFactory: async () => ({
      uri: configuration().mongoURI,
    }),
  });
};
