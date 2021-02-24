import { Publisher, OrderCancelledEvent, Subjects } from '@djtickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: OrderCancelledEvent['subject'] = Subjects.OrderCancelled;
}