import express, { Request, Response } from 'express';
import { currentUser, requireAuth } from '@djtickets/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', 
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const orders = await Order.find({
      userId: req.currentUser!.id
    }).populate('ticket');
    
    res.status(200).send(orders);
  }
);

export { router as indexOrderRouter };
