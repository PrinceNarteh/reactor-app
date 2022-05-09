import { Body, Controller, Post } from '@nestjs/common';
import { GenerateProductKeyDto, LoginDto, RegisterDto } from '../dtos/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register/:userType')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('/login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('/key')
  generateProductKey(@Body() body: GenerateProductKeyDto){
    return this.authService.generateProductKey(body)
  }
}
