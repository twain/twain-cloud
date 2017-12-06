# TWAIN Cloud
Reference implementation of TWAIN Cloud specification.

## Setting up dev environment
It is possible to run a "local" version of TWAIN Cloud, hosted on your own AWS account. Here is the steps:

 - Register [AWS account](https://aws.amazon.com/) and [configure CLI appropriatelly](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)
 - Clone TWAIN Cloud repository
 - Run ```npm install``` to download all necessary dependencies
 - Run ```npm run deploy``` to build and deploy the project
 
Once deployed, you will be provided with AWS endpoints for TWAIN Cloud API methods. Use them to call the APIs directly, or configure [TWAIN Cloud Postman Collection](https://www.getpostman.com/collections/a3edceb5eeaa17e92167) to use your base URLs.
 
 
