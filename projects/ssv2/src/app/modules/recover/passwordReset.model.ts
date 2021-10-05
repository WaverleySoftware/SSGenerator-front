export class PasswordResetResponse {
  id?: string;
  userId?: number;
  created?: any;
  expiry?: any;
  uniqueCode?: string;
  message: string;
}
