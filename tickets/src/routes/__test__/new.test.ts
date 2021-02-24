import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

// make sure we get any other response besides 404
it('has a route handler listening to /api/tickets for POST requests', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});

  expect(response.status).not.toEqual(404);
});


it('can only be accessed when the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});

    expect(response.status).toEqual(401);
});

it('returns a status code other than 401 when the user is signed in', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({});

  // console.log(response.status);
  expect(response.status).not.toEqual(401);
});


it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10
    })
    .expect(400);

    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 10
    })
    .expect(400);
});


it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'fsdfs',
      price: -10
    })
    .expect(400);

    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'sdfsfs'
    })
    .expect(400);
});


it('creates a ticket with valid inputs', async () => {
  // add in a check to make sure a ticket was saved to db
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'flsf',
      price: 20
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual('flsf');
});

it('publishes an event', async () => {
  const title = 'sdlfs';
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price: 20
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled()

})