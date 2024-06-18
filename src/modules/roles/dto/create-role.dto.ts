import { upperCaseTransformer } from '@common/transformers/upper-case.transformer';
import { IsNotExist } from '@common/validators/is-not-exists.validator';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, MinLength, Validate, ValidateNested } from 'class-validator';
import { CapabilityProperties } from '../interfaces/capability-properties.interface';
import { Actions } from '../enums/actions.enum';

export class CreateRoleDto {
    @MinLength(3)
    @Transform(upperCaseTransformer)
    @IsNotEmpty()
    @Validate(IsNotExist, ['Role', 'alias'], {
        message: 'role alias is already exist', // if role alias is already exist then throw error
    })
    alias: string;

    @IsNotEmpty()
    name: string;

    @IsOptional()
    description: string;
}

export class RoleCapabilitiesDto {
    @Transform((params) => (params.value === '' ? null : params.value))
    @IsOptional()
    @IsEnum(Actions, { groups: ['all'] })
    user?: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsOptional()
    @IsEnum(Actions, { groups: ['all'] })
    role?: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    facility: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    feature: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    country: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    currency: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    city: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    banner: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    category: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    hotel: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    roomtype: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    room: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    guest: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    booking: Actions[];

    @Transform((params) => (params.value === '' ? null : params.value))
    @IsNotEmpty()
    @IsEnum(Actions, { groups: ['all'] })
    notification: Actions[];
}

export class CreateRoleCapabilitiesDto {
    @IsNotEmpty()
    roleCapabilities: RoleCapabilitiesDto;
}
