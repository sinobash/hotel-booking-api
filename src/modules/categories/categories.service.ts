import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateCategoryDto, DetailCategoryResDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { EntityCondition } from '@common/types/entity-condition.type';
import { NullableType } from '@common/types/nullable.type';
import { createSlug } from '@common/utils/app.helper';
import { ActivationEnum } from '../../common/enums/status.enum';
import { ImageFileDTO } from '@modules/files/dto/upload-file.dto';
import { ConfigService } from '@nestjs/config';
import { FilesService } from '@modules/files/files.service';
import { generateUUID } from '@common/utils/crypt.helper';
import { UPLOAD_GROUP } from '@common/constants/app.constants';
import AppError from '@common/errors/app.error';

@Injectable()
export class CategoriesService {
    private readonly className: string = 'category';
    constructor(
        private readonly logger: Logger,
        private readonly configService: ConfigService,
        @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
        private readonly filesService: FilesService,
    ) {}

    async create(payload: CreateCategoryDto, filePayload: ImageFileDTO): Promise<DetailCategoryResDto> {
        const filePath = `assets/${UPLOAD_GROUP.MEDIA}/${generateUUID()}-${filePayload.originalname}`;
        await this.filesService.uploadToS3(filePayload.buffer, filePath, filePayload.mimetype);
        const fileUrl = await this.filesService.createFileLink(filePath);

        const category = await this.categoryRepository.save(
            this.categoryRepository.create({
                name: payload.name,
                description: payload.description,
                slug: createSlug(payload.name),
                url: fileUrl,
                key: filePath,
                isActive: ActivationEnum.ACTIVE,
            }),
        );
        this.logger.log(`category ${category.name} created successfully`);
        return await this.findDetailById(category.id);
    }

    async findAll(): Promise<DetailCategoryResDto[]> {
        const datas = await this.categoryRepository.find();
        if (!datas) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        const categoryList = await Promise.all(
            datas
                ? datas.map(async (d: Category) => {
                      const fileLink = d.url ? await this.filesService.getFileLinkByUrl(d.url) : null;
                      return {
                          categoryId: d.id,
                          categoryName: d.name,
                          categorySlug: d.slug,
                          categoryDesc: d.description,
                          categoryUrl: fileLink,
                          categoryActive: d.isActive,
                      };
                  })
                : [],
        );
        return categoryList;
    }

    async findOne(fields: EntityCondition<Category>): Promise<NullableType<Category>> {
        const data = await this.categoryRepository.findOne({
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
        return data;
    }

    async findById(id: number): Promise<NullableType<Category>> {
        const queryBuilder = this.categoryRepository.createQueryBuilder('category');
        const data = await queryBuilder
            .select(['category.id', 'category.name', 'category.slug', 'category.description', 'category.isActive'])
            .where('category.id =:id', { id: id })
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

    async findDetailById(categoryId: number): Promise<DetailCategoryResDto> {
        const queryBuilder = this.categoryRepository.createQueryBuilder('category');
        const data = await queryBuilder
            .select([
                'category.id',
                'category.name',
                'category.slug',
                'category.description',
                'category.url',
                'category.key',
                'category.isActive',
            ])
            .where('category.id =:id', { id: categoryId })
            .getOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${categoryId}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        const fileLink = data.url ? await this.filesService.getFileLinkByUrl(data.url) : null;
        return {
            categoryId: data.id,
            categoryName: data.name,
            categorySlug: data.slug,
            categoryDesc: data.description,
            categoryUrl: fileLink,
            categoryActive: data.isActive,
        };
    }

    async update(id: number, payload: UpdateCategoryDto, filePayload?: ImageFileDTO): Promise<DetailCategoryResDto> {
        try {
            const category = await this.categoryRepository.findOneBy({ id: id });
            if (!category) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${id}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            let filePath = null;
            let fileUrl = null;

            if (filePayload) {
                filePath = `assets/${UPLOAD_GROUP.MEDIA}/${generateUUID()}-${filePayload.originalname}`;
                await this.filesService.uploadToS3(filePayload.buffer, filePath, filePayload.mimetype);
                fileUrl = await this.filesService.createFileLink(filePath);

                category.name = payload.name;
                category.slug = createSlug(payload.name);
                category.description = payload.description;
                category.url = fileUrl;
                category.key = filePath;
            } else {
                category.name = payload.name;
                category.slug = createSlug(payload.name);
                category.description = payload.description;
            }
            await category.save();
            this.logger.log(`category ${category.name} updated successfully`);
            return await this.findDetailById(category.id);
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
        const deleteResponse = await this.categoryRepository.softDelete(id);
        if (!deleteResponse.affected) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${id}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        this.logger.log(`category deleted successfully`);
        return 1;
    }
}
