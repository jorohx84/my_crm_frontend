export class User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  repeated_password?: string;
  tenant: string;


  constructor(user: any = {}) {
    this.id = user.id || '';
    this.firstname = user.firstname || '';
    this.lastname = user.lastname || '';
    this.email = user.email || '';
    this.phone = user.phone || '';
    this.password = user.password || '';
    this.repeated_password = user.repeated_password || '';
    this.tenant = user.tenant || null;
  }
}