export type BookingType = 'booking' | 'callback';
export type BookingStatus = 'new' | 'confirmed' | 'done' | 'cancelled';

export interface Booking {
	id: string;
	createdAt: string;
	type: BookingType;
	status: BookingStatus;
	name: string;
	phone: string;
	serviceId?: string;
	serviceName?: string;
	price?: number;
	master?: string;
	date?: string;
	time?: string;
	comment?: string;
}

export const BOOKING_STATUSES: Record<BookingStatus, string> = {
	new: 'Новая',
	confirmed: 'Подтверждена',
	done: 'Выполнена',
	cancelled: 'Отменена',
};
