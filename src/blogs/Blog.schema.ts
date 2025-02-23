import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Category } from '../global.const';
export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true, Category })
  category: Category;

  @Prop({ required: false })
  image?: string;

  @Prop({ required: true })
  userId: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
