import { OrderCancelledListener } from './../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { OrderCancelledEvent } from '@djtickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId  = mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: mongoose.Types.ObjectId().toHexString()
  });
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id
    }
  }

  const msg: Partial<Message> = {
    ack: jest.fn()
  }

  return { msg, data, listener, ticket, orderId };
}

it('updates the ticket, publishes event, and acks the message', async () => {
  const { msg, data, listener, ticket, orderId } = await setup();

  await listener.onMessage(data, msg as Message);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  
})