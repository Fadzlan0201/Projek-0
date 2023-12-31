
const port = process.env.PORT || 3000;
//const port =  3000;
const express = require('express');
const { MongoClient } = require('mongodb');
const MongoURI = process.env.MONGODB_URI
const app = express();
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GROUP 3 SERVER',
      version: '1.0.0',
    },
  },
  apis: ['./main.js'],
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/group3', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// MongoDB connection URL
const uri =
  'mongodb+srv://fadzlan:fadzlan123@myserver.pcmmpqt.mongodb.net/apartmentvisitor?retryWrites=true&w=majority';

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
client
  .connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define database and collection names
const db = client.db('apartmentvisitor');
const usersCollection = db.collection('users'); 
const residentsCollection = db.collection('residents');
const visitorsCollection = db.collection('visitors');

function login(username, password) {
  return usersCollection.findOne({ username })
    .then((user) => {
      if (user) {
        if (user.password === password) {
          return user; // Successful login
        } else {
          throw new Error('Invalid password');
        }
      }

      // Check in the dbUsers array for testing purposes
      // const testUser = dbUsers.find((dbUser) => dbUser.username === username && dbUser.password === password);
      // if (testUser) {
      //   return testUser;
      // }

      throw new Error('User not found');
    });
}

function register(username, password, name, email, role, building, apartment, phone) {
  return usersCollection
    .findOne({ $or: [{ username }, { email }] }) // Check if username or email already exists
    .then((existingUser) => {
      if (existingUser) {
        console.log('Username or email already exists');
        throw new Error('Username or email already exists'); // Throw an error if username or email is already taken
      }

      const newUser = {
        username,
        password,
        name,
        email,
        role,
      };

      return usersCollection
        .insertOne(newUser)
        .then(() => {
          if (role === 'resident') {
            const residentData = {
              name,
              building,
              apartment,
              phone,
            };
            return residentsCollection.insertOne(residentData); // Add resident data to residentsCollection
          }
        })
        .then(() => {
          return 'User registered successfully';
        })
        .catch((error) => {
          throw new Error('Error registering user');
        });
    });
}

function generateToken(userData) {
  const token = jwt.sign(userData, 'ApartmentSuperPassword');
  return token;
}

function verifyToken(req, res, next) {
  let header = req.headers.authorization;
  console.log(header);

  let token = header.split(' ')[1];

  jwt.verify(token, 'ApartmentSuperPassword', function (err, decoded) {
    if (err) {
      res.send('Invalid Token');
    }

    req.user = decoded;
    next();
  });
}

// Front page
app.get('/home', (req,res) => {
  res.send('Welcome to BENR2423 Residences!')
})

// Apply JSON middleware
app.use(express.json());

// Display Original VMS
app.get('/vms-plan',verifyToken, (req, res) => {
  res.sendFile(__dirname + '/VMS-Plan.jpeg');
})

// User registration
app.post('/userRegister', (req, res) => {
  // Check if the user has admin role
  //if (req.user.role !== 'admin') {
  //  return res.status(403).send('Access denied. Only admin can register users.');
  //}

  const { username, password, name, email, role, building, apartment, phone } = req.body;

  register(username, password, name, email, role, building, apartment, phone)
    .then(() => {
      res.send('User registered successfully');
    })
    .catch((error) => {
      res.status(500).send('Error registering user');
    });
});

// security register user
app.post('/security/userRegister', verifyToken, (req, res) => {
  const userRole = req.user.role;

  if (userRole !== 'security') {
    return res.status(403).send('Access denied. Only users with the "security" role can register users.');
  }

  const { username, password, name, email, role, building, apartment, phone } = req.body;

  register(username, password, name, email, role, building, apartment, phone)
    .then(() => {
      res.send('User registered successfully');
    })
    .catch((error) => {
      res.status(500).send('Error registering user');
    });
});

// User login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  login(username, password)
    .then((user) => {
      let token = generateToken(user);
      console.log('User details:', user);
      res.send(token);
    })
    .catch((error) => {
      res.status(401).send(error.message);
    });
});

// Admin login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  // Add authentication logic for admin users here
  // For example, you can check if the user has an "admin" role

  // Replace this with your authentication logic
  if (username === 'fadzlan' && password === 'fayz123') {
    const adminUser = {
      username: 'fadzlan',
      role: 'admin',
    };
    let token = generateToken(adminUser);
    console.log('Admin login successful');
    res.send(token);
  } else {
    res.status(401).send('Admin login failed. Invalid credentials.');
  }
});

// visitor login
app.post('/security/login', (req, res) => {
  const { username, password } = req.body;

  // Add authentication logic for security users here
  // For example, you can check if the user has a "security" role

  // Replace this with your authentication logic
  if (username === 'UncleSaiful' && password === 'security001') {
    const securityUser = {
      username: 'UncleSaiful',
      role: 'security',
    };
    let token = generateToken(securityUser);
    console.log('Security login successful');
    res.send(token);
  } else {
    res.status(401).send('Security login failed. Invalid credentials.');
  }
});

// User logout
app.post('/logout', (req, res) => {
  res.send('User logged out successfully');
});

//Create a visitor
app.post('/visitorRegister', verifyToken, (req, res) => {
  const { name, contact, gender } = req.body;

  // Generate a random 8-digit number for accesspass
  const accesspass = Math.floor(10000000 + Math.random() * 90000000);

  const visitorData = {
    accesspass: accesspass.toString(),
    name,
    contact,
    gender,
    building: null,
    apartment: null,
    whomtovisit: null,
    entryTime: null,
    checkoutTime: null
  };

  // Assuming you want to set these values from the request body
  visitorData.building = req.body.building;
  visitorData.apartment = req.body.apartment;
  visitorData.whomtovisit = req.body.whomtovisit;
  // Assuming you want to remove the logic related to finding resident information

  visitorsCollection
    .insertOne(visitorData)
    .then(() => {
      res.send(visitorData);
    })
    .catch((error) => {
      console.error('Error creating visitor:', error);
      res.status(500).send('An error occurred while creating the visitor');
    });
});


// Update a visitor
app.patch('/visitorUpdate', verifyToken, (req, res) => {
  const { contact, newcontact } = req.body;
  const userName = req.user.name;

  visitorsCollection
    .findOne({ contact })
    .then((visitor) => {
      if (!visitor) {
        res.status(404).send('No visitors with that phone number exist');
      } else if (visitor.whomtovisit !== userName) {
        res.status(403).send('You do not have a visitor with that phone number');
      } else {
        return visitorsCollection.findOneAndUpdate(
          { contact },
          { $set: { "contact" : newcontact } },
          { returnOriginal: false }
        );
      }
    })
    .then((result) => {
      if (result && result.value) {
        res.send('Visitor detail updated successfully');
      }
    })
    .catch((error) => {
      console.error('Error updating visitor:', error);
      res.status(500).send('An error occurred while updating the visitor');
    });
});

// Delete a visitor
app.delete('/visitorDelete', verifyToken, (req, res) => {
  const accesspass = req.body.accesspass;
  const userName = req.user.name;
  const userRole = req.user.role;

  visitorsCollection
    .findOne({ accesspass })
    .then((visitor) => {
      if (!visitor) {
        res.status(404).send('No visitor with this access pass exists');
      } else if (visitor.whomtovisit !== userName && userRole !== 'admin') {
        res.status(403).send('You do not have permission to delete this visitor');
      } else {
        return visitorsCollection.deleteOne({ accesspass });
      }
    })
    .then((result) => {
      if (result && result.deletedCount > 0) {
        res.send('Visitor deleted successfully');
      }
    })
    .catch((error) => {
      console.error('Error deleting visitor:', error);
      res.status(500).send('An error occurred while deleting the visitor');
    });
});

// Delete a user
app.delete('/userDelete', verifyToken, (req, res) => {
  const deletingUsername = req.body.username;

  usersCollection
    .findOne({ username: deletingUsername })
    .then((deletingUser) => {
      if (!deletingUser) {
        return res.status(404).send('No user with that username exists');
      } else if (req.user.role !== 'admin') {
        return res.status(403).send('You do not have permission to delete this user');
      } else {
        const deletePromises = [usersCollection.deleteOne({ username: deletingUsername })];

        if (deletingUser.role === 'resident') {
          deletePromises.push(residentsCollection.deleteOne({ name: deletingUser.name }));
        }

        return Promise.all(deletePromises);
      }
    })
    .then((results) => {
      const deletedUserResult = results[0];

      if (deletedUserResult && deletedUserResult.deletedCount > 0) {
        res.send('User deleted successfully');
      }
    })
    .catch((error) => {
      console.error('Error deleting user:', error);
      res.status(500).send('An error occurred while deleting the user');
    });
});

// View visitors
app.get('/visitors', verifyToken, (req, res) => {
  const userRole = req.user.role;
  const userName = req.user.name;

  if (userRole === 'user') {
    visitorsCollection
      .find()
      .toArray()
      .then((visitors) => {
        if (visitors.length === 0) {
          res.send('No visitors found');
        } else {
          res.send(visitors);
        }
      })
      .catch((error) => {
        console.error('Error retrieving visitors:', error);
        res.status(500).send('An error occurred while retrieving visitors');
      });
  } //else {
    //visitorsCollection
      //.find({ whomtovisit: userName })
      //.toArray()
      //.then((visitors) => {
      //  if (visitors.length === 0) {
      //   res.send('You do not have any visitors registered');
       // } else {
       //   res.send(visitors);
       // }
     // })
      //.catch((error) => {
      //  console.error('Error retrieving visitors:', error);
      //  res.status(500).send('An error occurred while retrieving visitors');
    //  });
  //}

});
app.get('/visitorsView', (req, res) => {
visitorsCollection
      .find({ whomtovisit: userName })
      .toArray()
      .then((visitors) => {
        if (visitors.length === 0) {
          res.send('You do not have any visitors registered');
        } else {
          res.send(visitors);
        }
      })
      .catch((error) => {
        console.error('Error retrieving visitors:', error);
        res.status(500).send('An error occurred while retrieving visitors');
      });
    });
// Visitor access info
app.get('/visitorAccess', (req, res) => {
  const contact = req.query.contact;

  visitorsCollection
    .find({ contact })
    .toArray()
    .then((visitors) => {
      if (visitors.length === 0) {
        res.send('No visitors found with the given contact number');
      } else {
        res.send(visitors);
      }
    })
    .catch((error) => {
      console.error('Error retrieving visitors by contact:', error);
      res.status(500).send('An error occurred while retrieving visitors by contact');
    });
});

//Visitor check in
app.patch('/visitorCheckIn', verifyToken, (req, res) => {
  const accesspass = req.body.accesspass;
  const gmt8Time = moment().tz('GMT+8').format('YYYY-MM-DD HH:mm:ss');

  visitorsCollection
    .findOne({ accesspass })
    .then((visitor) => {
      if (!visitor) {
        res.status(404).send('No visitors with that access pass exists');
      } else {
        return visitorsCollection.findOneAndUpdate(
          { accesspass },
          { $set: { "entryTime" : gmt8Time } },
          { returnOriginal: false }
        );
      }
    })
    .then((result) => {
      if (result && result.value) {
        res.send('Visitor checked in successfully');
      }
    })
    .catch((error) => {
      console.error('Error updating visitor:', error);
      res.status(500).send('An error occurred while updating the visitor');
    });
});

//Visitor check out
app.patch('/visitorCheckOut', verifyToken, (req, res) => {
  const accesspass = req.body.accesspass;
  const gmt8Time = moment().tz('GMT+8').format('YYYY-MM-DD HH:mm:ss');

  visitorsCollection
    .findOne({ accesspass })
    .then((visitor) => {
      if (!visitor) {
        res.status(404).send('No visitors with that access pass exists');
      } else {
        return visitorsCollection.findOneAndUpdate(
          { accesspass },
          { $set: { "checkoutTime" : gmt8Time } },
          { returnOriginal: false }
        );
      }
    })
    .then((result) => {
      if (result && result.value) {
        res.send('Visitor checked out successfully');
      }
    })
    .catch((error) => {
      console.error('Error updating visitor:', error);
      res.status(500).send('An error occurred while updating the visitor');
    });
});

// user update
app.patch('/userUpdate', verifyToken, (req, res) => {
  const { username, newpassword } = req.body;
  const currentUser = req.user;

  if (currentUser.role !== 'admin') {
    return res.status(403).send('You do not have permission to update user passwords');
  }

  usersCollection
    .findOne({ username })
    .then((user) => {
      if (!user) {
        res.status(404).send('No user with that username exists');
      } else {
        return usersCollection.findOneAndUpdate(
          { username },
          { $set: { password: newpassword } },
          { returnOriginal: false }
        );
      }
    })
    .then((result) => {
      if (result && result.value) {
        res.send('User password updated successfully');
      }
    })
    .catch((error) => {
      console.error('Error updating user password:', error);
      res.status(500).send('An error occurred while updating the user password');
    });
});

// host contact
app.get('/hostcontact', verifyToken, (req, res) => {
  const userRole = req.user.role;
  const accesspass = req.query.accesspass;

  // Check if the user has the 'security' role
  if (userRole !== 'security') {
    return res.status(403).send('Access denied. Only users with the "security" role can access this endpoint.');
  }

  // Query the visitorsCollection to retrieve the host's contact number based on the visitor's contact number
  visitorsCollection
    .findOne({ accesspass })
    .then((visitor) => {
      if (!visitor) {
        res.send('No visitor found with the given contact number');
      } else {
        const hostContact = visitor.whomtovisit ? visitor.whomtovisit.contact : 'Not available';
        res.send({ hostContact });
      }
    })
    .catch((error) => {
      console.error('Error retrieving host contact by visitor contact:', error);
      res.status(500).send('An error occurred while retrieving host contact by visitor contact');
    });
});

app.get('/GetUser', verifyToken, (req, res) =>{ 
  const userRole = req.user.role;
  const userName = req.user.name;

  if (userRole === 'admin') {
    usersCollection
      .find()
      .toArray()
      .then((users) => {
        if (users.length === 0) {
          res.send('No user found');
        } else {
          res.send(users);
        }
      })
      .catch((error) => {
        console.error('Error retrieving user:', error);
        res.status(500).send('An error occurred while retrieving user');
      });
    }
    })
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


