export interface User {

  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  repeated_password?: string;
  tenant: number | null;

  // export function name(params:type) {

  // }
  // constructor(user: any = {}) {
  //   this.id = user.id || '';
  //   this.firstname = user.firstname || '';
  //   this.lastname = user.lastname || '';
  //   this.email = user.email || '';
  //   this.phone = user.phone || '';
  //   this.password = user.password || '';
  //   this.repeated_password = user.repeated_password || '';
  //   this.tenant = user.tenant || null;
  // }
}

export function createUserModel(): User {
  return {

    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    repeated_password: '',
    tenant: null,
  }
}