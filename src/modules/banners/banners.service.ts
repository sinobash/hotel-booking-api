import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateBannerDto, DetailBannerResDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ConfigService } from '@nestjs/config';
import { Banner } from './entities/banner.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateUUID } from '@common/utils/crypt.helper';
import { FilesService } from '@modules/files/files.service';
import { NullableType } from '@common/types/nullable.type';
import { ImageFileDTO } from '@modules/files/dto/upload-file.dto';
import { UPLOAD_GROUP } from '@common/constants/app.constants';
import AppError from '@common/errors/app.error';

@Injectable()
export class BannersService {
    private readonly className: string = 'banner';
    constructor(
        private readonly logger: Logger,
        private readonly configService: ConfigService,
        @InjectRepository(Banner) private bannerRepository: Repository<Banner>,
        private readonly filesService: FilesService,
    ) {}

    async create(payload: CreateBannerDto, filePayload: ImageFileDTO): Promise<DetailBannerResDto> {
        const filePath = `assets/${UPLOAD_GROUP.BANNERS}/${generateUUID()}-${filePayload.originalname}`;
        await this.filesService.uploadToS3(filePayload.buffer, filePath, filePayload.mimetype);
        const fileUrl = await this.filesService.createFileLink(filePath);

        const banner = await this.bannerRepository.save(
            this.bannerRepository.create({
                title: payload.title,
                description: payload.bannerDesc,
                imageUrl: fileUrl,
                imageKey: filePath,
                linkUrl: payload.bannerLink,
                type: payload.bannerType,
            }),
        );
        this.logger.log(`banner ${banner.title} created successfully`);
        return await this.findDetailById(banner.id);
    }

    async findAll(): Promise<DetailBannerResDto[]> {
        const datas = await this.bannerRepository.find();
        if (!datas) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        const bannerList = await Promise.all(
            datas
                ? datas.map(async (data: Banner) => {
                      const fileLink = data.imageUrl ? await this.filesService.getFileLinkByUrl(data.imageUrl) : null;
                      return {
                          bannerId: data.id,
                          bannerTitle: data.title,
                          bannerDesc: data.description,
                          bannerImageUrl: fileLink,
                          bannerLink: data.linkUrl,
                          bannerType: data.type,
                      };
                  })
                : [],
        );
        return bannerList;
    }

    async findById(bannerId: number): Promise<NullableType<Banner>> {
        const queryBuilder = this.bannerRepository.createQueryBuilder('banner');
        const data = await queryBuilder
            .select([
                'banner.id',
                'banner.title',
                'banner.description',
                'banner.imageKey',
                'banner.imageUrl',
                'banner.linkUrl',
                'banner.type',
            ])
            .where('banner.id =:id', { id: bannerId })
            .getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${bannerId}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        return data;
    }

    async findDetailById(bannerId: number): Promise<DetailBannerResDto> {
        const queryBuilder = this.bannerRepository.createQueryBuilder('banner');
        const data = await queryBuilder
            .select([
                'banner.id',
                'banner.title',
                'banner.description',
                'banner.imageKey',
                'banner.imageUrl',
                'banner.linkUrl',
                'banner.type',
            ])
            .where('banner.id =:id', { id: bannerId })
            .getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${bannerId}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        const fileLink = data ? await this.filesService.getFileLinkByUrl(data.imageUrl) : null;
        return {
            bannerId: data.id,
            bannerTitle: data.title,
            bannerDesc: data.description,
            bannerImageUrl: fileLink,
            bannerLink: data.linkUrl,
            bannerType: data.type,
        };
    }

    async update(id: number, payload: UpdateBannerDto, filePayload?: ImageFileDTO): Promise<DetailBannerResDto> {
        try {
            const banner = await this.bannerRepository.findOneBy({ id: id });
            if (!banner) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${id}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            let filePath = null;
            let fileLink = null;

            if (filePayload) {
                filePath = `assets/${UPLOAD_GROUP.MEDIA}/${generateUUID()}-${filePayload.originalname}`;
                await this.filesService.uploadToS3(filePayload.buffer, filePath, filePayload.mimetype);
                fileLink = await this.filesService.createFileLink(filePath);

                banner.title = payload.title;
                banner.description = payload.bannerDesc;
                banner.imageUrl = fileLink;
                banner.imageKey = filePath;
                banner.linkUrl = payload.bannerLink;
                banner.type = payload.bannerType;
            } else {
                banner.title = payload.title;
                banner.description = payload.bannerDesc;
                banner.linkUrl = payload.bannerLink;
                banner.type = payload.bannerType;
            }
            await banner.save();
            this.logger.log(`banner ${banner.title} updated successfully`);
            return await this.findDetailById(banner.id);
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async delete(id: number): Promise<number> {
        const deleteResponse = await this.bannerRepository.delete(id);
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        this.logger.log(`banner deleted successfully`);
        return 1;
    }
}
