import {
   Inject, Logger, 
   Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionModule } from './question/question.module';
import { ConfigModule,
   ConfigService 
  }
    from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import * as admin from 'firebase-admin';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [UserModule],
      useFactory: async (userService: UserService) => ({
        autoSchemaFile: true,
        context: async ({ req, res }) => {
          let firebaseId: string;
          if (process?.env?.NODE_ENV?.trim() === 'development') {
            firebaseId = process.env.USER_UID_FOR_TESTING;
            Logger.log("Running on test mode", AppModule.name);
          } else {
            const token = req?.headers?.authorization?.replace('Bearer ', '');
            const { uid } = await admin.auth().verifyIdToken(token);
            firebaseId = uid;
          }
          if (req.body.operationName === 'upsertUser') {
            req['userId'] = firebaseId;
          } else {
            const user = await userService.findUserIdByFirebaseId(firebaseId);
            req['userId'] = user?._id;
          }
          return { req, res };
        },
      }),
      inject: [UserService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_DB_URI'),
      }),
      inject: [ConfigService],
    }),
    QuestionModule,
    UserModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(@Inject(ConfigService) configService: ConfigService) {
    const projectId = configService.get<string>('project_id');
    const privateKey = configService
      .get<string>('private_key')
      .replace(/\\n/g, '\n');
    const clientEmail = configService.get<string>('client_email');
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
      databaseURL: 'https://xxxxx.firebaseio.com',
    });
  }
}
