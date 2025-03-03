export interface AuthenticateRequest extends Request {
  user: { id: string };
}
