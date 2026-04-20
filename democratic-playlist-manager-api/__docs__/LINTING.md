# Formatting Standards

This project uses [ESLint](https://eslint.org/) for linting and follows AirBnB's Style Guide. Also, [ESLint Prettier plugin](https://github.com/prettier/eslint-plugin-prettier) is applied so Prettier suggestions are treated as ESLint errors. It is preferable to install ESLint extension/plugin in your favorite IDE so linting is made easy

## Visual Studio Code

In Visual Studio Code there is a [ESLint extesion](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) that may be installed. Errors will show in the Problems panel

## For Windows Users

Line breaks on windows consist of CRLF control characters whereas on Linux they consist of LF only. Most Windows users will checkout Windows-style and commit Linux-style which means that ESLint will complain of all project's line-breaks. Avoiding that can be done by either configuring Git to checkout projects Linux-style or by mainting Windows-style checkout but replacing .eslintrc on your local environment:

* Original:

```json
{
  "extends": ["airbnb", "prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": ["error"]
  }
}
```

* New:

```json
{
  "extends": ["airbnb", "prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": [
      "error",
      {
        "endOfLine": "auto",
      }
    ]
  }
}
```

Ensure not to commit this change
