import { Subjects } from './subjects';
import { TicketCreatedEvent } from './ticket-created-event';
import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: TicketCreatedEvent['subject'] = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage = (data: TicketCreatedEvent['data'], msg: Message) => {
    console.log('Event data: ', data);
    msg.ack();
  }
}