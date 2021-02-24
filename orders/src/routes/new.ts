import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { currentUser,
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError 
} from '@djtickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper} from './../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders', 
  currentUser, 
  requireAuth, [
    body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => {
      return mongoose.Types.ObjectId.isValid(input)
    })
    .withMessage('ticketId must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // find the ticket the user is trying to order in the db
    const { ticketId } = req.body;

    // make sure that this ticket is not already reserved
    // run query to look at all orders. Find order where the ticket 
    // is the same as the ticket we just found, *and* the order's 
    // status is *not* cancelled
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    const isReserved = await ticket.isReserved();
    if(isReserved) {
      throw new BadRequestError('Ticket is already reserved')
    }

    // calculate expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // build the order and save it to db
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    });

    await order.save();

    // publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client)
      .publish({
        id: order.id,
        version: order.version,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: { 
          id: ticket.id,
          price: ticket.price
        }
      })
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };