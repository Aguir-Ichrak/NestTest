import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from './Blog.schema';
import { CreateBlogDto } from './dtos/CreateBlog.dto';
import { UpdateBlogDto } from './dtos/UpdateBlog.dto';

@Injectable()
export class BlogsService {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async createBlog(createBlogDto: CreateBlogDto, userId: string) {
    const newBlog = new this.blogModel({ ...createBlogDto, userId });
    const savedBlog = await newBlog.save();
    return savedBlog;
  }
  getsBlogs() {
    return this.blogModel.find();
  }

  getBlogById(id: string) {
    return this.blogModel.findById(id);
  }

  updateBlog(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog | null> {
    try {
      return this.blogModel
        .findByIdAndUpdate(id, updateBlogDto, {
          new: true,
          runValidators: true,
        })
        .exec();
    } catch (error) {
      throw new HttpException('Database error', 500);
    }
  }

  deleteBlog(id: string) {
    return this.blogModel.findByIdAndDelete(id);
  }
}
