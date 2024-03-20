import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  
  getHello() {
    const mongoUri = this.configService.get("MONGO_DB_URI");    
    const geminiApiKey = this.configService.get("GEMINI_API_KEY");    
    const type = this.configService.get("type");    
    const project_id = this.configService.get("project_id");    
    const private_key_id = this.configService.get("private_key_id");    
    const private_key = this.configService.get("private_key")
    const client_email = this.configService.get("client_email");    
    const client_id = this.configService.get("client_id");    
    const auth_uri = this.configService.get("auth_uri");    
    const token_uri = this.configService.get("token_uri" );    
    const auth_provider_x509_cert_url = this.configService.get("auth_provider_x509_cert_url");    
    const client_x509_cert_url = this.configService.get("client_x509_cert_url");    
    const universe_domain = this.configService.get("universe_domain");    
    
    
    return {mongoUri,
       geminiApiKey,
        type, project_id, 
        private_key_id,private_key, 
        client_email,
        client_id,auth_uri, 
        token_uri, 
        auth_provider_x509_cert_url, 
        client_x509_cert_url,
        universe_domain
      };
  }
}
