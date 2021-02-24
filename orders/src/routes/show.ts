import express, { Request, Response } from 'express';
import { currentUser, requireAuth, NotFoundError, NotAuthorizedError } from '@djtickets/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:orderId',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
  // TODO: validate the orderId if it's a valid mongodb id
  const order = await Order.findById(req.params.orderId)
    .populate('ticket');

  if (!order) {
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }
  res.send(order);
});

export { router as showOrderRouter };