import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  console.log('currentUser: ', currentUser);
  return <h1>Landing Page</h1>
}

LandingPage.getInitialProps = async ({ req }) => {
  if (typeof window === 'undefined') {
    const { data } = await axios.get('http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser', {
      headers: req.headers
    });
    return data;
  }
  else {
    const { data } = await axios.get('https://ticketing.dev/api/users/currentuser');
    return data;
  }
}

export default LandingPage;