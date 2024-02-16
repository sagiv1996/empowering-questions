import { Inject, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionModule } from './question/question.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import { transports } from 'winston';
import * as admin from 'firebase-admin';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new transports.File({ filename: 'combined.log', level: 'debug' }),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.Console(),
      ],
    }),
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: async ({ req, res }) => {
        console.log('HERE!!');
        const token = req?.headers?.authtoken?.replace('Bearer ', '');
        const { uid } = await admin.auth().verifyIdToken(token);
        req['uid'] = uid;
        return { req, res };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '.env.firebase'],
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
