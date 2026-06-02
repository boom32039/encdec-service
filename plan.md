Please provide accesible repo of Nest JS project that serve below requirements

Non Functional Requirement:
- Unit test- Http Server with Nest JS Framework
- Swagger for API Document /api-docs
- How to start service

Given:
 API Service has following configuration
         - Public and Private key generated from 
         

         
         - Rest API Spec
    
    POST /get-encrypt-data
       BODY {
           payload: "string | required | 0 - 2000 characters"
       }
       Response {
           successful: bool,
           error_code: "string",
           data: null | {
               data1: "string"
               data2: "string"
           }
       }

    POST /get-decrypt-data
       BODY {
           data1: "string | required",
           data2: "string | required"
       }
       Response {
           successful: bool,
           error_code: "string",
           data: null | {
               payload: "string"
           }
       }

