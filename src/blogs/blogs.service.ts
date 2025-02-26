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

  async getBlogs(search?: string, page: number = 1, limit: number = 9) {
    try {
      const searchQuery = search
        ? { title: { $regex: search, $options: 'i' } }
        : {};
      const skip = (page - 1) * limit;

      const blogs = await this.blogModel
        .find(searchQuery)
        .skip(skip)
        .limit(limit)
        .exec();
      const totalBlogs = await this.blogModel.countDocuments(searchQuery);

      return {
        blogs,
        totalBlogs,
        totalPages: Math.ceil(totalBlogs / limit),
        currentPage: page,
      };
    } catch (error) {
      throw new Error('Server Error');
    }
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
