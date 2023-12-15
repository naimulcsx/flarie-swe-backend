import { Reward } from 'src/coupon-redeem/entities/Reward';

export const rewards: Reward[] = [
  {
    id: 1,
    name: 'Nike Shoes',
    startDate: new Date('2023-02-01'), // Feb 01, 2023
    endDate: new Date('2023-03-01'), //  Mar 01, 2023
    perDayLimit: 5,
    totalLimit: 30,
  },
  {
    id: 2,
    name: 'Headphones',
    startDate: new Date('2023-04-01'), // Apr 01, 2023
    endDate: new Date('2023-04-07'), // Apr 07, 2023
    perDayLimit: 3,
    totalLimit: 10,
  },
  {
    id: 3,
    name: 'Gift Card',
    startDate: new Date('2023-05-01'), // May 01, 2023
    endDate: new Date('2023-05-07'), // May 07, 2023
    perDayLimit: 4,
    totalLimit: 20,
  },
  {
    id: 4,
    name: 'Airline Ticket',
    startDate: new Date('2023-12-07'), // Dec 07, 2023
    endDate: new Date('2023-12-31'), // Dec 21, 2023
    perDayLimit: 14,
    totalLimit: 14,
  },
  {
    id: 5,
    name: 'Apple Watch SE',
    startDate: new Date('2023-12-14'), // Dec 14, 2023
    endDate: new Date('2023-12-31'), // Dec 31, 2023
    perDayLimit: 3,
    totalLimit: 10,
  },
];
