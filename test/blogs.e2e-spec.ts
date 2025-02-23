import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { Category } from '../src/global.const';

describe('BlogsController (E2E)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsiYWN0aXZlUGF0aHMiOnsicGF0aHMiOnsicm9sZSI6ImluaXQiLCJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJ1c2VybmFtZSI6ImluaXQiLCJfaWQiOiJpbml0IiwiX192IjoiaW5pdCJ9LCJzdGF0ZXMiOnsicmVxdWlyZSI6e30sImluaXQiOnsiX2lkIjp0cnVlLCJ1c2VybmFtZSI6dHJ1ZSwiZW1haWwiOnRydWUsInBhc3N3b3JkIjp0cnVlLCJyb2xlIjp0cnVlLCJfX3YiOnRydWV9fX0sInNraXBJZCI6dHJ1ZX0sIiRpc05ldyI6ZmFsc2UsIl9kb2MiOnsiX2lkIjoiNjdiYjRhNDNjODdmOGQ2MzM5NWQ4NmVjIiwidXNlcm5hbWUiOiJpY2hyYWsiLCJlbWFpbCI6ImljaHJhazEyM0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiJDJiJDEwJFQ5OWRzRVVZYXNOMklwdURPaHdyc09YdDZRRUl5TnpaOG1OUHA0VmUvbzR0Nm1yOWFPdkZDIiwicm9sZSI6ImFkbWluIiwiX192IjowfSwiaWF0IjoxNzQwMzI3NTIwLCJleHAiOjE3NDA1MDAzMjB9.3_txMR9XoCjDyWR24acLtiInzUbcctOfDBcT_NdV_C4';

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

  it('should successfully create a blog', async () => {
    const createBlogDto = {
      title: 'My first blog user',
      content: 'This is the blog.',
      category: Category.IT,
    };

    const response = await request(app.getHttpServer())
      .post('/blogs')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('image content'), 'test-image.jpg')
      .field('title', createBlogDto.title)
      .field('content', createBlogDto.content)
      .field('category', createBlogDto.category);

    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Blog created successfully',
        blog: expect.objectContaining({
          _id: expect.any(String),
          title: createBlogDto.title,
          content: createBlogDto.content,
          category: createBlogDto.category,
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          userId: expect.any(String),
        }),
        userId: expect.any(String),
      }),
    );
  });

  it('should get all blogs', async () => {
    const response = await request(app.getHttpServer())
      .get('/blogs')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(HttpStatus.OK);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return blog by id', async () => {
    const createBlogDto = {
      title: 'My first blog user',
      content: 'This is the content.',
      category: Category.IT,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/blogs')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('image content'), 'test-image.jpg')
      .field('title', createBlogDto.title)
      .field('content', createBlogDto.content)
      .field('category', createBlogDto.category);
    const blogId = createResponse.body.blog._id;

    const response = await request(app.getHttpServer())
      .get(`/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        title: createBlogDto.title,
        content: createBlogDto.content,
        category: createBlogDto.category,
      }),
    );
  });

  it('should successfully update a blog', async () => {
    const createBlogDto = {
      title: 'blog_test',
      content: 'blog content',
      category: Category.IT,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/blogs')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('image content'), 'test-image.jpg')
      .field('title', createBlogDto.title)
      .field('content', createBlogDto.content)
      .field('category', createBlogDto.category);
    const blogId = createResponse.body.blog._id;

    const updateBlogDto = {
      title: 'Updated Test Blog',
      content: 'This is an updated test blog.',
      category: Category.Scientific,
    };

    const response = await request(app.getHttpServer())
      .put(`/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateBlogDto);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Blog updated successfully',
        blog: expect.objectContaining({
          _id: expect.any(String),
          title: updateBlogDto.title,
          content: updateBlogDto.content,
          category: updateBlogDto.category,
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          tags: expect.any(Array),
          userId: expect.any(String),
          __v: expect.any(Number),
        }),
      }),
    );
  });

  it('should successfully delete a blog', async () => {
    const createBlogDto = {
      title: 'My first blog user',
      content: 'This is the content.',
      category: Category.IT,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/blogs')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('image content'), 'test-image.jpg')
      .field('title', createBlogDto.title)
      .field('content', createBlogDto.content)
      .field('category', createBlogDto.category);
    const blogId = createResponse.body.blog._id;

    const response = await request(app.getHttpServer())
      .delete(`/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Blog deleted successfully',
      }),
    );
  });
});
