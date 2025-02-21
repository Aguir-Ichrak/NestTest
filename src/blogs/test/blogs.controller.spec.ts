import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from '../blogs.controller';
import { BlogsService } from '../blogs.service';
import { Types } from 'mongoose';
import { CreateBlogDto } from '../dtos/CreateBlog.dto';
import { Category } from 'src/global.const';
import { mockRequest } from 'mock-req-res';

describe('BlogsController', () => {
  let blogController: BlogsController;
  let blogService: BlogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: {
            createBlog: jest.fn(),
            getsBlogs: jest.fn(),
            getBlogById: jest.fn(),
            updateBlog: jest.fn(),
            deleteBlog: jest.fn(),
          },
        },
      ],
    }).compile();

    blogController = module.get<BlogsController>(BlogsController);
    blogService = module.get<BlogsService>(BlogsService);
  });

  it('should be defined', () => {
    expect(blogController).toBeDefined();
  });

  describe('createBlog', () => {
    it('should successfully create a blog', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'This is a test blog.',
        category: Category.IT,
        userId: '123',
      };
      const result = { message: 'Blog created successfully' };

      blogService.createBlog = jest.fn().mockResolvedValue(result);
      const req = mockRequest({
        user: { _doc: { _id: '123' } },
      });
      const file = { filename: 'test-image.jpg' } as Express.Multer.File;
      const response = await blogController.createBlog(
        createBlogDto,
        file,
        req,
      );
      expect(blogService.createBlog).toHaveBeenCalledWith(createBlogDto, '123');
      expect(response).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return a list of blogs', async () => {
      const blogs = [
        { title: 'Blog 1', content: 'Content 1' },
        { title: 'Blog 2', content: 'Content 2' },
      ];

      blogService.getsBlogs = jest.fn().mockResolvedValue(blogs);
      await blogController.getBlogs();
      expect(blogService.getsBlogs).toHaveBeenCalled();
    });

    describe('findOne', () => {
      it('should return a single blog by id', async () => {
        const blog = { title: 'Test Blog', content: 'This is a test blog.' };
        const id = new Types.ObjectId().toString();
        blogService.getBlogById = jest.fn().mockResolvedValue(blog);
        await blogController.getBlogByUser(id);
        expect(blogService.getBlogById).toHaveBeenCalledWith(id);
      });
    });

    describe('update', () => {
      it('should update a blog', async () => {
        const id = new Types.ObjectId().toString();
        const updateBlogDto = {
          title: 'Updated Blog',
          content: 'Updated content.',
        };
        const updatedBlog = {
          title: 'Updated Blog',
          content: 'Updated content.',
        };
        blogService.updateBlog = jest.fn().mockResolvedValue(updatedBlog);
        await blogController.updateBlog(id, updateBlogDto);
        expect(blogService.updateBlog).toHaveBeenCalledWith(id, updateBlogDto);
      });
    });

    describe('remove', () => {
      it('should remove a blog', async () => {
        const id = new Types.ObjectId().toString();
        const result = { message: 'Blog deleted successfully' };
        blogService.deleteBlog = jest.fn().mockResolvedValue(result);
        await blogController.deleteBlog(id);
        expect(blogService.deleteBlog).toHaveBeenCalledWith(id);
      });
    });
  });
});
