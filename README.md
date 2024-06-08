# Argimanager.app (Under construction) - MERN 

Agrimanager is an application designed for managing agricultural farms, built using the MERN (MongoDB, Express.js, React.js, Node.js) stack along with Tailwind CSS. It provides functionalities for adding, editing, and deleting fields, machinery, and documents, with the option to add photos.

## Technologies Used

### Backend

- **Bcryptjs:** A library for hashing passwords.
- **Body-parser:** A middleware for parsing incoming request bodies.
- **Cloudinary:** A cloud-based image and video management service.
- **Cookie-parser:** A middleware for parsing cookies attached to the client request object.
- **Cors:** A middleware for enabling Cross-Origin Resource Sharing (CORS) in Express.js.
- **Dotenv:** A zero-dependency module used to load environment variables from a .env file into process.env.
- **Express:** A web application framework for Node.js used to build the server-side logic.
- **Express-async-handler:** A utility to handle exceptions in async express routes and middleware.
- **Mongoose:** An Object Data Modeling (ODM) library for MongoDB and Node.js, used to interact with the MongoDB database.
- **Multer:** A middleware for handling multipart/form-data, primarily used for file uploads.
- **Nodemailer:** A module for sending emails from Node.js applications.

### Frontend

- **Axios:** A promise-based HTTP client for making requests to the backend server.
- **Dompurify:** A DOM-only sanitization library for HTML and JavaScript.
- **React:** A JavaScript library for building user interfaces.
- **React-confirm-alert:** A library for creating confirmation dialogs in React applications.
- **React-dom:** A package for React for working with the DOM.
- **React-icons:** A library for including popular icon sets in React applications.
- **React-paginate:** A pagination component for React.
- **React-quill:** A rich text editor component for React.
- **React-redux:** A state management library for managing application state in React applications.
- **React-router-dom:** A routing library for React applications.
- **React-scripts:** A set of scripts and configurations for React projects.
- **React-toastify:** A notification library for React applications.
- **Sass:** A CSS preprocessor that adds power and elegance to CSS, used for styling React components.
- **Web-vitals:** A library for measuring web vital metrics like FID, LCP, and CLS.

## Installation

### Backend

1. Clone the backend repository.
2. Navigate to the backend project directory.
3. Run **npm install** to install the dependencies listed in **package.json.**
4. Set up a MongoDB database:
- **Install MongoDB** if you haven't already.
- **Create a MongoDB database** either locally or using a cloud service like MongoDB Atlas.
- Obtain the connection URI for your MongoDB database.
5. Set up environment variables:
- **Create a .env** file in the root directory of the backend.
- **Add the MongoDB connection URI** to the .env file as MONGODB_URI=your_connection_uri.
- Add other **necessary environment** variables to the .env file (e.g., API keys, secrets).
6. Start the backend server using **npm start** in the backend directory.

```bash
  npm install
  npm start
```

### Frontend

1. Clone the frontend repository.
2. Navigate to the frontend project directory.
3. Run **npm install** to install the dependencies listed in **package.json.**
4. Start the server using **npm start.**

```bash
  npm install
  npm start
```






## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/)
. Feel free to use, modify, and distribute this code as per the terms of the license.
