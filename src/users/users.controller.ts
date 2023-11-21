import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserLoginDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public, Role, Roles } from '../shared/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: UserLoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const loginRes = await this.usersService.login(
      dto.email,
      dto.password,
      res,
    );
    // console.log(req)
    return loginRes;
  }

  @Public()
  @Get('email/verification')
  async emailVerification(
    @Query('email') email: string,
    @Query('otp') otp: string,
  ) {
    return await this.usersService.emailVerification(email, otp);
  }

  @Public()
  @Get('resend-opt')
  async resendOpt(@Query('email') email: string) {
    return this.usersService.resendOptMethod(email);
  }

  @Public()
  @Get('forgot-password')
  async forgotPassword(@Query('email') email: string) {
    return this.usersService.forgotPassword(email);
  }

  @Role(Roles.CUSTOMER)
  @Get('logout')
  async logOut(@Res() res: Response, @Req() req: Request) {
    return this.usersService.logOut(res, req);
  }

  @UseGuards(JwtAuthGuard)
  @Role(Roles.CUSTOMER)
  @Get('all')
  findAll(@Query('type') type: string) {
    return this.usersService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('update-username-password/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateNameAndPassword(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
