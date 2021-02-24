import { TicketCreatedPublisher } from './events/ticket-created-publisher';
import { TicketCreatedEvent } from './events/ticket-created-event';
import nats from 'node-nats-streaming';


console.clear();  

const stan = nats.connect('ticketing', 'abs2', {
  url: 'http://localhost:4222'
});

// @ts-ignore
stan.on('connect', async () => {
  console.log('Publisher connected to NATS');

  const data = {
    id: '123',
    title: 'concert',
    price: 20
  };

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish(data);
  } catch (err) {
    console.log(err);
  }
  

  

  // stan.publish('ticket:created', data, () => {
  //   console.log('Event published');
  // });
})

