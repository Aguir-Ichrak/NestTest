import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../src/global.const';

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should successfully register a new user', async () => {
    const registerDto = {
      username: 'testuser',
      password: 'password123',
      email: 'testuser797@example.com',
      role: Role.ADMIN,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);

    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(
      expect.objectContaining({
        msg: 'User created successfully!',
      }),
    );
  });

  it('should throw an error if email already exists', async () => {
    const registerDto = {
      username: 'testuser',
      password: 'password123',
      email: 'testuser10@example.com',
      role: Role.ADMIN,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body.message).toContain('Email already in use');
  });

  it('should successfully login an existing user and return a JWT token', async () => {
    const loginDto = {
      email: 'testuser10@example.com',
      password: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
      }),
    );
  });

  it('should throw an error if login fails due to incorrect credentials', async () => {
    const loginDto = {
      email: 'testuser10@example.com',
      password: 'wrongpassword',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto);

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(response.body.message).toContain('Invalid Password');
  });
});
