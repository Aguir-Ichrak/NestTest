import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './CreateBlog.dto';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {}
