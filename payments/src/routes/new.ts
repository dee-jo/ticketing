import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { 
  requireAuth,
  validateRequest,
  currentUser,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus
} from '@djtickets/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';  
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from './../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';


const router = express.Router();

router.post('/api/payments',
  currentUser,
  requireAuth,
  [
    body('token')
      .not()
      .isEmpty(),
    body('orderId')
      .not()
      .isEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError()
    }
    // console.log('currentUser ', req.currentUser);
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for cancelled order');
    }

    const charge = await stripe.charges.create({
      currency: 'gbp',
      amount: order.price * 100, // needs to be converted into cents or pennies
      source: token
    });

    const payment = Payment.build( {
      orderId,
      stripeId: charge.id
    });

    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    })

    res.status(201).send(payment);
  }
);

export { router as createChargeRouter };