import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './User.schema';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ msg: string }> {
    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
    });
    if (existingUser) throw new BadRequestException('Email already in use');

    const user = new this.userModel(registerDto);
    await user.save();

    return { msg: 'User created successfully!' };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const user = await this.userModel.findOne({ email: loginDto.email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid Password');
    }
    return { token: this.jwtService.sign({ ...user }) };
  }
}
