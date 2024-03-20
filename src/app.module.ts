import {
   Inject, 
   Logger, 
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
    })    ,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(@Inject(ConfigService) configService: ConfigService) {
    const projectId = configService.get('project_id');
    // const privateKey = configService
    //   .get('private_key').replace(/\\n/g, '\n');
    const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCskig8T2sHbTNU\n4dYUSF1n5B63TPk0xRmlsNAzFKq51sEXlw6slI8MU8wmY/Izt1SaaIQOmwJuguLW\n4m9f8aS9CstLJvhXgJS9mmwMn+qfWqb+YQwZGUURtos3ilkd5c/u/Pc3EGyO2mF/\nRVsGgS6AO5ScRRnGNReTL4trQ3X21rOuFq5oIamMmu8PWraUSXaLeguR06qR4noq\nUd7WegHfxIDjRsgZK4sZJsjqzpOOkabQ+xE8lDw6jsg1yfYW6dQg1mSYwcHujeuc\nVXjAVYMm3go6lursY19lCR3oy79BHN4nCKFrGcIwn+/i1qxr42wJ+Xea0MrEwK4r\njfwESVHzAgMBAAECggEAG3ratV/gJzqYZffgYzJyzUxiJ8Y2GNUaFGxnevrbhORR\nszP2vjyZ2titNZ/Mvbd/3WavQLQmWvq0rIs6OQj9tqy1Wq5F9YkgJmEku43ripyg\n4vkJOCXx/bQXzyxUrJIf3mqh4z7WSpkz1VRx/kMr6HeUXp4SUKG7s1Bq3xXK/xdG\nXZpxrusN5f066YuBAiySRl4S+eX0OlkPCHzs4BPdyu+9D/uwb8xuqkbzfMFnoHZe\nEI/ahLFHhE6ms8kPLO2f/GFIW+DuvR34Q/xbn7chDvTPm1vncklq1rXWg0mB8lA0\nPpiHBkMOqPbSQKIytsKsL4mMbUXIxW/lH22DQsFEwQKBgQDbN0GVKbAf3dmGoouu\nl6NjxlVQHDJKd+dUfSdYUBmPoBJfsSx0cTCpjW7f6QdqWu2AOY6gCFvT6icrbz7i\nR6I7QueGAJZ1hFblYpnqvFaSg9EOAn5OpehVo+UgssA6iCXIMcEN4tlb7Yb0phM5\ne2Tzb7u/XbBmwbkDZSr+6V/hOQKBgQDJhzLrrpQnoh6A4y68SzSiJvZiwgtkm5GI\nvdkNBoF3rMURNWuo1qoqFunouENGl602ztC+zhSWfZXzQmECMnYVoPfg67y/wYaq\nVeDZw490XQtBGLWJYdXfEXxd7oN9wqBho7irzEwNqFKyP3/1BomVsMQ+5BNjcTRZ\nDlfu3vJIiwKBgQCleRpaPDOkelQ+2ufRjMlbAVVYuVAFAmluT2KpuRzyW4RDE3xZ\nETAIbKhrAH4GfEiW59uPVX/rgO68TKcNK8F8Nk6JylvIrXLiiAFjPXOj+TiO+Lbb\nK0UrkCHfAs8z352Vdmkh0ED+sVeTyODuHQTg9VClbVVA266Kr407CnLDkQKBgQC5\nYyX0qSShUQG+jz7u+D/y6uS89MSGSJYYtIx27wUqkkS3D+154/+luG51Jwy8Y8t0\nH8znuaw2xFCs9uNGoiT+wJVG05VO0TiQeW/e44eUBAPWXmShfN7B1dQSlNdhWSkw\nqOu5HrbX2YA5eTC8tsbabUIamLU9RWZihk9d7rnzAQKBgDC2NfzvxQOpox/U2Kbq\nBlne84OkNWi0LUlaeUK1mf/i2UpYoEcrH5ztfWpcWrdlsilnuj26lRCxHCxkCLwn\nQK/1zf/Qs060ViZetlsJOJeHIaAeV9v6OAfIpSMCeH/AbAFXPlfpp6bYqCwp5bb+\nch6FB+QhOPo9NYntglPZAgEm\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n')
    const clientEmail = configService.get('client_email');
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
      databaseURL: 'https://xxxxx.firebaseio.com',
    });
  }
}
