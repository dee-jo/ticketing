import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { OrderStatus, ExpirationCompleteEvent } from '@djtickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();
  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'lfksjlf',
    expiresAt: new Date(),
    ticket
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  }

  const msg: Partial<Message> = {
    ack: jest.fn()
  }

  return { listener, order, ticket, data, msg };
}

it('updates the OrderStatus to Cancelled', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1] // returns the entire data object passed to publish()
  );
  expect(eventData.id).toEqual(order.id);
});

it('acks the messgage', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg as Message);
  expect(msg.ack).toHaveBeenCalled();
});