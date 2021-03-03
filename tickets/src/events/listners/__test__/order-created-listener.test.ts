import { Message } from 'node-nats-streaming';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { OrderCreatedEvent, OrderStatus } from '@djtickets/common';
import mongoose from 'mongoose';


const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'fksdf'
  });
  await ticket.save();

  // Create fake data object
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'jglksdjf',
    expiresAt: 'fsklfs;',
    ticket: {
        id: ticket.id,
        price: ticket.price
    }
  }
  // Create a Message object
  const msg: Partial<Message> = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg };
  
}

it('it sets the userId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
})

it('acks the event', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg as Message);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  console.log('data: ', data);
  console.log('ticketUpdatedData: ', ticketUpdatedData);
  expect(data.ticket.id).toEqual(ticketUpdatedData.id);
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});