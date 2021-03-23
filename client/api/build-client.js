import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    return axios.create({
      // baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      baseURL: 'http://ticketing-app-prod.work',
      headers: req.headers
    });
  } else {
    // we are on the browser
    return axios.create({
      baseURL: ''
    })
  }
}

export default buildClient;