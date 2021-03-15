
import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser} from '@djtickets/common';
import { deleteOrderRouter } from './routes/delete';
import { indexOrderRouter } from './routes/index';
import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  // secure: process.env.NODE_ENV !== 'test'
  secure: false
}));

app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);
// app.use(currentUser); -- declaration moved to ./routes/new

app.all('/*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler); // middleware setup needs to be after global route def, otherwise won't work!!!!
 
// app.post('/api/users/test', (req, res) => {
//   console.log('received GET request')
//   res.status(201).send({});
// })

export { app };