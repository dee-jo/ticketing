import { currentUser } from './../../middlewares/current-user';
import request from 'supertest';
import { app } from '../../app';

it('responds with details about current user', async () => {
  // const authResponse = await request(app)
  //   .post('/api/users/signup')
  //   .send({
  //     email: 'email@email.com',
  //     password: 'password'
  //   })
  //   .expect(201);
  
  // const cookie = authResponse.get('Set-Cookie');

  const cookie = await global.signup();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('email@email.com')
  
});

it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);

})