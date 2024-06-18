import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Guest } from './entities/guest.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGuestDto } from './dto/create-guest.dto';
import { NullableType } from '@common/types/nullable.type';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { EntityCondition } from '@common/types/entity-condition.type';
import { SearchGuestDto } from './dto/search-guest.dto';
import {
    ChangeGuestNameDto,
    ChangeGuestPasswordDto,
    SetupGuestPasswordDto,
    UpdateGuestDto,
} from './dto/update-guest.dto';
import { doCompare, doHash, generateUUID } from '@common/utils/crypt.helper';
import { FilesService } from '@modules/files/files.service';
import { ImageFileDTO } from '@modules/files/dto/upload-file.dto';
import { GuestDocument } from './entities/guest-documents.entity';
import { ActivationEnum, VerificationEnum } from '@common/enums/status.enum';
import AppError from '@common/errors/app.error';
import UserError from '@common/errors/user.error';

@Injectable()
export class GuestsService {
    private readonly className: string = 'guest';
    constructor(
        @InjectRepository(Guest) private guestsRepository: Repository<Guest>,
        @InjectRepository(GuestDocument) private readonly guestDocumentsRepository: Repository<GuestDocument>,
        private readonly logger: Logger,
        private readonly filesService: FilesService,
    ) {}

    async create(payload: CreateGuestDto): Promise<Guest> {
        try {
            const guest = await this.guestsRepository.save(
                this.guestsRepository.create({
                    ...payload,
                    isVerified: VerificationEnum.UNVERIFIED,
                    isActive: ActivationEnum.ACTIVE,
                }),
            );
            this.logger.log(`guest ${guest.fullName} created successfully`);
            return this.findById(guest.id);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async findAllBy(pageOptionsDto: PageOptionsDto, searchDto?: SearchGuestDto): Promise<PageDto<Guest>> {
        const queryBuilder = this.guestsRepository.createQueryBuilder('guest');

        if (searchDto) {
            // search by filter and pagination params
            queryBuilder
                .where('guest.deletedAt IS NULL')
                .andWhere('guest.email =:email', { email: searchDto.email })
                .andWhere('guest.fullName like :fullName', { fullName: `%${searchDto.fullName}%` })
                .orderBy('guest.createdAt', pageOptionsDto.order)
                .skip(pageOptionsDto.skip)
                .take(pageOptionsDto.take);
        } else {
            // search by pagination params only
            queryBuilder
                .where('guest.deletedAt IS NULL')
                .orderBy('guest.createdAt', pageOptionsDto.order)
                .skip(pageOptionsDto.skip)
                .take(pageOptionsDto.take);
        }

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

    async findUsername(fields: EntityCondition<Guest>): Promise<NullableType<Guest>> {
        const data = await this.guestsRepository.findOne({
            where: fields,
            relations: {
                avatar: true,
                document: true,
            },
            withDeleted: false,
        });
        return data;
    }

    async findOne(fields: EntityCondition<Guest>): Promise<NullableType<Guest>> {
        const data = await this.guestsRepository.findOne({
            where: fields,
            relations: {
                avatar: true,
                document: true,
            },
            withDeleted: false,
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

    async findById(id: number): Promise<NullableType<Guest>> {
        const queryBuilder = this.guestsRepository.createQueryBuilder('guest');
        const data = await queryBuilder
            .select([
                'guest.id',
                'guest.username',
                'guest.email',
                'guest.phoneNumber',
                'guest.fullName',
                'guest.isVerified',
                'guest.isActive',
                'avatar.url',
                'document.url',
            ])
            .leftJoin('guest.avatar', 'avatar')
            .leftJoin('guest.document', 'document')
            .where('guest.id =:id', { id: id })
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
        const queryBuilder = this.guestsRepository.createQueryBuilder('guest');
        const data = await queryBuilder
            .select([
                'guest.id',
                'guest.username',
                'guest.email',
                'guest.phoneNumber',
                'guest.fullName',
                'guest.isVerified',
                'guest.isActive',
                'avatar.url',
                'document.url',
            ])
            .leftJoin('guest.avatar', 'avatar')
            .leftJoin('guest.document', 'document')
            .where('guest.id =:id', { id: id })
            .getOne();

        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }

        const [avatarUrl, idCardUrl] = await Promise.all([
            data.avatar ? await this.filesService.getFileLinkByUrl(data.avatar.url) : null,
            data.document ? await this.filesService.getFileLinkByUrl(data.document.url) : null,
        ]);
        return {
            id: data.id,
            userName: data.username,
            email: data.email,
            phoneNumber: data.phoneNumber,
            fullName: data.fullName,
            isActive: data.isActive,
            isVerified: data.isVerified,
            avatarUrl: avatarUrl,
            idCardUrl: idCardUrl,
        };
    }

    async checkEmailExist(email: string): Promise<boolean> {
        return await this.guestsRepository.exist({ where: { email: email } });
    }

    async checkMobileNumberExist(phoneNumber: string): Promise<boolean> {
        return await this.guestsRepository.exist({ where: { phoneNumber: phoneNumber } });
    }

    async update(id: number, payload: UpdateGuestDto): Promise<Guest> {
        try {
            const guest = await this.guestsRepository.preload({
                id: id,
                ...payload,
            });
            if (!guest) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${id}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            await this.guestsRepository.save(guest);
            this.logger.log(`guest ${guest.fullName} updated successfully`);
            return await this.findById(guest.id);
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
        const deleteResponse = await this.guestsRepository.softDelete(id);
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        this.logger.log(`guest deleted successfully`);
        return 1;
    }

    async updateLastLogin(guest: Guest): Promise<number> {
        let result = 0;
        try {
            guest.lastLogin = new Date();
            await guest.save();
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

    async setupPassword(payload: SetupGuestPasswordDto): Promise<Guest> {
        try {
            const guest = await this.findOne({ username: payload.userName });
            if (!guest) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with criteria cannot be found`,
                    AppError.errors.DATA_NOT_FOUND,
                );
            }
            guest.password = await doHash(payload.userPassword);
            guest.isActive = ActivationEnum.ACTIVE;
            await guest.save();
            return this.findById(guest.id);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async updatePassword(payload: ChangeGuestPasswordDto): Promise<Guest> {
        try {
            const guest = await this.findOne({ username: payload.userName, isActive: ActivationEnum.ACTIVE });
            if (!guest) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with criteria cannot be found`,
                    AppError.errors.DATA_NOT_FOUND,
                );
            }

            const isValidPassword = await doCompare(payload.oldPassword, guest.password);

            if (!isValidPassword) {
                throw new UserError(
                    HttpStatus.BAD_REQUEST,
                    `The password is invalid`,
                    UserError.errors.INVALID_PASSWORD,
                );
            }

            guest.password = await doHash(payload.newPassword);
            await guest.save();
            return this.findDetailById(guest.id);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async updateFullName(payload: ChangeGuestNameDto): Promise<Guest> {
        try {
            const guest = await this.findOne({ username: payload.userName, isActive: ActivationEnum.ACTIVE });
            if (!guest) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with criteria cannot be found`,
                    AppError.errors.DATA_NOT_FOUND,
                );
            }

            guest.fullName = payload.fullName;
            await guest.save();
            return this.findDetailById(guest.id);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async addAvatar(fileGroup: string, payload: ImageFileDTO, guestId: number): Promise<Guest> {
        let avatar = null;
        try {
            avatar = await this.filesService.uploadMediaFile(fileGroup, payload);

            const guest = await this.findOne({
                id: guestId,
                isActive: ActivationEnum.ACTIVE,
            });
            guest.avatar = avatar;
            await guest.save();
            return await this.findDetailById(guestId);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async deleteAvatar(guestId: number): Promise<number> {
        const guest = await this.findOne({
            id: guestId,
            isActive: ActivationEnum.ACTIVE,
        });
        const fileId = guest.avatar?.id;
        if (fileId) {
            const isDeleted = await this.filesService.deleteFile(fileId);
            if (isDeleted === 1) {
                guest.avatar = null;
                await guest.save();
                return 1;
            }
        }
        return 0;
    }

    async uploadDocument(fileGroup: string, payload: ImageFileDTO, guestId: number) {
        const guest = await this.findOne({ id: guestId });
        const filePath = `assets/${fileGroup}/${generateUUID()}-${payload.originalname}`;

        if (guest.document) {
            const deleteResponse = await this.guestDocumentsRepository.softDelete(guest.document.id);
            if (deleteResponse.affected) {
                this.logger.log(`soft delete document successfully`);
            }
        }

        await this.filesService.uploadToS3(payload.buffer, filePath, payload.mimetype);
        const fileUrl = await this.filesService.createFileLink(filePath);

        const fileStored = await this.guestDocumentsRepository.save(
            this.guestDocumentsRepository.create({
                name: payload.originalname,
                url: fileUrl,
                key: filePath,
                type: payload.mimetype,
                isVerified: VerificationEnum.UNVERIFIED,
            }),
        );

        guest.document = fileStored; // update guest identity document file
        await guest.save();

        const { id, name, type, isVerified, url, createdAt, updatedAt } = fileStored;
        const fileLink = url ? await this.filesService.getFileLinkByUrl(url) : null;

        return {
            id,
            name,
            type,
            url: fileLink,
            isVerified,
            createdAt,
            updatedAt,
        };
    }

    async findDocumentsByGuestId(guestId: number) {
        const guest = await this.findOne({ id: guestId });
        if (!guest.document) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} document data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        const files = await this.guestDocumentsRepository.find({
            where: { id: guest.document.id },
            withDeleted: false,
        });
        if (!files) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} document data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        return Promise.all(
            files.map(async (file) => {
                const { id, name, type, url, isVerified, createdAt, updatedAt } = file;
                const fileLink = url ? await this.filesService.getFileLinkByUrl(url) : null;
                return {
                    id,
                    name,
                    type,
                    url: fileLink,
                    isVerified,
                    createdAt,
                    updatedAt,
                };
            }),
        );
    }

    async findDocumentById(fileId: number) {
        const fileInfo = await this.guestDocumentsRepository.findOne({ where: { id: fileId }, withDeleted: false });
        if (!fileInfo) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} document data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        const { id, name, type, url, isVerified, createdAt, updatedAt } = fileInfo;
        const fileLink = url ? await this.filesService.getFileLinkByUrl(url) : null;
        return {
            id,
            name,
            type,
            url: fileLink,
            isVerified,
            createdAt,
            updatedAt,
        };
    }

    async verifyDocument(guestId: number, userId: number): Promise<any> {
        const guest = await this.findOne({ id: guestId });
        if (!guest.document) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The guest need to provide identity card`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        const document = await this.guestDocumentsRepository.findOne({
            where: {
                id: guest.document.id,
            },
            withDeleted: false,
        });
        if (!document) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The guest document cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        document.isVerified = VerificationEnum.VERIFIED;
        document.verifiedBy = userId;
        await document.save();

        guest.isVerified = VerificationEnum.VERIFIED;
        await guest.save();

        return this.findDocumentById(document.id);
    }

    async deleteFile(fileId: number): Promise<number> {
        const file = await this.guestDocumentsRepository.findOne({
            where: { id: fileId },
            withDeleted: false,
        });
        if (!file) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} document data with parameter {${fileId}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        const deleteResult = await this.filesService.deleteFromS3(file.key);
        if (deleteResult > 0) {
            const deleteResponse = await this.guestDocumentsRepository.delete(fileId);
            if (!deleteResponse.affected) {
                return 0;
            }
            return 1;
        }
        return 0;
    }
}
