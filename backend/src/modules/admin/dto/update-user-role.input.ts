import { Field, ID, InputType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

@InputType()
export class UpdateUserRoleInput {
  @Field(() => ID)
  userId: string;

  @Field(() => Role)
  role: Role;
}
