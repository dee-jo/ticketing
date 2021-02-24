import { Publisher, Subjects, TicketCreatedEvent } from '@djtickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: TicketCreatedEvent['subject'] = Subjects.TicketCreated;
}