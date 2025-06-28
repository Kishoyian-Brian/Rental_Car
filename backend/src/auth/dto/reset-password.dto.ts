export class RequestPasswordResetDto {
    email: string;
  }
  
  export class ResetPasswordDto {
    token: string;
    password: string;
  }
  