# API conventions

This API follows a REST API standard, therefore HTTP status codes are used to provide quick meaning of the result of an operation. The body brings more detailed information

All connections will be done via HTTPS

## Response body

An error response body will always be of the format:

```json
{
  "timestamp": "[ISO 8601 timestamp]",
  "errorMessage": "[Reason for which the error happened. This should be human readable which will allow for easy debugging]"
}
```

It is important to note that sensitive information won't be ever sent in fields such as "errorMessage" as that would be a security flaw. This is totally true for 5xx errors, but it holds for 4xx errors
