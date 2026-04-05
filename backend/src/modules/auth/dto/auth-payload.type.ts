import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';

@ObjectType()
export class AuthPayloadType {
  @Field()
  accessToken: string;

  @Field(() => UserType)
  user: UserType;
}
