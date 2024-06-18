import { IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
    @IsNotEmpty()
    notificationType: string;

    @IsNotEmpty()
    senderType: string;

    @IsNotEmpty()
    senderKey: string;

    @IsNotEmpty()
    receiverType: string;

    @IsNotEmpty()
    receiverKey: string;

    @IsNotEmpty()
    data: any;
}
