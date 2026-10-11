import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateRoleCapabilitiesDto, CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { EntityCondition } from '@common/types/entity-condition.type';
import { NullableType } from '@common/types/nullable.type';
import { RolePermissionsResDto } from './dto/role-permissions.dto';
import { validCapabilityKeys } from '@common/constants/role.constants';
import { checkObjectKeys } from '@common/utils/app.helper';
import AppError from '@common/errors/app.error';

@Injectable()
export class RolesService {
    private readonly className: string = 'role';
    constructor(
        @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
        private readonly logger: Logger,
    ) {}

    async create(payload: CreateRoleDto): Promise<Role> {
        const role = await this.rolesRepository.save(
            this.rolesRepository.create({
                ...payload,
            }),
        );
        this.logger.log(`role ${role.name} created successfully`);
        return await this.findById(role.id);
    }

    async findAll(): Promise<Role[]> {
        return await this.rolesRepository.find({
            select: ['alias', 'name', 'description'],
        });
    }

    async findOne(fields: EntityCondition<Role>): Promise<NullableType<Role>> {
        const data = await this.rolesRepository.findOne({
            where: fields,
            withDeleted: false,
        });
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        return await this.findById(data.id);
    }

    async findById(id: number): Promise<NullableType<Role>> {
        const queryBuilder = this.rolesRepository.createQueryBuilder('role');
        const data = await queryBuilder
            .select(['role.id', 'role.alias', 'role.name', 'role.description'])
            .where('role.id =:id', { id: id })
            .getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        return data;
    }

    async update(id: number, payload: UpdateRoleDto): Promise<Role> {
        try {
            const role = await this.rolesRepository.preload({
                id: id,
                ...payload,
            });
            if (!role) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${id}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            await this.rolesRepository.save(role);
            this.logger.log(`role ${role.name} updated successfully`);
            return await this.findById(role.id);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async softDelete(id: number): Promise<number> {
        const deleteResponse = await this.rolesRepository.softDelete(id);
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        this.logger.log(`role deleted successfully`);
        return 1;
    }

    async updatePermission(id: number, payload: CreateRoleCapabilitiesDto): Promise<Role> {
        try {
            const role = await this.findOne({ id: id });

            role.capabilities = payload.roleCapabilities;
            await role.save();
            this.logger.log(`role ${role.name} updated successfully`);
            return await this.findById(role.id);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async findPermissionById(id: number): Promise<NullableType<Role>> {
        const queryBuilder = this.rolesRepository.createQueryBuilder('role');
        const data = await queryBuilder
            .select(['role.id', 'role.alias', 'role.capabilities'])
            .where('role.id =:id', { id: id })
            .getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} permission data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        return data;
    }

    async findPermissionByAlias(alias: string): Promise<NullableType<Role>> {
        const queryBuilder = this.rolesRepository.createQueryBuilder('role');
        const data = await queryBuilder
            .select(['role.id', 'role.alias', 'role.capabilities'])
            .where('role.alias =:alias', { alias: alias.toUpperCase() })
            .getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} permission data with parameter {${alias}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        return data;
    }

    async findPermissions(): Promise<RolePermissionsResDto> {
        const roles = await this.rolesRepository.find({
            select: ['capabilities'],
        });

        let permissions: RolePermissionsResDto = {};
        roles.forEach((r: Role) => {
            if (checkObjectKeys(r.capabilities, validCapabilityKeys)) {
                permissions = { ...r.capabilities };
            }
        });
        return permissions;
    }
}
