import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next-router';

const OrderShow = ({ order, currentUser }) => {
  const [ timeLeft, setTimeLeft ] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: () => Router.push('/orders')
  })

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    }
    findTimeLeft(); // 1st run to display timer immediately 
    const timerId = setInterval(findTimeLeft, 1000);
    
    return () => { // whenever we navigate away from component/ or when it's rerendered (if ther is dependency list)
      clearInterval(timerId);
    }
  }, [order]);

  if (timeLeft < 0) {
    return (
      <div>Order Expired</div>
    )
  }

  return (
    <div>
      Timeleft to pay {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id})} 
        stripeKey="pk_test_51IS0igL91YKnjJg4SWn6MKukYqAvMWiE98DDr1IOhahnPbAhjYyUIVxdQLb0jV1ye8oyEgOvZ9osbCeMP0jHQQSq0066oiBkbL"
        amount={order.ticket.price * 100}
        email={currentUser.email} />
      {errors}
    </div>
  )
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
}

export default OrderShow;