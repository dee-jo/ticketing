import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('fetches the order', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  // Signin user and get cookie
  const userCookie = global.signin();

  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  
  // Make a requset to fetch this order
  const {body: fetchetOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userCookie)
    .expect(200)

  expect(fetchetOrder.id).toEqual(order.id);

});

it('returns an error if a user tries to fetch another user\'s order', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  // Signin user and get cookie
  const userCookie1 = global.signin();
  const userCookie2 = global.signin();

  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie1)
    .send({
      ticketId: ticket.id
    })
    .expect(201);

  // Make a requset to fetch this order with different user
  
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userCookie2)
    .expect(401)

});




