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
} from '@nestjs/common';
import mongoose from 'mongoose';
import { CreateBlogDto } from './dtos/CreateBlog.dto';
import { BlogsService } from './blogs.service';
import { UpdateBlogDto } from './dtos/UpdateBlog.dto';
import { AuthGuard } from 'src/auth/auth.middleware';
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
    if (file) createBlogDto.image = `/uploads/${file.filename}`;
    return this.blogsService.createBlog(createBlogDto, req.user._doc._id);
  }

  @Get()
  getBlogs() {
    return this.blogsService.getsBlogs();
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
  @Patch(':id')
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Invalid ID', 400);
    const updatedBlog = await this.blogsService.updateBlog(id, updateBlogDto);
    if (!updatedBlog) throw new HttpException('Blog Not Found', 404);

    return updatedBlog;
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('Invalid ID', 400);
    const deletedBlog = await this.blogsService.deleteBlog(id);
    if (!deletedBlog) throw new HttpException('Blog Not Found', 404);
    return { message: 'blog deleted successfully' };
  }
}
