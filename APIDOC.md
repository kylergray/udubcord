# *University of Washington Discord Directory* API Documentation
This API houses a directory of discord servers for UW courses, clubs, and more!
With this API You can get filter types, discord servers for certain parameters,
as well as upload new discord servers!

## *GET Search Parameters*
**Request Format:** /searchParameters

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Gets the parameters you can use to search the API for discord
servers with

**Example Request:** /searchParameters

**Example Response:**

```json
{
  "coursePrefixes": [
    "any",
    "AA",
    "AIS",
    "ARCH",
  ]
  "parameters": [
    "serverTypes",
    "coursePrefixes"
  ]
  "serverTypes": [
    "any",
    "community",
    "course",
    "rso"
  ]
}
```

**Error Handling:**
- N/A

## *POST Search Servers*
**Request Format:** /search \<FormData parameters\>

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Can be used to get json information on the servers which match the given parameters using FormData. These parameters include the prefix and type.

**Example Request:** /search \<FormData 'serverType': 'course', 'coursePrefix': 'AA'\>

**Example Response:**

```json
[
  {
    "link": "https://discord.gg/cMAJf3ZuEd",
    "name": "ASTR 101",
    "prefix": "ASTR",
    "type": "course"
  },
  {
    "link": "https://discord.gg/cMAJf3ZuEd",
    "name": "ASTR 101",
    "prefix": "ASTR",
    "type": "course"
  },
  {
    "link": "https://discord.gg/cMAJf3ZuEd",
    "name": "ASTR 101",
    "prefix": "ASTR",
    "type": "course"
  }
]
```

**Error Handling:**
- N/A


## *POST Submit Server*
**Request Format:** /submit \<FormData parameters\>

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Can be used to submit new discord servers. If the submitted server passes all validation, it will be saved to be viewed by other users.

**Example Request:** /search \<FormData 'name': 'CSE 154', 'link': 'https://discord.gg/10charcode', 'type': 'course', 'prefix': 'AA'\>

**Example Response:**

```
Your server has been added!
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If passed in an invalid link, returns an error with the message: `Bad Link, please match the format https://discord.gg/10charcode`
  - If passed in an invalid prefix, returns an error with the message: `Bad Prefix, please match the format CODE`
  - If passed in an invalid type, returns an error with the message: `Bad Type, please choose from the following types <lists types>`
  - If passed in a server name that already exists, returns an error with the message: `A server with that name already exists!`
  - If passed in a server link that already exists, returns an error with the message: `A server with that link already exists!`
