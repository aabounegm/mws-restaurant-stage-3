# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 2

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality. 

### What do I do from here?

1. Fork and clone the [server repository](https://github.com/udacity/mws-restaurant-stage-2). You’ll use this development server to develop your project code.
2. Change the data source for your restaurant requests to pull JSON from the server, parse the response and use the response to generate the site UI.
3. Cache the JSON responses for offline use by using the IndexedDB API.
4. Follow the recommendations provided by Lighthouse to achieve the required performance targets.

### Running the project

There are a few options to run the website. First install all dependencies using `npm install`, and then:

1- Either run `gulp build`, which will only run the build process once and just output the files, and then
- run `gulp webserver`, or
- run `python -m http.server 8000` if using python3, or `python -m SimpleHTTPServer 8000` for python2, or
- use a web server of your choice

2- Or run just `gulp`, which will run everything in a development environment and listen for changes in files,

3- Or run `gulp --env production` which will run the same tasks and listen for changes, but in a production environment, which will minify JS and CSS. This is recommended for final testing before releasing.

And then access the website on <localhost:8000>

_Note: you will need to install GraphicsMagick if you intend to use the `imagemin` task in gulp_