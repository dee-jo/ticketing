import { Message } from 'node-nats-streaming';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@djtickets/common';
import mongoose from 'mongoose';
import { Order } from '../../../models/order';

const setup = () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'slfkjsd',
    userId: 'foisdf',
    status: OrderStatus.Created,
    ticket: {
      id: 'fksfjs',
      price: 10
    }
  }
  const msg: Partial<Message> = {
    ack: jest.fn()
  }
  
  return { listener, data, msg };
}

it('replicates the order info', async () => {
  const { listener, data, msg } = setup();
  await listener.onMessage(data, msg as Message);
  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);

});

it('acks the message', async () => {
  const { listener,data, msg} = setup();
  await listener.onMessage(data, msg as Message);
  expect(msg.ack).toHaveBeenCalled();
})