# Spec driven development

This project is being built using a spec driven development, this term is not quite defined yet and can be very shady, however for the current use case, spec driven development is defined as: there will be user stories defining the behaviour of a feature and this will be user driven, i. e., each story won't bring details on the implementation, but rather it will be describing the expected behaviour from the target user. The developer (and AI agents) will follow guidelines (steering files and documentation) to achieve the solution, being somewhat free to find good solutions among the possibilities. The developer will be responsible for iterectively lead the AI agents to build the best solution possible

Notice that those stories do not target specific modules of the project for the most part (unless there is a specific reason for that), but rather defines how an user would like to interact with the application, it is the developer along with the AI agents responsability to read the specification and then identify what is required from each module. For example: a story may be defined as 

```
Business justification

The purpose of having a native registration is to allow users without service accounts or users that do not want to register using other services (for whatever reason) to easily become invitees

Acceptance Criteria

AC. 1: An unauthenticated user can register using native method

Given an unauthenticated user
And an unregistered valid email
And a valid password
When user tries to register
Then the user is registered successfully

AC. 2: An unauthenticated user cannot register using existing email

Given an unauthenticated user
And a registered email
And a valid password
When user tries to register
Then the user is not registered 

AC. 3: An unauthenticated user cannot register using native method with invalid credentials

      	AC. 3.1: Invalid email format
      
      	Given an unauthenticated user
      	And an unregistered email
      	And a valid password
      	When user tries to register
      	Then the user is not registered
      
      	AC. 3.2: Invalid password format
      
      	Given an unauthenticated user
      	And an unregistered email
      	And an invalid password
      	When user tries to register
      	Then the user is not registered

Note 1: A password is said to be valid if it matches the following criteria:

    At least 8 characters long
    Contains numbers and letters
    Contains at least one special character: !@#$%¨&

Note 2: An email is said to be valid if it follows the format [string]@[string].[string]
```

there is no mention to what modules will be touched. The developer must direct the AI agent that the `api` and the `web` sub-projects will be worked on. What changes will be exactly required is part of AI's job with support and review from the developer