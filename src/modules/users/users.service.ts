import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RolesService } from '@modules/roles/roles.service';
import { EntityCondition } from '@common/types/entity-condition.type';
import { NullableType } from '@common/types/nullable.type';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { HotelsService } from '@modules/hotels/hotels.service';
import { FilesService } from '@modules/files/files.service';
import { ImageFileDTO } from '@modules/files/dto/upload-file.dto';
import { ActivationEnum } from '@common/enums/status.enum';
import { CreateAccountDto } from './dto/create-account.dto';
import AppError from '@common/errors/app.error';

@Injectable()
export class UsersService {
    private readonly className: string = 'user';
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        private readonly logger: Logger,
        private readonly configService: ConfigService,
        private readonly rolesService: RolesService,
        private readonly hotelsService: HotelsService,
        private readonly filesService: FilesService,
    ) {}

    async create(payload: CreateUserDto): Promise<User> {
        const role = await this.rolesService.findOne({ alias: payload.roleAlias });
        let hotel = null;
        if (payload.hotelId > 0) {
            hotel = await this.hotelsService.findOne({ id: payload.hotelId });
        }
        const user = await this.usersRepository.save(
            this.usersRepository.create({
                ...payload,
                username: payload.email,
                codeWord: payload.password,
                codeHash: null,
                isActive: ActivationEnum.ACTIVE,
                role: role,
                hotel: hotel,
            }),
        );
        this.logger.log(`user ${user.fullName} created successfully`);
        return this.findDetailById(user.id);
    }

    async createAccount(payload: CreateAccountDto): Promise<User> {
        let hotel = null;
        if (payload.hotelId > 0) {
            hotel = await this.hotelsService.findOne({ id: payload.hotelId });
        }
        const user = await this.usersRepository.save(
            this.usersRepository.create({
                ...payload,
                username: payload.email,
                codeWord: payload.password,
                codeHash: null,
                isActive: ActivationEnum.INACTIVE,
                role: null,
                hotel: hotel,
            }),
        );
        this.logger.log(`user ${user.fullName} created successfully`);
        return this.findDetailById(user.id);
    }

    async findAllBy(pageOptionsDto: PageOptionsDto, searchDto?: SearchUserDto): Promise<PageDto<User>> {
        const queryBuilder = this.usersRepository.createQueryBuilder('user');
        queryBuilder.leftJoinAndSelect('user.role', 'role').where('user.deletedAt IS NULL');

        if (searchDto.email) {
            queryBuilder.andWhere('user.email =:email', { email: searchDto.email });
        }
        if (searchDto.fullName) {
            queryBuilder.andWhere('user.fullName like :fullName', { fullName: `%${searchDto.fullName}%` });
        }

        queryBuilder
            .orderBy('user.createdAt', pageOptionsDto.order)
            .skip(pageOptionsDto.skip)
            .take(pageOptionsDto.take);

        const total = await queryBuilder.getCount();
        const { entities } = await queryBuilder.getRawAndEntities();

        const pageMetaDto = new PageMetaDto({ pageOptionsDto, total });

        const pageCount = pageMetaDto.pageCount;

        if (pageCount >= pageMetaDto.page) {
            return new PageDto(entities, pageMetaDto);
        } else {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
    }

    async findUsername(fields: EntityCondition<User>): Promise<NullableType<User>> {
        const data = await this.usersRepository.findOne({
            where: fields,
            withDeleted: false,
            relations: {
                role: true,
                hotel: true,
                avatar: true,
            },
        });
        return data;
    }

    async findOne(fields: EntityCondition<User>): Promise<NullableType<User>> {
        const data = await this.usersRepository.findOne({
            where: fields,
            withDeleted: false,
            relations: {
                role: true,
                hotel: true,
                avatar: true,
            },
        });
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        return data;
    }

    async findById(id: number): Promise<NullableType<User>> {
        const queryBuilder = this.usersRepository.createQueryBuilder('user');
        const data = await queryBuilder
            .select([
                'user.id',
                'user.username',
                'user.email',
                'user.fullName',
                'user.phoneNumber',
                'user.gender',
                'user.isActive',
                'role.name',
                'hotel.code',
                'hotel.name',
                'avatar.url',
            ])
            .innerJoinAndSelect('user.role', 'role')
            .leftJoin('user.hotel', 'hotel')
            .leftJoin('user.avatar', 'avatar')
            .where('user.id =:id', { id: id })
            .getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        return data;
    }

    async findDetailById(id: number): Promise<any> {
        const queryBuilder = this.usersRepository.createQueryBuilder('user');
        const data = await queryBuilder
            .select([
                'user.id',
                'user.username',
                'user.email',
                'user.fullName',
                'user.phoneNumber',
                'user.gender',
                'user.isActive',
                'role.name',
                'hotel.code',
                'hotel.name',
                'avatar.url',
            ])
            .innerJoinAndSelect('user.role', 'role')
            .leftJoin('user.hotel', 'hotel')
            .leftJoin('user.avatar', 'avatar')
            .where('user.id =:id', { id: id })
            .getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }

        const userAvatar = data.avatar ? await this.filesService.getFileLinkByUrl(data.avatar.url) : null;

        return {
            userId: data.id,
            userName: data.username,
            userEmail: data.email,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            userGender: data.gender,
            userActive: data.isActive,
            hotel: data.hotel,
            avatarUrl: userAvatar,
        };
    }

    async update(id: number, payload: UpdateUserDto): Promise<User> {
        try {
            const user = await this.usersRepository.preload({
                id: id,
                ...payload,
            });
            if (!user) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with criteria cannot be found`,
                    AppError.errors.DATA_NOT_FOUND,
                );
            }
            await this.usersRepository.save(user);
            this.logger.log(`user ${user.fullName} updated successfully`);
            return await this.findDetailById(user.id);
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
        if (id === Number(this.configService.get('app.rootKey'))) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        const deleteResponse = await this.usersRepository.softDelete(id);
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        this.logger.log(`user deleted successfully`);
        return 1;
    }

    async updateLastLogin(user: User): Promise<number> {
        let result = 0;
        try {
            user.lastLogin = new Date();
            await user.save();
            result = 1;
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
        return result;
    }

    async confirmEmail(hash: string): Promise<void> {
        const user = await this.findOne({
            codeHash: hash,
            isActive: ActivationEnum.INACTIVE,
        });

        user.codeHash = null;
        user.isActive = ActivationEnum.ACTIVE;
        await user.save();
    }

    async updateStatus(id: number, status: keyof typeof ActivationEnum): Promise<void> {
        try {
            const user = await this.findOne({
                id,
            });

            user.isActive = ActivationEnum[status];
            await user.save();
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async assignToHotel(id: number, hotelId: number): Promise<void> {
        try {
            const user = await this.findOne({
                id,
                isActive: ActivationEnum.ACTIVE,
            });
            const hotel = await this.hotelsService.findOne({ id: hotelId });

            user.hotel = hotel;
            await user.save();
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async addAvatar(fileGroup: string, payload: ImageFileDTO, userId: number): Promise<User> {
        let avatar = null;
        try {
            avatar = await this.filesService.uploadMediaFile(fileGroup, payload);
            const user = await this.findOne({
                id: userId,
                isActive: ActivationEnum.ACTIVE,
            });
            user.avatar = avatar;
            await user.save();
            return await this.findDetailById(userId);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async deleteAvatar(userId: number): Promise<number> {
        const user = await this.findOne({
            id: userId,
            isActive: ActivationEnum.ACTIVE,
        });
        const fileId = user.avatar?.id;
        if (fileId) {
            const isDeleted = await this.filesService.deleteFile(fileId);
            if (isDeleted === 1) {
                user.avatar = null;
                await user.save();
                return 1;
            }
        }
        return 0;
    }

    async assignRole(username: string, hotelId: number, roleAlias: string): Promise<void> {
        try {
            if (hotelId > 0) {
                const user = await this.findOne({
                    username: username,
                    hotel: {
                        id: hotelId,
                    },
                });
                const role = await this.rolesService.findOne({ alias: roleAlias });

                user.role = role;
                await user.save();
            }
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }
}
