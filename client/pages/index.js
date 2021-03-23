import Link from 'next/link';

const LandingPage = ({ currentUser, tickets, error }) => {
  console.log('tickets: ', tickets);
  console.log('currentUser: ', currentUser);
  const ticketList = tickets ? tickets.map(ticket => {
    return (
      <tr key={ticket.id}>
        {/* <td>{ticket.id}</td> */}
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    )
  }) 
  : null;

  return (
    <div>
      { error && <p>{error}</p>}
      <h2>Tickets</h2>
      <table className="table">
        <thead>
          <tr>
            {/* <th>Id</th> */}
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr> 
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  )
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
  // const { data } = await client.get('/api/tickets');
  // return { tickets: data };
  const resp = client.get('/api/tickets')
    .then(resp => resp)
    .catch(err => err)
  
  if (tickets.lengh) {
    return { tickets: resp };
  }
  else {
    return { error: resp }
  }
}

export default LandingPage;