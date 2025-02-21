import { UserDocument } from 'src/users/schemas/user.schema';

declare module 'express' {
  interface Request {
    user?: UserDocument;
  }
}
