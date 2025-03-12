/* eslint-disable prettier/prettier */
import { User } from 'src/schemas/user.schema';

export interface Payload {
  _id: string;
  email: string;
  displayName: string;
}

export interface Session {
  id: string;
  email: string;
  userName: string;
  user?: User;
}

export interface AuthenticateRequest extends Request {
  path: any;
  user: { id: string };
}