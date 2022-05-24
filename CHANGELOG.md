#Changelog:

## [1.7.0]
### Server
- Use new gRPC library which allows using Alpine container
- Configurable login expiration
- Changed to authcode method with exchange for access token authentication

### Client
- Updated for new Google Sign In 
- Gracefully handle login expiration, prompting to login again vs. 401 error
- 

### Build
- Move to Alpine smaller container image
- Uses commit short SHA in version suffix  
- Refactor build to use full yaml declarative instead of shell script
- Fix build timeout failures by adding a top level timeout
