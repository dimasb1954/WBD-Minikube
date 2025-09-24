# API Documentation

## Table of Contents



## Introduction

The main structure of API fetched from backend:
    
```json
{
  "success": true,
  "message": "Success",
  "body": {
    
  }
}
```

## API Error Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## JWT Token API Response Code
- 0: Success/token valid
- 1: No token provided
- 2: Token expired
- 3: Token invalid/manipulated
- 4: Token created
- 5: Token not created
- 6: Server error