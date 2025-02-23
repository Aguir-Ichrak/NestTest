import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  Patch,
  Delete,
  UseGuards,
  UploadedFile,
  Req,
  UseInterceptors,
  UnauthorizedException,
  Put,
  HttpStatus,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { CreateBlogDto } from './dtos/CreateBlog.dto';
import { BlogsService } from './blogs.service';
import { UpdateBlogDto } from './dtos/UpdateBlog.dto';
import { AuthGuard } from '../auth/auth.middleware';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';

@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!req.user || !req.user._doc._id) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (file) createBlogDto.image = `/uploads/${file.filename}`;
    const createdBlog = await this.blogsService.createBlog(
      createBlogDto,
      req.user._doc._id,
    );

    return {
      message: 'Blog created successfully',
      blog: createdBlog,
      userId: req.user._doc._id,
    };
  }

  @Get()
  getBlogs() {
    try {
      return this.blogsService.getsBlogs();
    } catch (error) {
      throw new HttpException('Error fetching blogs', 500);
    }
  }

  @Get(':id')
  async getBlogByUser(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Blog not found', 404);
    const findBlog = await this.blogsService.getBlogById(id);
    if (!findBlog) throw new HttpException('Blog not found', 404);
    return findBlog;
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async updateBlog(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const updateBlogDto = req.body;

    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);

    if (file) updateBlogDto.image = `/uploads/${file.filename}`;

    const updatedBlog = await this.blogsService.updateBlog(id, updateBlogDto);
    if (!updatedBlog)
      throw new HttpException('Blog Not Found', HttpStatus.NOT_FOUND);

    return {
      message: 'Blog updated successfully',
      blog: updatedBlog,
    };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Invalid ID', 400);
    const deletedBlog = await this.blogsService.deleteBlog(id);
    if (!deletedBlog) throw new HttpException('Blog Not Found', 404);
    return { message: 'Blog deleted successfully' };
  }
}
