import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateBookingReqDto, CreateBookingResDto } from './dto/create-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { IsNull, Not, Raw, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HotelsService } from '@modules/hotels/hotels.service';
import { RoomsService } from '@modules/rooms/rooms.service';
import { GuestsService } from '@modules/guests/guests.service';
import { NullableType } from '@common/types/nullable.type';
import { EntityCondition } from '@common/types/entity-condition.type';
import { compareDates, generateBookingCode } from '@common/utils/app.helper';
import { BookedRoom } from './entities/booked-room.entity';
import { SearchBookingDto } from './dto/search-booking.dto';
import { PageOptionsDto } from '@common/dto/page-options.dto';
import { PageDto } from '@common/dto/page.dto';
import { PageMetaDto } from '@common/dto/page-meta.dto';
import { StripeService } from '@modules/stripe/stripe.service';
import { BillingStatus, BookingStatus } from '@common/enums/status.enum';
import { SearchAvailableRoomReqDto } from './dto/search-room.dto.';
import { JwtService } from '@nestjs/jwt';
import { QrResponseType } from '@common/types/qr-response.type';
import { BookingDetailResDto, StaysResDto, VaidateQrTokenDto, ValidateBookingDto } from './dto/booking.dto';
import { QrData } from '@common/interfaces/qr-data.interface';
import { UserData } from '@common/interfaces/user-data.interface';
import ms from 'ms';
import { RedisService } from '@modules/redis/redis.service';
import { QR_BLACKLIST_KEY } from '@common/constants/redis.contant';
import { DateTime } from 'luxon';
import { MailService } from '@modules/mail/mail.service';
import { RoomTypesService } from '@modules/roomtypes/roomtypes.service';
import { BillingsService } from '@modules/billings/billings.service';
import { CreateBillingReqDto } from '@modules/billings/dto/create-billing.dto';
import { BookingCreatedEvent } from '@modules/notifications/events/booking.event';
import { CreateNotificationDto } from '@modules/notifications/dto/create-notification.dto';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { BOOKING_EVENTS } from '@common/constants/event.constants';
import { decimalToString, isDecimal } from '@common/utils/cast.helper';
import BookingError from '@common/errors/booking.error';
import AppError from '@common/errors/app.error';

@Injectable()
export class BookingsService {
    private readonly className: string = 'booking';
    constructor(
        @InjectRepository(Booking) private readonly bookingsRepository: Repository<Booking>,
        @InjectRepository(BookedRoom) private readonly bookedRoomRepository: Repository<BookedRoom>,
        private readonly logger: Logger,
        private readonly configService: ConfigService,
        private readonly hotelsService: HotelsService,
        private readonly roomTypeService: RoomTypesService,
        private readonly roomsService: RoomsService,
        private readonly guestsService: GuestsService,
        private readonly billingsService: BillingsService,
        private readonly stripeService: StripeService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly mailService: MailService,
        private readonly notificationService: NotificationsService,
    ) {}

    async createBilling(payload: CreateBookingReqDto): Promise<CreateBookingResDto> {
        const guest = await this.guestsService.findOne({ id: payload.guestId });
        const roomType = await this.roomTypeService.findHotelById(payload.roomTypeId);
        const bookingCode = generateBookingCode(roomType.hotel.code);
        const roomCount = payload.roomCount;
        const totalPrice = await this.calculatePrice(roomType.id, payload.startDate, payload.endDate, roomCount);
        if (totalPrice <= 0) {
            throw new BookingError(
                HttpStatus.BAD_REQUEST,
                `The booking price is invalid`,
                BookingError.errors.INVALID_BOOKING_PRICE,
            );
        }

        const searchDto: SearchAvailableRoomReqDto = {
            hotelId: roomType.hotel.id,
            startDate: payload.startDate,
            endDate: payload.endDate,
        };
        await this.checkAvailableRooms(searchDto, roomType.id, roomCount);

        const paymentIntent = await this.stripeService.createPayment(
            bookingCode,
            totalPrice,
            this.configService.get<string>('stripe.defaultCurrency'),
        );
        this.logger.debug(`paymentIntent: ${JSON.stringify(paymentIntent)}`);
        const paymentId = String(paymentIntent.id);
        const billingStatus = BillingStatus.UNPAID;

        try {
            const createBillingDto: CreateBillingReqDto = {
                bookingCode: bookingCode,
                startDate: payload.startDate,
                endDate: payload.endDate,
                roomCount: roomCount,
                totalPrice: totalPrice,
                hotelId: roomType.hotel.id,
                roomTypeId: roomType.id,
                guestId: guest.id,
                paymentId: paymentId,
                status: billingStatus,
            };
            await this.billingsService.create(createBillingDto);

            const result: CreateBookingResDto = {
                clientSecret: paymentIntent.client_secret,
                nextAction: paymentIntent.next_action,
            };
            return result;
        } catch (error) {
            this.logger.error(`An unknown ${this.className} exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async createBooking(payloadFromBilling: CreateBillingReqDto): Promise<Booking> {
        try {
            const guest = await this.guestsService.findOne({ id: payloadFromBilling.guestId });
            const roomType = await this.roomTypeService.findHotelById(payloadFromBilling.roomTypeId);
            const bookingCode = payloadFromBilling.bookingCode;
            const roomCount = payloadFromBilling.roomCount;
            const totalPrice = payloadFromBilling.totalPrice;
            const bookingStatus = BookingStatus.BOOKED;

            const booking = await this.bookingsRepository.save(
                this.bookingsRepository.create({
                    code: bookingCode,
                    roomCount: roomCount,
                    totalPrice: totalPrice,
                    startDate: payloadFromBilling.startDate,
                    endDate: payloadFromBilling.endDate,
                    hotel: roomType.hotel,
                    guest: guest,
                    status: bookingStatus,
                }),
            );
            await this.addBookedRoom(booking, roomType.id, roomCount);
            this.logger.log(`booking with code #${bookingCode} created successfully`);

            // store and emit create booking notification
            const bookingCreatedEvent = new BookingCreatedEvent();
            bookingCreatedEvent.roomId = booking.hotel.code;
            bookingCreatedEvent.code = booking.code;
            bookingCreatedEvent.name = booking.guest.fullName;
            bookingCreatedEvent.message = `You received new booking ${booking.code} from ${booking.guest.fullName}`;

            const createNotificationDto: CreateNotificationDto = {
                notificationType: BOOKING_EVENTS.CREATED,
                senderType: 'guest',
                senderKey: booking.guest.username,
                receiverType: 'hotel',
                receiverKey: booking.hotel.code,
                data: bookingCreatedEvent,
            };

            await this.notificationService.toDatabase(createNotificationDto);
            await this.notificationService.handleEmitEvent(createNotificationDto);

            return booking;
        } catch (error) {
            this.logger.error(`An unknown ${this.className} exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    private async calculatePrice(roomTypeId: number, startDate: any, endDate: any, roomCount = 1): Promise<any> {
        const dueDays = DateTime.fromISO(endDate).diff(DateTime.fromISO(startDate), 'days').toObject();
        const duration = Math.round(Math.abs(dueDays.days));
        const roomType = await this.roomTypeService.findById(roomTypeId);
        const totalPrice: number = roomType.price * roomCount * duration;
        return isDecimal(totalPrice) ? decimalToString(totalPrice) : totalPrice;
    }

    private async addBookedRoom(booking: Booking, roomTypeId: number, roomCount = 1): Promise<void> {
        try {
            for (let i = 1; i <= roomCount; i++) {
                const roomType = await this.roomTypeService.findHotelById(roomTypeId);
                const createBookedRoom = {
                    booking: booking,
                    roomType: roomType,
                    currentPrice: roomType.price,
                };
                await this.bookedRoomRepository.save(this.bookedRoomRepository.create(createBookedRoom)); // store booked room entity
                this.logger.log(`booking ${booking.code} room booked successfully`);
            }
        } catch (error) {
            this.logger.error(`An unknown ${this.className} exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async sendEmailAfterBooking(booking: Booking, currencyCode: string): Promise<void> {
        const bookingStatus = booking.status;
        const guestEmail = booking.guest.email;
        const guestName = booking.guest.fullName;
        const code = booking.code;
        // const currency = await this.hotelsService.findCurrencyById(booking.hotel.id);
        // const currencyCode = currency.currency_code;
        // const currencyCode = 'SGD';
        const totalPrice = booking.totalPrice;
        const currentDate = DateTime.now().toFormat('dd MMM yyyy - HH:mm:ss');

        const emailData = {
            to: guestEmail,
            data: {
                fullName: guestName,
                currencyCode: currencyCode.toUpperCase(),
                code: code,
                totalPrice: totalPrice,
                currentDate: currentDate,
            },
        };
        switch (bookingStatus) {
            case BookingStatus.BOOKED: {
                const sendEmailComplete = await this.mailService.bookingComplete(emailData);
                if (!sendEmailComplete.success) {
                    this.logger.error(`Exception from email was thrown: ${sendEmailComplete.message}`);
                    throw new AppError(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        `Exception from email was thrown: ${sendEmailComplete.message}`,
                        AppError.errors.EMAIL_ERROR,
                    );
                }
                break;
            }
            case BookingStatus.CANCELED: {
                const sendEmailCancel = await this.mailService.bookingCancel(emailData);
                if (!sendEmailCancel.success) {
                    this.logger.error(`Exception from email was thrown: ${sendEmailCancel.message}`);
                    throw new AppError(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        `Exception from email was thrown: ${sendEmailCancel.message}`,
                        AppError.errors.EMAIL_ERROR,
                    );
                }
                break;
            }
            default:
                throw new BookingError(
                    HttpStatus.NOT_FOUND,
                    `The booking status is invalid`,
                    BookingError.errors.INVALID_BOOKING_STATUS,
                );
        }
    }

    setBookingStatus(billingStatus: string): string {
        if (billingStatus === BillingStatus.COMPLETED) {
            return BookingStatus.BOOKED;
        } else if (billingStatus === BillingStatus.CANCELED) {
            return BookingStatus.CANCELED;
        } else if (billingStatus === BillingStatus.FAILED) {
            return BookingStatus.CANCELED;
        } else if (billingStatus === BillingStatus.REFUNDED) {
            return BookingStatus.CANCELED;
        } else {
            return BookingStatus.PENDING; // requested or pending
        }
    }

    async delete(id: number): Promise<number> {
        try {
            await this.deleteBookedRooms(id);
            const deleteResponse = await this.bookingsRepository.delete(id);
            if (!deleteResponse.affected) {
                throw new AppError(
                    HttpStatus.NOT_FOUND,
                    `The ${this.className} data with parameter {${id}} cannot be found`,
                    AppError.errors.DATA_KEY_NOT_FOUND,
                );
            }
            this.logger.log(`booking deleted successfully`);
            return 1;
        } catch (error) {
            this.logger.error(`An unknown exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async deleteBookedRooms(bookingId: number): Promise<void> {
        try {
            const queryBuilder = this.bookedRoomRepository.createQueryBuilder('bookedRoom');
            await queryBuilder
                .delete()
                .from(BookedRoom)
                .where('booking_id = :bookingId', { bookingId: bookingId })
                .execute();
            this.logger.log(`booked rooms deleted successfully`);
        } catch (error) {
            this.logger.error(`An unknown ${this.className} exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async findAll(searchDto: SearchBookingDto): Promise<any> {
        const queryBuilder = this.bookingsRepository.createQueryBuilder('booking');
        queryBuilder
            .select([
                'booking.id AS id',
                'booking.code AS bookingcode',
                'booking.roomCount AS roomcount',
                'booking.totalPrice AS totalprice',
                'booking.startDate AS startdate',
                'booking.endDate AS enddate',
                'booking.status AS bookingstatus',
                'booking.createdAt AS createddate',
                'hotel.name AS hotelname',
                'roomType.name AS roomtypename',
                'guest.email AS guestemail',
                'guest.fullName AS guestname',
            ])
            .leftJoin('booking.bookedRooms', 'bookedRooms')
            .leftJoin('booking.hotel', 'hotel')
            .leftJoin('booking.guest', 'guest')
            .leftJoin('bookedRooms.room', 'room')
            .leftJoin('room.roomType', 'roomType');

        if (searchDto.hotelId > 0) {
            queryBuilder.where('hotel.id =:id', { id: searchDto.hotelId });
        } else {
            queryBuilder.where('hotel.id IS NOT NULL');
        }
        if (searchDto.startDate && searchDto.endDate) {
            queryBuilder
                .andWhere('booking.startDate < :endDate', { endDate: searchDto.endDate })
                .andWhere('booking.endDate > :startDate', { startDate: searchDto.startDate });
        }

        return await queryBuilder.getRawMany();
    }

    async findAllBy(
        pageOptionsDto: PageOptionsDto,
        searchDto?: SearchBookingDto,
    ): Promise<PageDto<NullableType<Booking>>> {
        const queryBuilder = this.bookingsRepository.createQueryBuilder('booking');
        queryBuilder
            .select([
                'booking.id',
                'booking.code',
                'room.code',
                'roomType.name',
                'booking.roomCount',
                'booking.totalPrice',
                'booking.startDate',
                'booking.endDate',
                'booking.status',
                'hotel.name',
                'guest.email',
                'guest.fullName',
                'booking.createdAt',
            ])
            .leftJoin('booking.hotel', 'hotel')
            .leftJoin('booking.guest', 'guest')
            .leftJoinAndSelect('booking.bookedRooms', 'bookedRooms')
            .leftJoin('bookedRooms.room', 'room')
            .leftJoin('room.roomType', 'roomType');

        if (searchDto.hotelId > 0) {
            queryBuilder.where('hotel.id =:id', { id: searchDto.hotelId });
        } else {
            queryBuilder.where('hotel.id IS NOT NULL');
        }
        if (searchDto.bookingCode) {
            queryBuilder.andWhere('booking.code =:bookingCode', { bookingCode: searchDto.bookingCode });
        }
        if (searchDto.guestName) {
            queryBuilder.andWhere('LOWER(guest.fullName) like :name', {
                name: `%${searchDto.guestName.toLowerCase()}%`,
            });
        }
        if (searchDto.startDate && searchDto.endDate) {
            queryBuilder
                .andWhere('booking.startDate < :endDate', { endDate: searchDto.endDate })
                .andWhere('booking.endDate > :startDate', { startDate: searchDto.startDate });
        }

        queryBuilder
            .orderBy('booking.createdAt', pageOptionsDto.order)
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

    async findAllByParams(
        pageOptionsDto: PageOptionsDto,
        searchDto?: SearchBookingDto,
    ): Promise<PageDto<NullableType<Booking>>> {
        const queryBuilder = this.bookingsRepository.createQueryBuilder('booking');
        queryBuilder
            .select([
                'booking.id',
                'booking.code',
                'room.code',
                'booking.roomCount',
                'booking.totalPrice',
                'booking.startDate',
                'booking.endDate',
                'booking.status',
                'hotel.name',
                'booking.createdAt',
            ])
            .innerJoinAndSelect('booking.bookedRooms', 'bookedRooms')
            .leftJoinAndSelect('bookedRooms.roomType', 'roomType')
            .leftJoin('bookedRooms.room', 'room')
            .leftJoin('booking.hotel', 'hotel')
            .leftJoin('booking.guest', 'guest');

        if (searchDto.hotelId > 0) {
            queryBuilder.where('hotel.id =:id', { id: searchDto.hotelId });
        } else {
            queryBuilder.where('hotel.id IS NOT NULL');
        }
        if (searchDto.bookingCode) {
            queryBuilder.andWhere('booking.code =:bookingCode', { bookingCode: searchDto.bookingCode });
        }
        if (searchDto.guestName) {
            queryBuilder.andWhere('LOWER(guest.fullName) like :name', {
                name: `%${searchDto.guestName.toLowerCase()}%`,
            });
        }
        if (searchDto.startDate && searchDto.endDate) {
            queryBuilder
                .andWhere('booking.startDate < :endDate', { endDate: searchDto.endDate })
                .andWhere('booking.endDate > :startDate', { startDate: searchDto.startDate });
        }

        queryBuilder
            .orderBy('booking.createdAt', pageOptionsDto.order)
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

    async findAllBooked(
        pageOptionsDto: PageOptionsDto,
        searchDto?: SearchBookingDto,
    ): Promise<PageDto<NullableType<any>>> {
        const queryBuilder = this.bookedRoomRepository.createQueryBuilder('bookedRooms');
        queryBuilder
            .select([
                // 'booking.id',
                'bookedRooms.id AS booked_room_id',
                'booking.code AS booking_code',
                'room.id AS room_id',
                'room.code AS room_code',
                'roomType.id AS room_type_id',
                'roomType.name AS room_type_name',
                'roomType.capacity AS room_type_capacity',
                'booking.roomCount AS room_count',
                'booking.totalPrice AS total_price',
                'booking.startDate AS start_date',
                'booking.endDate AS end_date',
                'booking.status AS booking_status',
                'hotel.name AS hotel_name',
                'guest.email AS guest_email',
                'guest.fullName AS guest_name',
                'guest.phoneNumber AS guest_phone',
                'booking.createdAt AS booking_created_date',
            ])
            .innerJoin('bookedRooms.booking', 'booking')
            .leftJoin('bookedRooms.roomType', 'roomType')
            .leftJoin('bookedRooms.room', 'room')
            .leftJoin('booking.guest', 'guest')
            .leftJoin('booking.hotel', 'hotel');

        if (searchDto.hotelId > 0) {
            queryBuilder.where('hotel.id =:id', { id: searchDto.hotelId });
        } else {
            queryBuilder.where('hotel.id IS NOT NULL');
        }
        if (searchDto.bookingCode) {
            queryBuilder.andWhere('booking.code =:bookingCode', { bookingCode: searchDto.bookingCode });
        }
        if (searchDto.guestName) {
            queryBuilder.andWhere('LOWER(guest.fullName) like :name', {
                name: `%${searchDto.guestName.toLowerCase()}%`,
            });
        }
        if (searchDto.startDate && searchDto.endDate) {
            queryBuilder
                .andWhere('booking.startDate < :endDate', { endDate: searchDto.endDate })
                .andWhere('booking.endDate > :startDate', { startDate: searchDto.startDate });
        }

        queryBuilder
            .orderBy('booking.createdAt', pageOptionsDto.order)
            .skip(pageOptionsDto.skip)
            .take(pageOptionsDto.take);

        const total = await queryBuilder.getCount();
        const bookings = await queryBuilder.getRawMany();

        const pageMetaDto = new PageMetaDto({ pageOptionsDto, total });

        const pageCount = pageMetaDto.pageCount;

        if (pageCount >= pageMetaDto.page) {
            return new PageDto(bookings, pageMetaDto);
        } else {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
    }

    async findOne(fields: EntityCondition<Booking>): Promise<NullableType<Booking>> {
        const data = await this.bookingsRepository.findOne({
            where: fields,
            relations: {
                hotel: true,
                guest: true,
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

    async findOneByParams(fields: EntityCondition<Booking>): Promise<NullableType<Booking>> {
        const data = await this.bookingsRepository.findOne({
            where: fields,
            relations: {
                hotel: true,
                guest: true,
            },
        });
        return data;
    }

    async findById(id: number): Promise<NullableType<Booking>> {
        const queryBuilder = this.bookingsRepository.createQueryBuilder('booking');
        const data = await queryBuilder
            .select([
                'booking.id',
                'booking.code',
                'booking.roomCount',
                'booking.totalPrice',
                'booking.startDate',
                'booking.endDate',
                'booking.status',
                'hotel.name',
                'guest.fullName',
            ])
            .leftJoin('booking.hotel', 'hotel')
            .leftJoin('booking.guest', 'guest')
            .where('booking.id =:id', { id: id })
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

    async findByCode(code: string): Promise<NullableType<Booking>> {
        const queryBuilder = this.bookingsRepository.createQueryBuilder('booking');
        const data = await queryBuilder
            .select([
                'booking.id',
                'booking.code',
                'booking.roomCount',
                'booking.totalPrice',
                'booking.startDate',
                'booking.endDate',
                'booking.status',
                'hotel.name',
                'guest.fullName',
            ])
            .leftJoin('booking.hotel', 'hotel')
            .leftJoin('booking.guest', 'guest')
            .where('booking.code =:code', { code: code })
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

    async findByGuestId(guestId: number): Promise<NullableType<any>> {
        const acceptableStatus: Array<string> = [
            BookingStatus.BOOKED,
            BookingStatus.READY_TO_CHECKEDIN,
            BookingStatus.CHECKEDIN,
        ];
        const queryBuilder = this.bookingsRepository.createQueryBuilder('booking');
        const data = await queryBuilder
            .select([
                'booking.code AS bookingCode',
                'bookedRooms.id AS bookedRoomId',
                'hotel.name AS hotelName',
                'city.name AS cityName',
                'roomType.name AS roomTypeName',
                'booking.roomCount AS roomCount',
                'booking.startDate AS checkInDate',
                'booking.endDate AS checkOutDate',
                'booking.status AS bookingStatus',
            ])
            .leftJoin('booking.bookedRooms', 'bookedRooms')
            .leftJoin('booking.hotel', 'hotel')
            .leftJoin('hotel.city', 'city')
            .leftJoin('bookedRooms.room', 'room')
            .leftJoin('room.roomType', 'roomType')
            .leftJoin('booking.guest', 'guest')
            .where('guest.id = :guestId', { guestId: guestId })
            .andWhere('booking.status IN (:...bookingStatus)', { bookingStatus: acceptableStatus })
            .getRawMany();
        return data;
    }

    async findStayById(bookedRoomId: number): Promise<NullableType<StaysResDto>> {
        const queryBuilder = this.bookingsRepository.createQueryBuilder('booking');
        const data = await queryBuilder
            .select([
                'booking.code AS bookingCode',
                'bookedRooms.id AS bookedRoomId',
                'hotel.name AS hotelName',
                'city.name AS cityName',
                'roomType.name AS roomTypeName',
                'booking.roomCount AS roomCount',
                'booking.startDate AS checkInDate',
                'booking.endDate AS checkOutDate',
                'booking.status AS bookingStatus',
            ])
            .leftJoin('booking.bookedRooms', 'bookedRooms')
            .leftJoin('booking.hotel', 'hotel')
            .leftJoin('hotel.city', 'city')
            .leftJoin('bookedRooms.room', 'room')
            .leftJoin('room.roomType', 'roomType')
            .leftJoin('booking.guest', 'guest')
            .where('bookedRooms.id = :bookedRoomId', { bookedRoomId: bookedRoomId })
            .andWhere('booking.status = :bookingStatus', { bookingStatus: BookingStatus.CHECKEDIN })
            .getRawOne();
        return data;
    }

    async findBookingDetailByCode(payload: ValidateBookingDto): Promise<NullableType<BookingDetailResDto>> {
        const acceptableStatus: Array<string> = [
            BookingStatus.BOOKED,
            BookingStatus.READY_TO_CHECKEDIN,
            BookingStatus.CHECKEDOUT,
        ];
        const queryBuilder = this.bookingsRepository.createQueryBuilder('booking');
        const data = await queryBuilder
            .select([
                'booking.code AS bookingCode',
                'booking.startDate AS checkInDate',
                'booking.endDate AS checkOutDate',
                'booking.status AS bookingStatus',
            ])
            .where('booking.code = :bookingCode', { bookingCode: payload.code })
            .andWhere('booking.status NOT IN (:...bookingStatus)', { bookingStatus: acceptableStatus })
            .getRawOne();
        if (!data) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        return data;
    }

    async findAvailableRooms(searchDto: SearchAvailableRoomReqDto): Promise<any> {
        const hotelId = searchDto.hotelId;
        const startDate = searchDto.startDate; // e.g '2023-08-25T05:00:00Z'
        const endDate = searchDto.endDate; // e.g '2023-08-27T07:00:00Z'

        const result = await this.bookingsRepository.query('SELECT * FROM search_available_rooms($1, $2, $3)', [
            hotelId,
            startDate,
            endDate,
        ]);
        return result;
    }

    async findOccupiedRooms(searchDto: SearchAvailableRoomReqDto): Promise<any> {
        const hotelId = searchDto.hotelId;
        const startDate = searchDto.startDate; // e.g '2023-08-25T05:00:00Z'
        const endDate = searchDto.endDate; // e.g '2023-08-27T07:00:00Z'

        // Call stored functions search_occupied_rooms()
        const result = await this.bookingsRepository.query('SELECT * FROM search_occupied_rooms($1, $2, $3)', [
            hotelId,
            startDate,
            endDate,
        ]);
        return result;
    }

    /**
     *
     * Search Available Rooms by Hotel and Date Range
     * @param searchDto
     * @returns List of Room Types with Detail Informations
     */
    async findAvailableRoomByHotelAndDate(searchDto: SearchAvailableRoomReqDto): Promise<any> {
        const hotelId = searchDto.hotelId;
        const startDate = searchDto.startDate; // e.g '2023-08-25T05:00:00Z'
        const endDate = searchDto.endDate; // e.g '2023-08-27T07:00:00Z'

        const canBypassDateValidationEnv = ['development', 'staging'];

        if (!canBypassDateValidationEnv.includes(this.configService.get<string>('app.nodeEnv'))) {
            // Disable date range validation for testing purpose
            if (new Date(startDate) < new Date()) {
                throw new AppError(
                    HttpStatus.BAD_REQUEST,
                    `The ${this.className} date range are not valid`,
                    AppError.errors.DATA_NOT_FOUND,
                );
            }
            if (new Date(endDate) < new Date()) {
                throw new AppError(
                    HttpStatus.BAD_REQUEST,
                    `The ${this.className} date range are not valid`,
                    AppError.errors.DATA_NOT_FOUND,
                );
            }
        }

        // Call stored functions search_available_rooms()
        const results = await this.bookingsRepository.query('SELECT * FROM search_available_rooms($1, $2, $3)', [
            hotelId,
            startDate,
            endDate,
        ]);
        return Promise.all(
            results.map(async (result: any) => {
                const {
                    room_type_id,
                    room_type_name,
                    room_type_price,
                    room_type_capacity,
                    room_count,
                    booked_rooms,
                    vacant_rooms,
                } = result;
                const roomTypeImages = await this.roomTypeService.findMediasByRoomTypeId(room_type_id);
                const roomTypeFeatures = await this.roomTypeService.findFeaturesByRoomTypeId(room_type_id);
                return {
                    roomTypeId: room_type_id,
                    roomTypeName: room_type_name,
                    roomTypePrice: room_type_price,
                    roomTypeCapacity: room_type_capacity,
                    roomTypeImages: roomTypeImages,
                    roomTypeFeatures: roomTypeFeatures,
                    roomCount: room_count,
                    bookedRooms: booked_rooms,
                    vacantRooms: vacant_rooms,
                };
            }),
        );
    }

    async checkAvailableRooms(searchDto: SearchAvailableRoomReqDto, roomTypeId: number, roomCount = 1): Promise<void> {
        const hotelId = searchDto.hotelId;
        const startDate = searchDto.startDate; // e.g '2023-08-25T05:00:00Z'
        const endDate = searchDto.endDate; // e.g '2023-08-27T07:00:00Z'

        const canBypassDateValidationEnv = ['development', 'staging'];

        if (!canBypassDateValidationEnv.includes(this.configService.get<string>('app.nodeEnv'))) {
            // Disable for testing purpose
            if (new Date(startDate) < new Date()) {
                throw new AppError(
                    HttpStatus.BAD_REQUEST,
                    `The ${this.className} date range are not valid`,
                    AppError.errors.DATA_NOT_FOUND,
                );
            }
            if (new Date(endDate) < new Date()) {
                throw new AppError(
                    HttpStatus.BAD_REQUEST,
                    `The ${this.className} date range are not valid`,
                    AppError.errors.DATA_NOT_FOUND,
                );
            }
        }

        const result = await this.bookingsRepository.query(
            'SELECT * FROM search_available_rooms($1, $2, $3) WHERE room_type_id = $4',
            [hotelId, startDate, endDate, roomTypeId],
        );
        const vacantRooms = result.map((r: any) => r.vacant_rooms);

        if (Number(vacantRooms) < roomCount) {
            throw new AppError(HttpStatus.UNPROCESSABLE_ENTITY, `The room is not available for booking`, 422);
        }
    }

    async assignRoomByAdmin(bookingCode: string, roomTypeId: number, roomId: number) {
        const result = true;
        const canBypassDateValidationEnv = ['development', 'staging'];
        const params = canBypassDateValidationEnv.includes(this.configService.get<string>('app.nodeEnv'))
            ? {
                  code: bookingCode,
                  status: BookingStatus.READY_TO_CHECKEDIN,
              }
            : {
                  code: bookingCode,
                  status: BookingStatus.READY_TO_CHECKEDIN,
                  startDate: Raw((alias) => `${alias} <= :now`, { now: new Date().toISOString() }),
                  endDate: Raw((alias) => `:now <= ${alias}`, { now: new Date().toISOString() }),
              };
        const booking = await this.findOneByParams(params);
        if (!booking) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${bookingCode}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        if (compareDates(new Date(), new Date(booking.startDate)) < 0) {
            this.logger.log('Early Check In');
        } else {
            this.logger.log('Late Check In');
        }
        const guest = await this.guestsService.findOne({
            id: booking.guest.id,
        });
        if (!guest.document) {
            throw new AppError(HttpStatus.UNPROCESSABLE_ENTITY, `The guest must be verified first`, 422);
        }
        const bookedRooms = await this.bookedRoomRepository.findOne({
            where: {
                booking: { id: booking.id },
                roomType: { id: roomTypeId },
            },
            relations: {
                booking: true,
                roomType: true,
                room: true,
            },
        });
        if (!bookedRooms) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} detail data with parameter {${booking.code}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        const room = await this.roomsService.findById(roomId);
        try {
            bookedRooms.room = room;
            await bookedRooms.save();
            return result;
        } catch (error) {
            this.logger.error(`An unknown ${this.className} exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async checkInRoomByAdmin(bookingCode: string, roomTypeId: number, roomId: number): Promise<boolean> {
        const result = true;
        const canBypassDateValidationEnv = ['development', 'staging'];
        const params = canBypassDateValidationEnv.includes(this.configService.get<string>('app.nodeEnv'))
            ? {
                  code: bookingCode,
                  status: BookingStatus.READY_TO_CHECKEDIN,
              }
            : {
                  code: bookingCode,
                  status: BookingStatus.READY_TO_CHECKEDIN,
                  startDate: Raw((alias) => `${alias} <= :now`, { now: new Date().toISOString() }),
                  endDate: Raw((alias) => `:now <= ${alias}`, { now: new Date().toISOString() }),
              };
        const booking = await this.findOneByParams(params);
        if (!booking) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${bookingCode}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        if (compareDates(new Date(), new Date(booking.startDate)) < 0) {
            this.logger.log('Early Check In');
        } else {
            this.logger.log('Late Check In');
        }
        const guest = await this.guestsService.findOne({
            id: booking.guest.id,
        });
        if (!guest.document) {
            throw new AppError(HttpStatus.UNPROCESSABLE_ENTITY, `The guest must be verified first`, 422);
        }
        const bookedRooms = await this.bookedRoomRepository.findOne({
            where: {
                booking: { id: booking.id },
                roomType: { id: roomTypeId },
                room: { id: roomId },
            },
            relations: {
                booking: true,
                roomType: true,
                room: true,
            },
        });
        if (!bookedRooms) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} detail data with parameter {${booking.code}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        try {
            // update booked room check in time
            bookedRooms.checkInAt = new Date();
            await bookedRooms.save();
            // update booking status
            booking.status = BookingStatus.CHECKEDIN;
            await booking.save();
            // update room is not available
            const room = await this.roomsService.findById(roomId);
            room.isAvailable = 0;
            await room.save();
            return result;
        } catch (error) {
            this.logger.error(`An unknown ${this.className} exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async checkOutRoomByAdmin(bookingCode: string, roomTypeId: number, roomId: number): Promise<boolean> {
        const booking = await this.findOneByParams({ code: bookingCode, status: BookingStatus.CHECKEDIN });
        if (!booking) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${bookingCode}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        if (compareDates(new Date(), new Date(booking.endDate)) < 0) {
            this.logger.log('Early Check Out');
        } else {
            this.logger.log('Late Check Out');
        }
        const bookedRoom = await this.bookedRoomRepository.findOne({
            where: {
                booking: {
                    id: booking.id,
                },
                roomType: {
                    id: roomTypeId,
                },
                room: {
                    id: roomId,
                },
                checkInAt: Not(IsNull()),
                checkOutAt: IsNull(),
            },
            relations: {
                booking: true,
                roomType: true,
                room: true,
            },
        });
        if (!bookedRoom) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} detail data with parameter {${booking.code}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        try {
            // update booked room check out time
            bookedRoom.checkOutAt = new Date();
            await bookedRoom.save();
            // update booking status
            booking.status = BookingStatus.CHECKEDOUT;
            await booking.save();
            // update room is available
            const room = await this.roomsService.findById(roomId);
            room.isAvailable = 1;
            await room.save();
            return true;
        } catch (error) {
            this.logger.error(`An unknown ${this.className} exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async checkInRoomByGuest(bookingCode: string, currentGuest: UserData): Promise<boolean> {
        let result = false;
        const canBypassDateValidationEnv = ['development', 'staging'];
        const params = canBypassDateValidationEnv.includes(this.configService.get<string>('app.nodeEnv'))
            ? {
                  code: bookingCode,
                  status: BookingStatus.BOOKED,
              }
            : {
                  code: bookingCode,
                  status: BookingStatus.BOOKED,
                  startDate: Raw((alias) => `${alias} <= :now`, { now: new Date().toISOString() }),
                  endDate: Raw((alias) => `:now <= ${alias}`, { now: new Date().toISOString() }),
              };
        const booking = await this.findOneByParams(params);
        if (!booking) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with parameter {${bookingCode}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        if (compareDates(new Date(), new Date(booking.startDate)) < 0) {
            this.logger.log('Early Check In');
        } else {
            this.logger.log('Late Check In');
        }
        const guest = await this.guestsService.findOne({
            id: currentGuest.key,
        });
        if (!guest.document) {
            throw new AppError(HttpStatus.UNPROCESSABLE_ENTITY, `The guest must be verified first`, 422);
        }
        try {
            booking.status = BookingStatus.READY_TO_CHECKEDIN;
            await booking.save();
            result = true;
        } catch (error) {
            this.logger.error(`An unknown ${this.className} exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
        return result;
    }

    async checkOutRoomByGuest(payload: VaidateQrTokenDto, currentGuest: UserData): Promise<void> {
        const [oldToken] = await Promise.all([
            await this.jwtService.verifyAsync(payload.qrToken, {
                secret: this.configService.getOrThrow('jwt.qrSecret'),
            }),
        ]);
        const token = oldToken as QrData;

        // check if token is already blacklisted
        const isBlacklist = await this.redisService.get(`${QR_BLACKLIST_KEY}:${payload.qrToken}`);
        if (isBlacklist) {
            throw new AppError(HttpStatus.UNAUTHORIZED, `Please provide a valid token`, 401);
        }

        const booking = await this.bookingsRepository.findOne({
            where: {
                id: token.key,
                guest: {
                    id: currentGuest.key,
                },
            },
            relations: {
                guest: true,
            },
        });
        if (!booking) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        const room = await this.roomsService.findOne({ code: token.code });
        const bookedRoom = await this.bookedRoomRepository.findOne({
            where: {
                booking: {
                    id: booking.id,
                },
                room: {
                    id: room.id,
                },
                checkInAt: Not(IsNull()),
                checkOutAt: IsNull(),
            },
            relations: {
                booking: true,
                roomType: true,
                room: true,
            },
        });
        if (!bookedRoom) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} detail data with parameter {${booking.code}} cannot be found`,
                AppError.errors.DATA_KEY_NOT_FOUND,
            );
        }
        try {
            bookedRoom.checkOutAt = new Date();
            await bookedRoom.save();
            booking.status = BookingStatus.CHECKEDOUT;
            await booking.save();

            const blackListTokenExpiresIn = this.configService.getOrThrow('jwt.qrBlacklistExpires');
            const blackListTokenExpires = Date.now() + Number(ms(blackListTokenExpiresIn));
            // blacklist the old token
            await this.redisService.insert(
                `${QR_BLACKLIST_KEY}:${payload.qrToken}`,
                payload.qrToken,
                DateTime.fromMillis(blackListTokenExpires).toUnixInteger(),
            );
        } catch (error) {
            this.logger.error(`An unknown ${this.className} exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async generateQrToken(payload: ValidateBookingDto): Promise<QrResponseType> {
        const canBypassDateValidationEnv = ['development', 'staging'];
        const params = canBypassDateValidationEnv.includes(this.configService.get<string>('app.nodeEnv'))
            ? {
                  code: payload.code,
                  status: BookingStatus.CHECKEDIN,
              }
            : {
                  code: payload.code,
                  status: BookingStatus.CHECKEDIN,
                  startDate: Raw((alias) => `${alias} <= :now`, { now: new Date().toISOString() }),
                  endDate: Raw((alias) => `:now <= ${alias}`, { now: new Date().toISOString() }),
              };
        const booking = await this.findOneByParams(params);
        if (!booking) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }
        const { qrToken } = await this.getQrTokenData({
            booking: booking,
        });
        return {
            qrToken: qrToken,
        };
    }

    private async getQrTokenData(data: { booking: Pick<Booking, 'id' | 'code' | 'startDate' | 'endDate'> }) {
        const bookedRoom = await this.bookedRoomRepository.findOne({
            where: {
                booking: {
                    id: data.booking.id,
                },
            },
            relations: {
                booking: true,
                roomType: true,
                room: true,
            },
            withDeleted: false,
            cache: this.configService.get<string>('app.nodeEnv') === 'production',
        });
        if (!bookedRoom) {
            throw new BookingError(
                HttpStatus.BAD_REQUEST,
                `Please provide a valid Booking Code`,
                BookingError.errors.INVALID_BOOKING,
            );
        }
        const room = await this.roomsService.findOne({ id: bookedRoom.room.id });
        const tokenExpiresIn = this.configService.get<string>('jwt.qrExpires');

        const qrData = {
            key: data.booking.id,
            code: room.code,
            start: data.booking.startDate,
            end: data.booking.endDate,
        } as QrData;

        const [qrToken] = await Promise.all([
            await this.jwtService.signAsync(qrData, {
                secret: this.configService.getOrThrow('jwt.qrSecret'),
                expiresIn: tokenExpiresIn,
            }),
        ]);
        return {
            qrToken,
        };
    }

    async validateQrToken(payload: VaidateQrTokenDto): Promise<boolean> {
        const [oldToken] = await Promise.all([
            await this.jwtService.verifyAsync(payload.qrToken, {
                secret: this.configService.getOrThrow('jwt.qrSecret'),
            }),
        ]);
        const token = oldToken as QrData;

        // check if token is already blacklisted
        const isBlacklist = await this.redisService.get(`${QR_BLACKLIST_KEY}:${payload.qrToken}`);
        if (isBlacklist) {
            throw new AppError(HttpStatus.UNAUTHORIZED, `Please provide a valid token`, 401);
        }

        const booking = await this.bookingsRepository.findOne({
            where: {
                id: token.key,
            },
            relations: {
                guest: true,
            },
        });
        return !!booking;
    }

    async cancelQrToken(payload: VaidateQrTokenDto, currentGuest: UserData): Promise<void> {
        const [oldToken] = await Promise.all([
            await this.jwtService.verifyAsync(payload.qrToken, {
                secret: this.configService.getOrThrow('jwt.qrSecret'),
            }),
        ]);
        const token = oldToken as QrData;

        // check if token is already blacklisted
        const isBlacklist = await this.redisService.get(`${QR_BLACKLIST_KEY}:${payload.qrToken}`);
        if (isBlacklist) {
            throw new AppError(HttpStatus.UNAUTHORIZED, `Please provide a valid token`, 401);
        }

        const booking = await this.bookingsRepository.findOne({
            where: {
                id: token.key,
                guest: {
                    id: currentGuest.key,
                },
            },
            relations: {
                guest: true,
            },
        });
        if (!booking) {
            throw new AppError(
                HttpStatus.NOT_FOUND,
                `The ${this.className} data with criteria cannot be found`,
                AppError.errors.DATA_NOT_FOUND,
            );
        }

        try {
            const blackListTokenExpiresIn = this.configService.getOrThrow('jwt.qrBlacklistExpires');
            const blackListTokenExpires = Date.now() + Number(ms(blackListTokenExpiresIn));
            // blacklist the old token
            await this.redisService.insert(
                `${QR_BLACKLIST_KEY}:${payload.qrToken}`,
                payload.qrToken,
                DateTime.fromMillis(blackListTokenExpires).toUnixInteger(),
            );
        } catch (error) {
            this.logger.error(`An unknown ${this.className} exception was thrown: ${error}`);
            throw new AppError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                `An unknown exception was thrown: ${error.message}`,
                AppError.errors.INTERNAL_ERROR,
            );
        }
    }

    async findHotelDetail(hotelId: number): Promise<any> {
        return await this.hotelsService.findDetailById(hotelId);
    }

    async findRoomTypeDetail(roomTypeId: number): Promise<any> {
        return await this.roomTypeService.findDetailById(roomTypeId);
    }
}
