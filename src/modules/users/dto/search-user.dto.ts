import { IsOptional } from 'class-validator';

export class SearchUserDto {
    @IsOptional()
    email: string;

    @IsOptional()
    fullName: string;
}
