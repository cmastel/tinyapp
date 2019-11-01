# TinyApp

A full stack web app built with Node and Express that allows users to shorten long URLs (i.e. bit.ly).

## Final Product

![urls screenshot](/images/urls.jpeg)

![show screenshot](/images/show.jpeg)

## Purpose

**_BEWARE:_ This project was published for learning purposes. It is _not_ intended for use in production-grade software.**

This project was created and published by me as part of my learnings at Lighthouse Labs. 

## Usage

### Key Features

* Users can register and login - passwords are hashed for storage
* Encrypted cookies are issued to the user to ensure handle permissions around the site
* method-override is utilized to ensure the proper HTTP methods are implemented
* Each page for a given shortURL shows:
  * The number of times the shortURL has been used
  * The number of unique visitors who have used the shortURL
  * The date the shortURL was created

### Install

Fork and Clone from the following Github repository:
`https://github.com/cmastel/tinyapp`

### Dependencies

* Node.js
* Express
* EJS
* cookie-session
* body-parser
* bcrypt
* method-override

### Getting Started

* `npm install` to install all dependencies
* Run the development web server using `node express_server.js`
* Open `localhost:8080/urls` in your browser


