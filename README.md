Inventory Management System



A full-stack Inventory Management System designed to manage products, stock levels, and inventory operations efficiently.

The project is built using Spring Boot for the backend, React (Vite) for the frontend, and MySQL for persistent data storage, following clean project structure and industry best practices.



Features



Product management (add, update, delete, view)



Inventory tracking



Persistent data storage using MySQL



Real-time data interaction between frontend and backend



RESTful API architecture



Clean separation of frontend and backend



Maven \& Node-based dependency management



Tech Stack

Backend



Java



Spring Boot



Spring Data JPA



Maven



REST APIs



Frontend



React



Vite



Tailwind CSS



JavaScript (ES6+)



Database



MySQL



Tools \& Others



Git \& GitHub



npm



VS Code / Eclipse / IntelliJ



Project Structure

Inventory\_Management\_System

│

├── inventory-management-backend

│   ├── src

│   ├── pom.xml

│   └── mvnw

│

├── inventory-management-frontend

│   ├── src

│   ├── public

│   ├── package.json

│   └── vite.config.js

│

└── README.md



How to Run the Project

Prerequisites



Java 17+



Maven



Node.js \& npm



MySQL Server



Git



Database Setup (MySQL)



Start the MySQL server



Create a database:



CREATE DATABASE inventory\_db;





Update application.properties in the backend:



spring.datasource.url=jdbc:mysql://localhost:3306/inventory\_db

spring.datasource.username=YOUR\_USERNAME

spring.datasource.password=YOUR\_PASSWORD

spring.jpa.hibernate.ddl-auto=update



Run Backend (Spring Boot)

cd inventory-management-backend

mvn spring-boot:run





Backend will start at:

http://localhost:8080



Run Frontend (React)

cd inventory-management-frontend

npm install

npm run dev





Frontend will start at:

http://localhost:5173



API \& Frontend Integration



The frontend communicates with the backend using REST APIs



The backend handles business logic and database operations



MySQL is used for storing and retrieving inventory data



The frontend focuses on UI rendering and user interaction



Learning Outcomes



This project helped me gain hands-on experience with:



Full-stack application development



REST API design



Spring Boot project structuring



MySQL integration using Spring Data JPA



React component-based architecture



Git \& GitHub best practices



Clean code and modular development

