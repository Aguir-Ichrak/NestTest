import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { RegisterDto } from '../dtos/register.dto';
import { Role } from 'src/global.const';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest
              .fn()
              .mockResolvedValue({ accessToken: 'mock-jwt-token' }),
            register: jest
              .fn()
              .mockResolvedValue({ msg: 'User created successfully!' }),
            profile: jest.fn().mockResolvedValue({
              _id: '123',
              username: 'testUser',
              email: 'test@example.com',
              password: 'test123',
              role: Role.ADMIN,
            }),
            emailExists: jest.fn().mockResolvedValue(false),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should return a success message', async () => {
      const registerDto: RegisterDto = {
        username: 'test',
        email: 'test@example.com',
        password: 'password',
        role: Role.ADMIN,
      };
      const result = await authController.register(registerDto);
      expect(result.msg).toBe('User created successfully!');
    });

    it('should throw an error if email already exists', async () => {
      authService.register = jest
        .fn()
        .mockRejectedValue(new Error('Email already exists'));

      const registerDto: RegisterDto = {
        username: 'test',
        email: 'existing@example.com',
        password: 'password',
        role: Role.ADMIN,
      };

      await expect(authController.register(registerDto)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('login', () => {
    it('should return a token on successful login', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const mockToken = { accessToken: 'mock-jwt-token' };

      authService.login = jest.fn().mockResolvedValue(mockToken);

      const result = await authController.login(loginDto);
      expect(result).toEqual(mockToken);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw an error on invalid credentials', async () => {
      authService.login = jest
        .fn()
        .mockRejectedValue(new Error('Invalid credentials'));

      const loginDto = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      await expect(authController.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
