import {
    Controller,
    UseGuards,
    Get,
    HttpCode,
    HttpStatus,
    Body,
    Post,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    FileTypeValidator,
    MaxFileSizeValidator,
    Delete,
} from '@nestjs/common';
import { GuestsService } from './guests.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Guest } from './entities/guest.entity';
import { ResponseResultType } from '@common/types/response-result.type';
import { ChangeGuestNameDto, ChangeGuestPasswordDto, SetupGuestPasswordDto } from './dto/update-guest.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileDTO } from '@modules/files/dto/upload-file.dto';
import { CRUD_MESSAGES, UPLOAD_GROUP } from '@common/constants/app.constants';
import { CurrentGuest } from '@common/decorators/guest.decorator';
import { UserData } from '@common/interfaces/user-data.interface';
import AppError from '@common/errors/app.error';

/**
 * Guest side guest controller
 */
@UseGuards(JwtAuthGuard)
@Controller({
    path: 'guests',
})
export class GuestsController {
    /**
     * @ignore
     */
    constructor(private readonly guestsService: GuestsService) {}

    @Get('/me')
    @HttpCode(HttpStatus.OK)
    async getByid(@CurrentGuest() principal: UserData): Promise<ResponseResultType<any>> {
        const result = await this.guestsService.findDetailById(principal.key);
        const message = `guest has been found`;
        return { message: message, data: result };
    }

    @Post('/setup-password')
    @HttpCode(HttpStatus.OK)
    async setupPassword(
        @CurrentGuest() principal: UserData,
        @Body() payload: SetupGuestPasswordDto,
    ): Promise<ResponseResultType<Guest>> {
        payload.userName = principal.sub;
        const result = await this.guestsService.setupPassword(payload);
        const message = `Setup password successful`;
        return { message: message, data: result };
    }

    @Post('/change-password')
    @HttpCode(HttpStatus.OK)
    async updatePassword(
        @CurrentGuest() principal: UserData,
        @Body() payload: ChangeGuestPasswordDto,
    ): Promise<ResponseResultType<Guest>> {
        payload.userName = principal.sub;
        const result = await this.guestsService.updatePassword(payload);
        const message = `Update password successful`;
        return { message: message, data: result };
    }

    @Post('/change-name')
    @HttpCode(HttpStatus.OK)
    async updateName(
        @CurrentGuest() principal: UserData,
        @Body() payload: ChangeGuestNameDto,
    ): Promise<ResponseResultType<Guest>> {
        payload.userName = principal.sub;
        const result = await this.guestsService.updateFullName(payload);
        const message = `Update name successful`;
        return { message: message, data: result };
    }

    @Post('/upload-avatar')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file', { limits: { files: 1 } }))
    async addAvatar(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                ],
            }),
        )
        file: ImageFileDTO,
        @CurrentGuest() principal: UserData,
    ): Promise<any> {
        const result = await this.guestsService.addAvatar(UPLOAD_GROUP.AVATARS, file, principal.key);
        const message = `Success uploading avatar`;
        return { message: message, data: result };
    }

    @Delete('/remove-avatar')
    @HttpCode(HttpStatus.OK)
    async removeAvatar(@CurrentGuest() principal: UserData): Promise<any> {
        const isDeleted = await this.guestsService.deleteAvatar(principal.key);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }

    @Post('/upload-document')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file', { limits: { files: 1 } }))
    async uploadDocument(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                ],
            }),
        )
        file: ImageFileDTO,
        @CurrentGuest() principal: UserData,
    ): Promise<any> {
        const result = await this.guestsService.uploadDocument(UPLOAD_GROUP.DOCUMENTS, file, principal.key);
        const message = CRUD_MESSAGES.DATA_CREATED;
        return { message: message, data: result };
    }

    @Get('/files/guest')
    @HttpCode(HttpStatus.OK)
    async findDocumentsByGuestId(@CurrentGuest() principal: UserData): Promise<any> {
        const result = await this.guestsService.findDocumentsByGuestId(principal.key);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Get('/file')
    @HttpCode(HttpStatus.OK)
    async findDocumentById(@CurrentGuest() principal: UserData): Promise<any> {
        const guest = await this.guestsService.findOne({ id: principal.key });
        if (!guest.document) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The guest document data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        const result = await this.guestsService.findDocumentById(guest.document.id);
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Delete('/file')
    @HttpCode(HttpStatus.OK)
    async removeDocument(@CurrentGuest() principal: UserData): Promise<any> {
        const guest = await this.guestsService.findOne({ id: principal.key });
        const isDeleted = await this.guestsService.deleteFile(guest.document.id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }
}
