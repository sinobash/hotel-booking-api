import { IsNotEmpty } from 'class-validator';

export class CreateFacilityDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    icon: string;
}
