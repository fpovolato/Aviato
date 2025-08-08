export interface User {
  _id: string;
  name: string;
  surname: string;
  email: string;
  birthDate: string;
  roles: string[];
  airlines: { _id: string; name: string; code: string }[];
  passwordMustChange?: boolean;
}