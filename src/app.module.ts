import { Inject, Logger, Module } from '@nestjs/common';
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
import * as admin from 'firebase-admin';
import { UserService } from './user/user.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.get('MONGO_DB_URI'),
      }),
      inject: [ConfigService],
    }),
    QuestionModule,
    UserModule,
    NotificationModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(@Inject(ConfigService) configService: ConfigService) {
    const projectId = configService.get('project_id');
    const privateKey = configService.get('private_key').replace(/\@/g, '\n');
    const clientEmail = configService.get('client_email');
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
      databaseURL: 'https://xxxxx.firebaseio.com',
    });
  }
}
