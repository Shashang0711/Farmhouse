import { Role } from '../../common/roles.enum';

export class UpdateUserDto {
  name?: string;
  password?: string;
  role?: Role;
}

