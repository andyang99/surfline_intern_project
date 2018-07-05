# Surfline Internship Interview Project

A simple web application that uses websockets to recieve, store, and broadcast buoy data.
The data is recieved and sent in the JSON-RPC format.

## Getting Started

This is a Node.js web application. After Node is installed, the user should switch to the
appropiate directory in their terminal, and run the application with the "node app" command.

### Prerequisites

Besides Node.js itself, there are several dependencies for this application. These can be found in
the "package.json" file.

They are listed here as well:
ejs 2.6.1: http://ejs.co/
express 4.16.3: https://expressjs.com/
express-ws 4.0.0: https://www.npmjs.com/package/express-ws


## Testing

This application was tested with the tool linked here:
https://www.surfline.com/careers/engineers/take-home-projects/buoys-tests/start.html#

To access the application, enter "http://localhost:8080/" into your browser.

To test the buoy condition map feature, the page should be refreshed after data is uploaded
to the server. The buoys will then display themselves as markers. If the user clicks on the marker,
he/she will see the condition of the buoy. (poor, fair, good).


## Acknowledgments

Thank you to Drew Newberry for answering my questions throughout the process.
