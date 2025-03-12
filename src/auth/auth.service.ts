/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserRegisterDto } from './dto/create-user-register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateUserVerifyDto } from './dto/create-user-verify.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreateUserLoginDto } from './dto/create-user-logn.dto';
import { Session } from 'src/types/auth.types';
import { CreateUserRefreshDto } from './dto/create-user-refresh.dto';
import { CreateUserResetPasswordDto } from './dto/create-user-reset-pass.dto';
import { CreateUserForgotPasswordDto } from './dto/create-user-forgot-pass.dto';
import { VerifyRequest } from 'src/middlewares/verify.middleware';
import { jwtConfig } from 'src/config/jwt.config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';


import * as dotenv from "dotenv"
dotenv.config()

@Injectable()
export class AuthService {
  private readonly sevenDaysExpire = 7 * 24 * 60 * 60 * 1000;
  private readonly hourExpire = 60 * 60 * 1000;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // @InjectRepository(User) private userRepository: Repository<User>,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly messageService: MailerService,
  ) {}

  private async sendMail(message: string, to: string, subject?: string) {
    await this.messageService.sendMail({
      from: `Kazi Towfiq <${process.env.EMAIL_USERNAME!}>`,
      to,
      subject: subject || 'Email Confirmation!',
      text: message,
    });
  }

  private createAccessAndRefreshToken(payload: Session) {
    try {
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '7d',
      });

      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: '7d',
      });

      return { accessToken, refreshToken };
    } catch {
      return {};
    }
  }

  private async saveTokensToMemory(
    key: string | number,
    accessToken: string,
    refreshToken: string,
  ) {
    await this.cacheManager.set(
      `${key}_access_token`,
      accessToken,
      this.hourExpire,
    );

    await this.cacheManager.set(
      `${key}_refresh_token`,
      refreshToken,
      this.sevenDaysExpire,
    );
  }

  private getUniqueCustomerID() {
    return +`${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
  }

  async session(session: Session) {
    try {
      const { id } = session || {};

      // Fetch the user by ID using Mongoose
      const user = await this.userModel.findById(id).exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        status: true,
        data: user,
      };
    } catch {
      throw new InternalServerErrorException('Unable to get session data');
    }
  }

  async register(createUserRegisterDto: CreateUserRegisterDto) {
    const { email, password, ...restUser } = createUserRegisterDto;
    try {
      // console.log('Register Email: ', email);

      // Check if the user already exists
      const isExist = await this.userModel.findOne({ email }).exec();

      if (isExist) {
        throw new BadRequestException('User already registered', {
          cause: new Error(),
          description: 'User already registered with this email',
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user document
      const user = new this.userModel({
        email,
        password: hashedPassword,
        ...restUser,
      });

      // Save the user document
      const saveResponse = await user.save();

      // Prepare session payload
      const payload: Session = {
        email,
        id: saveResponse?._id.toString(),
        userName: saveResponse?.userName,
      };

      // Generate JWT token
      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
        secret: process.env.JWT_SECRET,
      });

      // Cache the token
      await this.cacheManager.set(
        `${saveResponse._id}_email_token`,
        token,
        this.hourExpire,
      );

      // Send confirmation email
      console.log("Send confirmation email")
      await this.sendMail(
        `Please click on this link to confirm ${process.env.ORIGIN_URL + `/login?token=${token}`}`,
        email,
      );

      return saveResponse;
    } catch (error: any) {
      await this.userModel.findOneAndDelete({ email });

      throw new InternalServerErrorException(
        error.message || 'Unable to register the user',
      );
    }
  }

  async login(createUserLoginDto: CreateUserLoginDto) {
    try {
      const { email, password } = createUserLoginDto;

      // Find the user by email using Mongoose
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        throw new NotFoundException('User not registered');
      }

      if (user?.status !== 'active') {
        throw new UnauthorizedException('User not activated!');
      }

      // Check if the password matches
      const isPasswordMatched = await bcrypt.compare(password, user.password);

      if (!isPasswordMatched) {
        throw new UnauthorizedException('Invalid password');
      }

      // Prepare the payload for JWT
      const payload: Session = {
        id: user._id.toString(),
        email: user.email,
        userName: user.userName,
        user,
      };

      // Create access and refresh tokens
      const { accessToken, refreshToken } =
        this.createAccessAndRefreshToken(payload);

      // Store tokens in memory (cache)
      // await this.saveTokensToMemory(
      //   user._id.toString(),
      //   accessToken,
      //   refreshToken,
      // );

      // console.log({accessToken, refreshToken,payload})

      return {
        success: true,
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.message || 'Unable to login. Try again!',
      );
    }
  }

  async activateAccount(createUserVerifyDto: CreateUserVerifyDto) {
    try {
      const { token } = createUserVerifyDto || {};

      const decoded = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      if (!decoded) {
        throw new UnauthorizedException('Unauthorized access');
      }

      const { id } = decoded;
      const curDate = Math.floor(Date.now() / 1000);
      const isExpired = decoded.exp < curDate;

      if (isExpired) {
        throw new BadRequestException('Unauthorized Access');
      }

      const tokenFromCache = await this.cacheManager.get(`${id}_email_token`);
      if (!tokenFromCache || token !== tokenFromCache) {
        throw new BadRequestException('Unauthorized Access');
      }

      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException('Unauthorized Access');
      }

      if (user?.status === 'active') {
        throw new BadRequestException('Account is already active');
      }

      user.status = 'active';
      await user.save();

      const payload: Session = {
        email: decoded.email,
        id: decoded?.id,
        userName: decoded.userName,
        user,
      };

      const { accessToken, refreshToken } =
        this.createAccessAndRefreshToken(payload);

      await this.saveTokensToMemory(
        decoded?.id,
        accessToken as string,
        refreshToken as string,
      );
      await this.cacheManager.del(`${id}_email_token`);

      return {
        accessToken,
        refreshToken,
        user: payload,
      };
    } catch (error: any) {
      console.log(error.message);
      throw new InternalServerErrorException('Unable to activate the user', {
        cause: new Error(),
        description: error.message,
      });
    }
  }

  async refresh(createUserRefreshDto: CreateUserRefreshDto) {
    try {
      const { refreshToken } = createUserRefreshDto;

      const decoded = await this.jwtService.verify(refreshToken, {
        secret: jwtConfig.secret,
      });

      if (!decoded) {
        throw new UnauthorizedException('Unauthorized Access');
      }

      // Retrieve refresh token from cache
      const refreshTokenFromCache = await this.cacheManager.get(
        `${decoded.id}_refresh_token`,
      );

      if (!refreshTokenFromCache) {
        throw new UnauthorizedException('Unauthorized Access');
      }

      if (refreshToken !== refreshTokenFromCache) {
        throw new UnauthorizedException('Unauthorized Access');
      }

      const cachedTokenDecoded = await this.jwtService.verify(
        refreshTokenFromCache,
        {
          secret: jwtConfig.secret,
        },
      );

      const curDate = Math.floor(Date.now() / 1000);
      const isExpired = cachedTokenDecoded?.exp < curDate;

      if (!cachedTokenDecoded || isExpired) {
        throw new UnauthorizedException('Unauthorized Access');
      }

      const payload: Session = {
        id: cachedTokenDecoded.id,
        userName: cachedTokenDecoded.userName,
        email: cachedTokenDecoded.email,
      };

      // Generate new access and refresh tokens
      const { accessToken, refreshToken: newRefreshToken } =
        this.createAccessAndRefreshToken(payload);

      // Optionally, update the refresh token in cache if you want to keep it fresh
      await this.cacheManager.set(
        `${payload.id}_refresh_token`,
        newRefreshToken,
        604800,
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      throw new InternalServerErrorException('Unable to refresh the token', {
        cause: new Error(),
        description: error.message,
      });
    }
  }

  async logout(req: VerifyRequest) {
    try {
      const user: Session = req.user;

      await this.cacheManager.del(`${user?.id}_access_token`);
      await this.cacheManager.del(`${user.id}_refresh_token`);

      return {
        status: true,
      };
    } catch (error) {
      throw new InternalServerErrorException('Unable to logout', {
        cause: new Error(),
        description: error.message,
      });
    }
  }

  async forgotPassword(
    createUserForgotPasswordDto: CreateUserForgotPasswordDto,
  ) {
    try {
      const { email } = createUserForgotPasswordDto;

      // Find the user by email
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        throw new NotFoundException('User with this email does not exist.');
      }

      if (user?.status !== 'active') {
        throw new BadRequestException('Account not activated!');
      }

      // Create a JWT token for resetting the password
      const payload = { id: user._id.toString(), email: user.email };
      const token = this.jwtService.sign(payload, { expiresIn: '1h' });

      // Store the token in cache
      await this.cacheManager.set(
        `${user._id.toString()}_reset_password_token`,
        token,
        this.hourExpire,
      );

      // Construct the password reset link
      const resetPasswordLink = `${process.env.ORIGIN_URL}/reset-password?token=${token}`;

      // Send the reset link via email
      await this.sendMail(
        `Please use the following link to reset your password: ${resetPasswordLink}`,
        email,
        'Reset Password Code',
      );

      return {
        status: true,
        message: 'Password reset link sent to your email address',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.message || 'Unable to process password reset request',
      );
    }
  }

  async resetPassword(createUserResetPasswordDto: CreateUserResetPasswordDto) {
    try {
      const { token, newPassword } = createUserResetPasswordDto;

      // Verify the JWT token
      const decoded = await this.jwtService.verify(token, {
        secret: jwtConfig.secret,
      });

      // Retrieve the token from cache and compare
      const tokenFromCache = await this.cacheManager.get(
        `${decoded.id}_reset_password_token`,
      );

      if (!tokenFromCache || tokenFromCache !== token) {
        throw new BadRequestException('Invalid or expired token.');
      }

      // Find the user by ID
      const user = await this.userModel.findById(decoded.id).exec();

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and save
      user.password = hashedPassword;
      await user.save();

      // Remove the reset token from cache
      await this.cacheManager.del(`${decoded.id}_reset_password_token`);

      return { status: true, message: 'Password has been successfully reset' };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error.message || 'Unable to reset password',
      );
    }
  }
}
