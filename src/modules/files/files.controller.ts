import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    FileTypeValidator,
    MaxFileSizeValidator,
    ParseFilePipe,
    Get,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { CRUD_MESSAGES, UPLOAD_GROUP } from '@common/constants/app.constants';
import { ImageFileDTO } from './dto/upload-file.dto';

/**
 * file controller
 */
@UseGuards(JwtAuthGuard)
@Controller({
    path: 'files',
})
export class FilesController {
    /**
     * @ignore
     */
    constructor(private readonly filesService: FilesService) {}

    @Post('/upload')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file', { limits: { files: 1 } }))
    async upload(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                ],
            }),
        )
        file: ImageFileDTO,
    ): Promise<any> {
        const result = await this.filesService.uploadMediaFile(UPLOAD_GROUP.MEDIA, file);
        const message = CRUD_MESSAGES.DATA_CREATED;
        return { message: message, data: result };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getFiles(): Promise<any> {
        const result = await this.filesService.getAllFiles();
        const message = CRUD_MESSAGES.DATA_RETRIEVED;
        return { message: message, data: result };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getFile(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const result = await this.filesService.getS3File(id);
        const message = `file with value ${result.name} has been found`;
        return { message: message, data: result };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
        const isDeleted = await this.filesService.deleteFile(id);
        const message = isDeleted === 1 ? CRUD_MESSAGES.DATA_DELETED : CRUD_MESSAGES.DATA_DELETED_FAIL;
        return { message: message };
    }
}
