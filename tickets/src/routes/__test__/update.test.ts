import { Ticket } from '../../models/ticket';
import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'ksldfjs',
      price: 20
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'ksldfjs',
      price: 20
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', global.signin())
    .send({
      title: 'ksldfjs',
      price: 20
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'sviee',
      price: 1000
    })
    .expect(401)

    // check if the update really didn't get processed (retrieve the unchanged ticket from server)
});

it('returns a 400 if the user provides invalid title or price', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'ksldfjs',
      price: 20
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'gsfsdf',
      price: -20
    })
    .expect(400);
});

it('updates the ticket provided a valid ticket', async () => {
  const cookie = global.signin();
  const newTitle = 'new title';
  const newPrice = 100;
  
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'ksldfjs',
      price: 20
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: newTitle,
      price: newPrice
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual(newTitle);
  expect(ticketResponse.body.price).toEqual(newPrice); 
});

it('publishes an event', async () => {
  const cookie = global.signin();
  const newTitle = 'new title';
  const newPrice = 100;
  
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'ksldfjs',
      price: 20
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: newTitle,
      price: newPrice
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects the update if the ticket is reserved', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'ksldfjs',
      price: 20
    })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  await ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'sdlkfslkd',
      price: 20
    })
    .expect(400);
});

