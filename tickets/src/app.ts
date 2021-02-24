
import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser} from '@djtickets/common';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketsRouter } from './routes/index';
import { updateTicketRouter } from './routes/update';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
  signed: false,
  secure: process.env.NODE_ENV !== 'test'
}));

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketsRouter);
app.use(updateTicketRouter);
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