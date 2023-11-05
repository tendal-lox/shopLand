import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from '../shared/entities/user.repository';
import { UserTypes } from '../shared/schema/user';
import * as process from 'process';
import {
  comparePassword,
  generateHashPassword,
} from '../shared/utilities/password-manager';
import { mailSender } from '../shared/utilities/mailHandler';
import Redis from 'ioredis';
import { AuthTokenService } from '../shared/utilities/generateToken';
import { Response } from 'express';
const redis = new Redis();
import { faker } from '@faker-js/faker';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    private userModelService: UserRepository,
    private readonly authTokenService: AuthTokenService,
  ) {}
  async create(dto: CreateUserDto) {
    // Check if user is existed
    const userExistStatus = await this.userModelService.findOne({
      email: dto.email,
    });
    if (userExistStatus) throw new BadRequestException('User Already Exist');

    // Check is it for admin
    if (
      dto.type === UserTypes.ADMIN &&
      dto.secretToken !== process.env.ADMIN_SECRERT_TOKEN
    ) {
      throw new BadRequestException('Invalid Secret Token');
    } else if (dto.type !== UserTypes.COSTUMER) {
      dto.isVerified = true;
    }

    // Generate the hash password
    dto.password = await generateHashPassword(dto.password);

    // Generate the otp
    const otp = Math.floor(Math.random() * 900000) + 100000;
    const time = new Date();
    const otpExpiryTime = time.setUTCMinutes(2);

    // Create user in DB
    const newUser = await this.userModelService.creation({
      ...dto,
      otp,
      otpExpiryTime,
    });

    redis.setex(`userOpt: ${newUser.name}`, +otpExpiryTime, otp);

    // Sending mail
    if (newUser.type !== UserTypes.ADMIN)
      mailSender(newUser.email, otp).then((res) => res);

    return {
      success: true,
      message:
        newUser.type === UserTypes.ADMIN
          ? 'Admin Created Successfully'
          : 'Please activate your account by verifying your email. We have sent you an email with the otp',
      result: { email: newUser.email },
    };
  }

  async login(email: string, password: string, res: Response) {
    // Validate requested user
    const currentUser = await this.userModelService.findOne({ email });
    const passwordValidation = await comparePassword(
      password,
      currentUser.password,
    );

    if (!currentUser || !passwordValidation)
      throw new NotFoundException('Invalid Email Or Password');
    if (!currentUser.isVerified)
      throw new UnauthorizedException('Please verify your email');

    // Generate JWT token
    const payload = {
      email: currentUser.email,
      id: currentUser._id,
      type: currentUser.type
    };
    const accessToken = await this.authTokenService.generateToken(payload);

    res.cookie('Authentication', accessToken, {httpOnly: true});

    return {
      success: true,
      message: 'Login successfully done',
      result: {
        user: {
          name: currentUser.name,
          email: currentUser.email,
          type: currentUser.type,
          id: currentUser._id,
        },
        accessToken,
      },
    };
  }

  async emailVerification(email: string, givenOtp: string) {
    // Checking user existence and otp validation
    const currentUser = await this.userModelService.findOne({ email });
    const userOtp = await redis.get(`userOpt: ${currentUser.name}`);

    if (userOtp !== givenOtp || !currentUser)
      throw new BadRequestException('Invalid OTP Or Email');

    // Update user details
    this.userModelService
      .updateOne({ email }, { isVerified: true })
      .then()
      .catch((err) => err);

    return {
      success: true,
      message: 'Email verified successfully! Now you can login',
    };
  }

  async resendOptMethod(email: string) {
    // Checking user existence
    const currentUser = await this.userModelService.findOne({ email });
    if (!currentUser) throw new BadRequestException('User Not Found');

    // Check user validation
    if (currentUser.isVerified === true)
      throw new Error('Email already verified');

    // Check otp expiry
    const otpExistenceStatus = await redis.ttl(`userOpt: ${currentUser.name}`);
    if (otpExistenceStatus !== 0)
      throw new BadRequestException('OTP has been sent');

    const newOtp = Math.floor(Math.random() * 900000) + 100000;
    const otpExpiryTime = new Date();
    otpExpiryTime.setUTCMinutes(2);

    redis.setex(`userOpt: ${currentUser.name}`, +otpExpiryTime, newOtp);

    // Sending email
    mailSender(currentUser.email, newOtp).then((res) => res);

    // Update user details
    this.userModelService
      .updateOne({ email }, { otp: newOtp })
      .then()
      .catch((err) => err);

    return {
      success: true,
      message: 'Check your email to validate your email with new otp',
      result: { email: currentUser.email },
    };
  }

  async forgotPassword(email: string) {
    // Checking user existence
    const currentUser = await this.userModelService.findOne({ email });
    if (!currentUser) throw new BadRequestException('User Not Found');

    // Check user validation
    if (currentUser.isVerified !== true)
      throw new Error('You should verify your email first');

    // Create password and hashing it
    const newPassword = faker.internet.password();
    const hashNewPassword = await generateHashPassword(newPassword);

    // Update user details
    this.userModelService
      .updateOne({ email }, { password: hashNewPassword })
      .then((res) => {
        // Sending new email
        mailSender(currentUser.email, newPassword).then((res) => res);
      })
      .catch((err) => err);

    return {
      success: true,
      message: 'New password sent to your email',
      result: {
        email,
      },
    };
  }

  logOut(res: Response) {
    res.clearCookie('Authentication');

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Logging out successfully done',
    });
  }

  async updateNameAndPassword(_id: string, dto: UpdateUserDto) {
    // Find user
    const user = await this.userModelService.findOne({_id})
    console.log(user)

    // Modify password and name
    const {newPassword, oldPassword, name} = dto

    if (!await comparePassword(oldPassword, user.password)) throw new Error('Current password does not match')

    const hashNewPass = await generateHashPassword(newPassword)

    // Update user details
    this.userModelService.updateOne({_id}, {password: hashNewPass, name: name }).then()

    return {
      success: true,
      message: 'Username and password have been updated'
    }
  }

  async findAll(type: string) {
    // Find all users
    const allData = await this.userModelService.findAll({type})

    return {
      success: true,
      message: 'All users',
      result: allData
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {}

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
