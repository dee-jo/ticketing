import { Subjects } from './subjects';
import { Stan } from 'node-nats-streaming';

interface Event {
  subject: Subjects,
  data: any
}

export abstract class Publisher<T extends Event> {
  abstract subject: T['subject'];
  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish = (data: T['data']): Promise<void> => {
    const dataJSON = JSON.stringify(data);
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, dataJSON, (err) => {
        if (err) {
          return reject(err);
        }
        console.log(`Event published to subject ${this.subject}`);
        resolve();
      });
    })
  }


}