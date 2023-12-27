/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate a user
 *     tags: 
 *       - User Management
 *     requestBody:
 *       description: User credentials for authentication
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *     responses:
 *       '200':
 *         description: User authenticated successfully. Returns a JWT token.
 *       '401':
 *         description: Unauthorized. Invalid credentials or user not found.
 */

/**
 * @swagger
 * paths:
 *   /admin/login:
 *     post:
 *       summary: Admin Login
 *       description: Authenticate an admin user and generate an authentication token.
 *       tags:
 *         - Admin Management
 *       requestBody:
 *         description: Admin login credentials
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The username of the admin user.
 *                 password:
 *                   type: string
 *                   description: The password of the admin user.
 *       responses:
 *         '200':
 *           description: Admin login successful. Returns an authentication token.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   token:
 *                     type: string
 *                     description: The authentication token for the admin user.
 *         '401':
 *           description: Admin login failed. Invalid credentials.
 */

/**
 * @swagger
 * paths:
 *   /userRegister:
 *     post:
 *       summary: Register a new user 
 *       tags:
 *         - User Management
 *       requestBody:
 *         description: User registration details
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: The username of the new user.
 *                 password:
 *                   type: string
 *                   description: The password of the new user.
 *                 name:
 *                   type: string
 *                   description: The name of the new user.
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: The email of the new user.
 *                 role:
 *                   type: string
 *                   enum: [admin, resident, visitor]
 *                   description: The role of the new user.
 *                 building:
 *                   type: string
 *                   description: The building of the new user (only for residents).
 *                 apartment:
 *                   type: string
 *                   description: The apartment of the new user (only for residents).
 *                 phone:
 *                   type: string
 *                   description: The phone number of the new user.
 *       responses:
 *         '200':
 *           description: User registered successfully.
 *         '403':
 *           description: Access denied. Only admin can register users.
 *         '500':
 *           description: Error registering user.
 */

/**
 * @swagger
 * /visitorRegister:
 *   post:
 *     summary: Register a new visitor
 *     tags: 
 *       - User Management
 *     security:
 *       - BearerAuth: []
 *     description: Endpoint to create a new visitor record.
 *     requestBody:
 *       description: Visitor information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the visitor.
 *                 example: John Doe
 *               contact:
 *                 type: string
 *                 description: Contact number of the visitor.
 *                 example: +1234567890
 *               gender:
 *                 type: string
 *                 description: Gender of the visitor.
 *                 example: Male
 *               building:
 *                 type: string
 *                 description: Building information.
 *                 example: Building A
 *               apartment:
 *                 type: string
 *                 description: Apartment information.
 *                 example: 123
 *               whomtovisit: 
 *                 type: string
 *                 description: User information.
 *                 example: ahmad
 *                
 *     responses:
 *       200:
 *         description: Visitor registered successfully.
 *         content:
 *           application/json:
 *             example:
 *               accesspass: "12345678"
 *               name: John Doe
 *               contact: +1234567890
 *               gender: Male
 *               building: Building A
 *               apartment: 123
 *               whomtovisit: ahmad
 *               entryTime: null
 *               checkoutTime: null
 *       500:
 *         description: An error occurred while creating the visitor.
 *         content:
 *           application/json:
 *             example:
 *               error: Internal Server Error
 */

/**
 * @swagger
 * /visitors:
 *   get:
 *     summary: Get visitors
 *     tags:
 *       - Admin Management
 *     security:
 *       - BearerAuth: []  # Apply BearerAuth security scheme to this operation
 *     responses:
 *       '200':
 *         description: List of visitors
 *         content:
 *           application/json:
 *             example:
 *               - accesspass: "12345678"
 *                 name: "John Doe"
 *                 contact: "+123456789"
 *                 gender: "male"
 *                 building: "Building A"
 *                 apartment: "101"
 *                 whomtovisit: "Resident A"
 *                 entryTime: "2023-01-01 10:00:00"
 *                 checkoutTime: "2023-01-01 12:00:00"
 *               - accesspass: "87654321"
 *                 name: "Jane Smith"
 *                 contact: "+987654321"
 *                 gender: "female"
 *                 building: "Building B"
 *                 apartment: "202"
 *                 whomtovisit: "Resident B"
 *                 entryTime: "2023-01-02 15:00:00"
 *                 checkoutTime: "2023-01-02 17:00:00"
 *       '403':
 *         description: Access denied
 *         content:
 *           text/plain:
 *             example: Access denied. Only admin or authorized users can view visitors.
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: An error occurred while retrieving visitors
 */

/**
 * @swagger
 * /visitorAccess:
 *   get:
 *     summary: Retrieve visitor access information by contact number
 *     tags:
 *       - Visitor Management
 *     parameters:
 *       - in: query
 *         name: contact
 *         description: Contact number of the visitor
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Visitor access information retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               - accesspass: "12345678"
 *                 name: "Visitor Name"
 *                 contact: "Visitor Contact"
 *                 gender: "Visitor Gender"
 *                 building: "Visitor Building"
 *                 apartment: "Visitor Apartment"
 *                 whomtovisit: "Whom to Visit"
 *                 entryTime: "2023-01-01 12:00:00"
 *                 checkoutTime: "2023-01-01 13:00:00"
 *       '404':
 *         description: No visitors found with the given contact number
 *         content:
 *           text/plain:
 *             example: No visitors found with the given contact number
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             example: An error occurred while retrieving visitors by contact
 */