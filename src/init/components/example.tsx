import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import '../styles/example.css';

const Example = ({ userData, setError }) => {
  const [count, setCount] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<Boolean>(false);
  useEffect(() => {
    setIsLoggedIn(userData && Object.entries(userData).length > 0);
    // console.log(userData);
  }, [userData]);

  return <div id="example">
    <h1>This is an example widget, check out it's code to learn more.</h1>
    <div className="box">
      <p>You can access the current logged in user's data</p>
      {
        !isLoggedIn
          ? <p>User not logged in</p>
          : (
            <Table striped bordered>
              <tbody>
                <tr>
                  <th>First Name</th>
                  <td>{userData.user.firstName}</td>
                </tr>
                <tr>
                  <th>Last Name</th>
                  <td>{userData.user.lastName}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{userData.user.email}</td>
                </tr>
                <tr>
                  <th>Phone</th>
                  <td>{userData.user.extentedProperties.ext_Mobile_Phone}</td>
                </tr>
                <tr>
                  <th>Contact ID</th>
                  <td>{userData.contactId}</td>
                </tr>
                <tr>
                  <th>User ID</th>
                  <td>{userData.user.userId}</td>
                </tr>
              </tbody>
            </Table>
          )
      }
    </div>
    <div className="box">
      <p>You can use any built-in React function<br />(useEffect, useState, ...etc)</p>
      <Button variant="danger" onClick={() => setCount(count - 1)}>Decrement</Button>
      <input type="text" value={count} readOnly />
      <Button variant="success" onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
    <div className="box">
      <p>You can handle errors using the 'setError' function</p>
      <Button variant="danger" onClick={() => setError('This is a test error.')}>setError('This is a test error.')</Button>
    </div>
    <div className="box">
      <p>You can use any react-based libraries.<br />Here is a card & button from 'react-bootstrap'</p>
      <Card style={{ width: '18rem', marginInline: 'auto' }}>
        <Card.Img variant="top" src="https://picsum.photos/286/180" />
        <Card.Body>
          <Card.Title>Card Title</Card.Title>
          <Card.Text>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </Card.Text>
          <Button variant="primary">Go somewhere</Button>
        </Card.Body>
      </Card>
    </div>
  </div>
}
export default Example;