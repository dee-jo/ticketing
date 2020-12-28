import { CustomError } from '../errors/custom-error';
import { Request, Response, NextFunction } from 'express';  
  
// when express sees 4 arguments in a function passed to app.use(), it categorizes it as error handler
export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    // console.log('[error-middleware] Handling RequestValidationError');
    res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }
  
  // else {
  //   res.status(400).send({
  //     errors: [
  //       { message: 'Something went wrong'}
  //     ]
  //   })
  // } 
}