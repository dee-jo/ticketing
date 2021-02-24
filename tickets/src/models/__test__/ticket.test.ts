import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123'
  });

  // Save the ticket to the database
  await ticket.save();

  // Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Two separate changes to the tickets
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // Save the first fetched ticket, expect the version to be updated
  await firstInstance!.save();

  // Save the second fetched ticket, expect an outdated version number (error)
  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
  }
});

it('Increments version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'movie',
    price: 50,
    userId: '123'
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);

})