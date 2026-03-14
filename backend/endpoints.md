---
title: Threadmind API v1.0.0
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
highlight_theme: darkula
headingLevel: 2

---

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="threadmind-api">ThreadMind API v1.0.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

API for authentication, account integrations, dataset management, email access, secret storage, Telegram ingestion, and NLP workflows.

# Authentication

- oAuth2 authentication. 

    - Flow: password

    - Token URL = [auth/login](auth/login)

|Scope|Scope Description|
|---|---|

<h1 id="mail-final-api-default">Default</h1>

## read_root__get

<a id="opIdread_root__get"></a>

> Code samples

```shell
# You can also use wget
curl -X GET / \
  -H 'Accept: application/json'

```

```http
GET / HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get '/',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('/', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','/', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /`

*Read Root*

Return a basic health response for the API.

Authentication:
    Not required.

Request Body:
    None.

Returns:
    message: str - Human-readable status message.
    success: bool - True when the API process is reachable.

> Example responses

> 200 Response

```json
null
```

<h3 id="read_root__get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="read_root__get-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="mail-final-api-auth">auth</h1>

## google_callback_auth_callback_get

<a id="opIdgoogle_callback_auth_callback_get"></a>

> Code samples

```shell
# You can also use wget
curl -X GET /auth/callback?code=string&state=string \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
GET /auth/callback?code=string&state=string HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/callback?code=string&state=string',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.get '/auth/callback',
  params: {
  'code' => 'string',
'state' => 'string'
}, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.get('/auth/callback', params={
  'code': 'string',  'state': 'string'
}, headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','/auth/callback', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/auth/callback?code=string&state=string");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/auth/callback", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /auth/callback`

*Google Callback*

Complete the provider callback flow and redirect to the frontend.

Authentication:
    Required.

Request Body:
    None.
    Query Params:
        code: str - Provider authorization code.
        state: str - Anti-forgery state token.

Returns:
    redirect_url: str - Frontend URL after provider callback processing.

<h3 id="google_callback_auth_callback_get-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|code|query|string|true|none|
|state|query|string|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="google_callback_auth_callback_get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="google_callback_auth_callback_get-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## telegram_start_form_auth_telegram_start_form_get

<a id="opIdtelegram_start_form_auth_telegram_start_form_get"></a>

> Code samples

```shell
# You can also use wget
curl -X GET /auth/telegram/start_form?state=string \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
GET /auth/telegram/start_form?state=string HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/telegram/start_form?state=string',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.get '/auth/telegram/start_form',
  params: {
  'state' => 'string'
}, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.get('/auth/telegram/start_form', params={
  'state': 'string'
}, headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','/auth/telegram/start_form', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/auth/telegram/start_form?state=string");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/auth/telegram/start_form", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /auth/telegram/start_form`

*Telegram Start Form*

Return the initial Telegram authentication form state.

Authentication:
    Required.

Request Body:
    None.
    Query Params:
        state: str - Temporary auth state token.

Returns:
    state: str - Echoed/validated flow state.
    start payload: dict - Values required by the next Telegram auth step.

<h3 id="telegram_start_form_auth_telegram_start_form_get-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|state|query|string|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="telegram_start_form_auth_telegram_start_form_get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="telegram_start_form_auth_telegram_start_form_get-responseschema">Response Schema</h3>

Status Code **200**

*Response Telegram Start Form Auth Telegram Start Form Get*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## telegram_start_auth_telegram_start_post

<a id="opIdtelegram_start_auth_telegram_start_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /auth/telegram/start \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /auth/telegram/start HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "state": "string",
  "api_id": 0,
  "api_hash": "string",
  "phone_number": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/telegram/start',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/auth/telegram/start',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/auth/telegram/start', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/auth/telegram/start', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/auth/telegram/start");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/auth/telegram/start", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /auth/telegram/start`

*Telegram Start*

Start the Telegram authentication flow for a user account.

Authentication:
    Required.

Request Body:
    state: str - Temporary auth state token.
    api_id: int - Telegram application API ID.
    api_hash: str - Telegram application API hash.
    phone_number: str - Target Telegram phone number.

Returns:
    auth_step: str - Current flow status.
    state: str - State token to continue verification.
    details: dict - Additional provider instructions for the client.

> Body parameter

```json
{
  "state": "string",
  "api_id": 0,
  "api_hash": "string",
  "phone_number": "string"
}
```

<h3 id="telegram_start_auth_telegram_start_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[TelegramAuthStartRequest](#schematelegramauthstartrequest)|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="telegram_start_auth_telegram_start_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="telegram_start_auth_telegram_start_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Telegram Start Auth Telegram Start Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## telegram_relogin_auth_telegram_relogin_post

<a id="opIdtelegram_relogin_auth_telegram_relogin_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /auth/telegram/relogin \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /auth/telegram/relogin HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "account_id": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/telegram/relogin',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/auth/telegram/relogin',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/auth/telegram/relogin', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/auth/telegram/relogin', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/auth/telegram/relogin");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/auth/telegram/relogin", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /auth/telegram/relogin`

*Telegram Relogin*

Restart authentication for an existing Telegram account.

Authentication:
    Required.

Request Body:
    account_id: int - Telegram account identifier to reconnect.

Returns:
    auth_step: str - Current relogin status.
    state: str - State token to continue verification.
    details: dict - Additional provider instructions for the client.

> Body parameter

```json
{
  "account_id": 0
}
```

<h3 id="telegram_relogin_auth_telegram_relogin_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[TelegramAuthReloginRequest](#schematelegramauthreloginrequest)|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="telegram_relogin_auth_telegram_relogin_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="telegram_relogin_auth_telegram_relogin_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Telegram Relogin Auth Telegram Relogin Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## telegram_verify_auth_telegram_verify_post

<a id="opIdtelegram_verify_auth_telegram_verify_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /auth/telegram/verify \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /auth/telegram/verify HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "state": "string",
  "code": "string",
  "password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/telegram/verify',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/auth/telegram/verify',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/auth/telegram/verify', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/auth/telegram/verify', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/auth/telegram/verify");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/auth/telegram/verify", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /auth/telegram/verify`

*Telegram Verify*

Verify a Telegram login attempt and persist the connected account.

Authentication:
    Required.

Request Body:
    state: str - Temporary auth state token.
    code: str - Verification code received from Telegram.
    password: str | None - 2FA password when required.

Returns:
    account_id: int - Linked account identifier.
    provider_id: str - Provider name for this account.
    account label fields: str - Display metadata returned by AccountFront.

> Body parameter

```json
{
  "state": "string",
  "code": "string",
  "password": "string"
}
```

<h3 id="telegram_verify_auth_telegram_verify_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[TelegramAuthVerifyRequest](#schematelegramauthverifyrequest)|true|none|

> Example responses

> 200 Response

```json
{
  "account_id": 0,
  "user_id": 0,
  "email": "string",
  "email_provider_id": "string",
  "provider_type": "EMAIL",
  "need_to_login": false,
  "inbox_count": 0
}
```

<h3 id="telegram_verify_auth_telegram_verify_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[AccountFront](#schemaaccountfront)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## login_route_user_login_post

<a id="opIdlogin_route_user_login_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /user/login \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST /user/login HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "username": "string",
  "password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/user/login',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post '/user/login',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('/user/login', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/user/login', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/user/login");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/user/login", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /user/login`

*Login Route*

Authenticate a local user and create a session cookie.

Authentication:
    Not required.

Request Body:
    username: str - Local account username.
    password: str - Local account password.

Returns:
    user_id: int - Authenticated user identifier.
    username: str - Authenticated username.
    Cookie side effect: sets user_token on the response.

> Body parameter

```json
{
  "username": "string",
  "password": "string"
}
```

<h3 id="login_route_user_login_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[UserLoginRequest](#schemauserloginrequest)|true|none|

> Example responses

> 200 Response

```json
{
  "user_id": 0,
  "username": "string"
}
```

<h3 id="login_route_user_login_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[User_Front](#schemauser_front)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="success">
This operation does not require authentication
</aside>

## register_route_user_register_post

<a id="opIdregister_route_user_register_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /user/register \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST /user/register HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "username": "string",
  "password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/user/register',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post '/user/register',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('/user/register', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/user/register', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/user/register");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/user/register", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /user/register`

*Register Route*

Register a local user and create a session cookie.

Authentication:
    Not required.

Request Body:
    username: str - Desired local account username.
    password: str - Desired local account password.

Returns:
    user_id: int - Newly created user identifier.
    username: str - Created username.
    Cookie side effect: sets user_token on the response.

> Body parameter

```json
{
  "username": "string",
  "password": "string"
}
```

<h3 id="register_route_user_register_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[UserLoginRequest](#schemauserloginrequest)|true|none|

> Example responses

> 200 Response

```json
{
  "user_id": 0,
  "username": "string"
}
```

<h3 id="register_route_user_register_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[User_Front](#schemauser_front)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="success">
This operation does not require authentication
</aside>

## read_user_me_user_me_get

<a id="opIdread_user_me_user_me_get"></a>

> Code samples

```shell
# You can also use wget
curl -X GET /user/me \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
GET /user/me HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/user/me',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.get '/user/me',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.get('/user/me', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','/user/me', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/user/me");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/user/me", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /user/me`

*Read User Me*

Return the currently authenticated user.

Authentication:
    Required.

Request Body:
    None.

Returns:
    user_id: int - Authenticated user identifier.
    username: str - Authenticated username.

> Example responses

> 200 Response

```json
{
  "user_id": 0,
  "username": "string"
}
```

<h3 id="read_user_me_user_me_get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[User_Front](#schemauser_front)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## logout_user_logout_post

<a id="opIdlogout_user_logout_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /user/logout \
  -H 'Accept: application/json'

```

```http
POST /user/logout HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/user/logout',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.post '/user/logout',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.post('/user/logout', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/user/logout', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/user/logout");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/user/logout", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /user/logout`

*Logout*

Clear the local session cookie and redirect to the frontend.

Authentication:
    Not required.

Request Body:
    None.

Returns:
    redirect_url: str - Frontend URL target.
    Cookie side effect: removes user_token from the response.

> Example responses

> 200 Response

```json
null
```

<h3 id="logout_user_logout_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="logout_user_logout_post-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="mail-final-api-account">account</h1>

## add_account_provider_route_account_login_with_provider_post

<a id="opIdadd_account_provider_route_account_login_with_provider_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /account/login_with_provider \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /account/login_with_provider HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "provider_id": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/account/login_with_provider',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/account/login_with_provider',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/account/login_with_provider', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/account/login_with_provider', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/account/login_with_provider");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/account/login_with_provider", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /account/login_with_provider`

*Add Account Provider Route*

Create a provider login URL for the authenticated user.

Authentication:
    Required.

Request Body:
    provider_id: str - Account provider identifier to connect (for example, gmail or telegram).

Returns:
    redirect_url: str - Provider login URL for the authenticated user.

> Body parameter

```json
{
  "provider_id": "string"
}
```

<h3 id="add_account_provider_route_account_login_with_provider_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AccountProviderRequest](#schemaaccountproviderrequest)|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="add_account_provider_route_account_login_with_provider_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="add_account_provider_route_account_login_with_provider_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Add Account Provider Route Account Login With Provider Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_user_accounts_route_account_get_user_accounts_post

<a id="opIdget_user_accounts_route_account_get_user_accounts_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /account/get_user_accounts \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /account/get_user_accounts HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/account/get_user_accounts',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/account/get_user_accounts',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/account/get_user_accounts', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/account/get_user_accounts', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/account/get_user_accounts");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/account/get_user_accounts", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /account/get_user_accounts`

*Get User Accounts Route*

List the connected accounts for the authenticated user.

Authentication:
    Required.

Request Body:
    None.

Returns:
    items: list[AccountFront] - Connected accounts for the current user.

> Example responses

> 200 Response

```json
[
  {
    "account_id": 0,
    "user_id": 0,
    "email": "string",
    "email_provider_id": "string",
    "provider_type": "EMAIL",
    "need_to_login": false,
    "inbox_count": 0
  }
]
```

<h3 id="get_user_accounts_route_account_get_user_accounts_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="get_user_accounts_route_account_get_user_accounts_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Get User Accounts Route Account Get User Accounts Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|Response Get User Accounts Route Account Get User Accounts Post|[[AccountFront](#schemaaccountfront)]|false|none|none|
|» AccountFront|[AccountFront](#schemaaccountfront)|false|none|none|
|»» account_id|integer|true|none|none|
|»» user_id|integer|true|none|none|
|»» email|string|true|none|none|
|»» email_provider_id|string|true|none|none|
|»» provider_type|string|false|none|none|
|»» need_to_login|boolean|false|none|none|
|»» inbox_count|integer|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## delete_ds_account_delete_account_post

<a id="opIddelete_ds_account_delete_account_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /account/delete_account \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /account/delete_account HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "account_id": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/account/delete_account',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/account/delete_account',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/account/delete_account', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/account/delete_account', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/account/delete_account");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/account/delete_account", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /account/delete_account`

*Delete Ds*

Delete one connected account owned by the current user.

Authentication:
    Required.

Request Body:
    account_id: int - Connected account identifier to delete.

Returns:
    success: bool - True when the account is deleted.

> Body parameter

```json
{
  "account_id": 0
}
```

<h3 id="delete_ds_account_delete_account_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AccountRequest](#schemaaccountrequest)|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="delete_ds_account_delete_account_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="delete_ds_account_delete_account_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Delete Ds Account Delete Account Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

<h1 id="mail-final-api-dataset">dataset</h1>

## get_user_datasets_route_dataset_get_user_datasets_post

<a id="opIdget_user_datasets_route_dataset_get_user_datasets_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /dataset/get_user_datasets \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /dataset/get_user_datasets HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/dataset/get_user_datasets',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/dataset/get_user_datasets',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/dataset/get_user_datasets', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/dataset/get_user_datasets', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/dataset/get_user_datasets");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/dataset/get_user_datasets", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /dataset/get_user_datasets`

*Get User Datasets Route*

List the datasets available to the current user.

Authentication:
    Required.

Request Body:
    None.

Returns:
    items: list - Datasets available to the current user, including public datasets.

> Example responses

> 200 Response

```json
null
```

<h3 id="get_user_datasets_route_dataset_get_user_datasets_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="get_user_datasets_route_dataset_get_user_datasets_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_ds_content_route_dataset_get_ds_content_post

<a id="opIdget_ds_content_route_dataset_get_ds_content_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /dataset/get_ds_content \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /dataset/get_ds_content HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "dataset_id": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/dataset/get_ds_content',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/dataset/get_ds_content',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/dataset/get_ds_content', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/dataset/get_ds_content', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/dataset/get_ds_content");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/dataset/get_ds_content", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /dataset/get_ds_content`

*Get Ds Content Route*

Return the content stored in one dataset.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier to read.

Returns:
    content: list - Dataset entries. Shape depends on dataset type (for example EmailFront or DatasetMessages).

> Body parameter

```json
{
  "dataset_id": 0
}
```

<h3 id="get_ds_content_route_dataset_get_ds_content_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[DsRequest](#schemadsrequest)|true|none|

> Example responses

> 200 Response

```json
[
  {
    "email_id": "string",
    "subject": "string",
    "sender_signature": "string",
    "sender_email": "string",
    "date": "string",
    "content_clean": "string",
    "contains_attachement": false,
    "flags": [
      "string"
    ],
    "language": "en"
  }
]
```

<h3 id="get_ds_content_route_dataset_get_ds_content_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_ds_content_route_dataset_get_ds_content_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Get Ds Content Route Dataset Get Ds Content Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|Response Get Ds Content Route Dataset Get Ds Content Post|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[[EmailFront](#schemaemailfront)]|false|none|none|
|»» EmailFront|[EmailFront](#schemaemailfront)|false|none|none|
|»»» email_id|string|true|none|none|
|»»» subject|string|true|none|none|
|»»» sender_signature|string|true|none|none|
|»»» sender_email|string|true|none|none|
|»»» date|string|true|none|none|
|»»» content_clean|string|true|none|none|
|»»» contains_attachement|boolean|false|none|none|
|»»» flags|[string]|false|none|none|
|»»» language|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[[DatasetMessages](#schemadatasetmessages)]|false|none|none|
|»» DatasetMessages|[DatasetMessages](#schemadatasetmessages)|false|none|none|
|»»» message_id|integer|true|none|none|
|»»» entity_id|string|true|none|none|
|»»» entity_name|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» message_date|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» message_text|string|true|none|none|
|»»» message_clean_text|string|true|none|none|
|»»» sender_username|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» emojis|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» tags|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»»» *anonymous*|null|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## save_email_dataset_route_dataset_save_inbox_dataset_post

<a id="opIdsave_email_dataset_route_dataset_save_inbox_dataset_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /dataset/save_inbox_dataset \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /dataset/save_inbox_dataset HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "account_id": 0,
  "criteria": {
    "sender_email": "string",
    "subject": "string",
    "date_from": "string",
    "date_to": "string",
    "only_unseen": false,
    "sort_by": "newest_first"
  },
  "ds_name": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/dataset/save_inbox_dataset',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/dataset/save_inbox_dataset',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/dataset/save_inbox_dataset', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/dataset/save_inbox_dataset', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/dataset/save_inbox_dataset");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/dataset/save_inbox_dataset", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /dataset/save_inbox_dataset`

*Save Email Dataset Route*

Create a dataset from emails selected from one inbox.

Authentication:
    Required.

Request Body:
    account_id: int - Connected account identifier.
    ds_name: str - New dataset name.
    criteria: dict - Inbox filters with sender_email, subject, date_from, date_to, only_unseen, and sort_by.

Returns:
    dataset_id: int - Created dataset identifier.
    dataset_name: str - Created dataset name.
    owner metadata: mixed - Additional DatasetFront fields.

> Body parameter

```json
{
  "account_id": 0,
  "criteria": {
    "sender_email": "string",
    "subject": "string",
    "date_from": "string",
    "date_to": "string",
    "only_unseen": false,
    "sort_by": "newest_first"
  },
  "ds_name": "string"
}
```

<h3 id="save_email_dataset_route_dataset_save_inbox_dataset_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[SaveEmailsDatasetRequest](#schemasaveemailsdatasetrequest)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="save_email_dataset_route_dataset_save_inbox_dataset_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="save_email_dataset_route_dataset_save_inbox_dataset_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## save_messages_dataset_route_dataset_save_messages_dataset_post

<a id="opIdsave_messages_dataset_route_dataset_save_messages_dataset_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /dataset/save_messages_dataset \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /dataset/save_messages_dataset HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "account_id": 0,
  "dataset_name": "string",
  "entity_message_tuples": [
    {
      "entity_id": "string",
      "message_id": "string"
    }
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/dataset/save_messages_dataset',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/dataset/save_messages_dataset',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/dataset/save_messages_dataset', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/dataset/save_messages_dataset', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/dataset/save_messages_dataset");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/dataset/save_messages_dataset", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /dataset/save_messages_dataset`

*Save Messages Dataset Route*

Create a dataset from selected Telegram messages.

Authentication:
    Required.

Request Body:
    account_id: int - Connected Telegram account identifier.
    dataset_name: str - New dataset name.
    entity_message_tuples: list[dict] - Selected pairs of entity_id: str and message_id: str.

Returns:
    dataset_id: int - Created dataset identifier.
    dataset_name: str - Created dataset name.
    owner metadata: mixed - Additional DatasetFront fields.

> Body parameter

```json
{
  "account_id": 0,
  "dataset_name": "string",
  "entity_message_tuples": [
    {
      "entity_id": "string",
      "message_id": "string"
    }
  ]
}
```

<h3 id="save_messages_dataset_route_dataset_save_messages_dataset_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[TelegramSaveDatasetRequest](#schematelegramsavedatasetrequest)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="save_messages_dataset_route_dataset_save_messages_dataset_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="save_messages_dataset_route_dataset_save_messages_dataset_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_html_content_route_dataset_get_html_content_post

<a id="opIdget_html_content_route_dataset_get_html_content_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /dataset/get_html_content \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /dataset/get_html_content HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "dataset_id": 0,
  "email_id": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/dataset/get_html_content',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/dataset/get_html_content',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/dataset/get_html_content', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/dataset/get_html_content', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/dataset/get_html_content");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/dataset/get_html_content", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /dataset/get_html_content`

*Get Html Content Route*

Return the HTML content of one email stored in a dataset.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier that contains the email.
    email_id: str - Email identifier to fetch.

Returns:
    html_content: str - HTML body of the selected dataset email.

> Body parameter

```json
{
  "dataset_id": 0,
  "email_id": "string"
}
```

<h3 id="get_html_content_route_dataset_get_html_content_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[DsEmailRequest](#schemadsemailrequest)|true|none|

> Example responses

> 200 Response

```json
"string"
```

<h3 id="get_html_content_route_dataset_get_html_content_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|string|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_ds_keywords_entities_route_dataset_get_ds_keywords_entities_post

<a id="opIdget_ds_keywords_entities_route_dataset_get_ds_keywords_entities_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /dataset/get_ds_keywords_entities \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /dataset/get_ds_keywords_entities HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "dataset_id": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/dataset/get_ds_keywords_entities',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/dataset/get_ds_keywords_entities',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/dataset/get_ds_keywords_entities', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/dataset/get_ds_keywords_entities', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/dataset/get_ds_keywords_entities");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/dataset/get_ds_keywords_entities", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /dataset/get_ds_keywords_entities`

*Get Ds Keywords Entities Route*

Return extract entities from dataset content.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier to analyze.

Returns:
    entities_descriptions: dict - Keys are entity labels and values are descriptions of the entity labels.
    keywords: dict - keys are entity labels and value is dict with keys the entity text and values list of message ids where the entity was found.

> Body parameter

```json
{
  "dataset_id": 0
}
```

<h3 id="get_ds_keywords_entities_route_dataset_get_ds_keywords_entities_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[DsRequest](#schemadsrequest)|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="get_ds_keywords_entities_route_dataset_get_ds_keywords_entities_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_ds_keywords_entities_route_dataset_get_ds_keywords_entities_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Get Ds Keywords Entities Route Dataset Get Ds Keywords Entities Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## delete_ds_dataset_delete_ds_post

<a id="opIddelete_ds_dataset_delete_ds_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /dataset/delete_ds \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /dataset/delete_ds HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "dataset_id": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/dataset/delete_ds',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/dataset/delete_ds',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/dataset/delete_ds', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/dataset/delete_ds', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/dataset/delete_ds");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/dataset/delete_ds", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /dataset/delete_ds`

*Delete Ds*

Delete a dataset and its related stored files.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier to delete.

Returns:
    success: bool - True when dataset deletion succeeds.

> Body parameter

```json
{
  "dataset_id": 0
}
```

<h3 id="delete_ds_dataset_delete_ds_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[DsRequest](#schemadsrequest)|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="delete_ds_dataset_delete_ds_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="delete_ds_dataset_delete_ds_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Delete Ds Dataset Delete Ds Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

<h1 id="mail-final-api-secrets">secrets</h1>

## save_pollination_key_secretes_save_pollination_key_post

<a id="opIdsave_pollination_key_secretes_save_pollination_key_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /secretes/save_pollination_key \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /secretes/save_pollination_key HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "encrypted_key": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/secretes/save_pollination_key',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/secretes/save_pollination_key',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/secretes/save_pollination_key', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/secretes/save_pollination_key', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/secretes/save_pollination_key");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/secretes/save_pollination_key", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /secretes/save_pollination_key`

*Save Pollination Key*

Validate and store the current user's Pollinations API key.

Authentication:
    Required.

Request Body:
    encrypted_key: str - Client-encrypted provider key payload.

Returns:
    success: bool - True when the key is valid and persisted.

> Body parameter

```json
{
  "encrypted_key": "string"
}
```

<h3 id="save_pollination_key_secretes_save_pollination_key_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AppKey](#schemaappkey)|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="save_pollination_key_secretes_save_pollination_key_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="save_pollination_key_secretes_save_pollination_key_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Save Pollination Key Secretes Save Pollination Key Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## save_huggingface_key_secretes_save_huggingface_key_post

<a id="opIdsave_huggingface_key_secretes_save_huggingface_key_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /secretes/save_huggingface_key \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /secretes/save_huggingface_key HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "encrypted_key": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/secretes/save_huggingface_key',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/secretes/save_huggingface_key',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/secretes/save_huggingface_key', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/secretes/save_huggingface_key', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/secretes/save_huggingface_key");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/secretes/save_huggingface_key", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /secretes/save_huggingface_key`

*Save Huggingface Key*

Validate and store the current user's Hugging Face API key.

Authentication:
    Required.

Request Body:
    encrypted_key: str - Client-encrypted provider key payload.

Returns:
    success: bool - True when the key is valid and persisted.

> Body parameter

```json
{
  "encrypted_key": "string"
}
```

<h3 id="save_huggingface_key_secretes_save_huggingface_key_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AppKey](#schemaappkey)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="save_huggingface_key_secretes_save_huggingface_key_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="save_huggingface_key_secretes_save_huggingface_key_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_saved_keys_secretes_get_saved_keys_post

<a id="opIdget_saved_keys_secretes_get_saved_keys_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /secretes/get_saved_keys \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /secretes/get_saved_keys HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/secretes/get_saved_keys',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/secretes/get_saved_keys',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/secretes/get_saved_keys', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/secretes/get_saved_keys', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/secretes/get_saved_keys");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/secretes/get_saved_keys", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /secretes/get_saved_keys`

*Get Saved Keys*

Return metadata about the currently saved external API keys.

Authentication:
    Required.

Request Body:
    None.

Returns:
    hf_user: dict | None - Hugging Face account metadata if key is valid.
    pollination_user: dict | None - Pollinations account metadata if key is valid.

> Example responses

> 200 Response

```json
null
```

<h3 id="get_saved_keys_secretes_get_saved_keys_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="get_saved_keys_secretes_get_saved_keys_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_rsa_public_key_route_secretes_get_rsa_public_key_get

<a id="opIdget_rsa_public_key_route_secretes_get_rsa_public_key_get"></a>

> Code samples

```shell
# You can also use wget
curl -X GET /secretes/get_rsa_public_key \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
GET /secretes/get_rsa_public_key HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/secretes/get_rsa_public_key',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.get '/secretes/get_rsa_public_key',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.get('/secretes/get_rsa_public_key', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','/secretes/get_rsa_public_key', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/secretes/get_rsa_public_key");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/secretes/get_rsa_public_key", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /secretes/get_rsa_public_key`

*Get Rsa Public Key Route*

Return the RSA public key used to encrypt secrets on the client.

Authentication:
    Required.

Request Body:
    None.

Returns:
    public_key: str - RSA public key used for frontend encryption.

> Example responses

> 200 Response

```json
null
```

<h3 id="get_rsa_public_key_route_secretes_get_rsa_public_key_get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="get_rsa_public_key_route_secretes_get_rsa_public_key_get-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## delete_huggingface_key_route_secretes_delete_huggingface_key_post

<a id="opIddelete_huggingface_key_route_secretes_delete_huggingface_key_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /secretes/delete_huggingface_key \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /secretes/delete_huggingface_key HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/secretes/delete_huggingface_key',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/secretes/delete_huggingface_key',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/secretes/delete_huggingface_key', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/secretes/delete_huggingface_key', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/secretes/delete_huggingface_key");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/secretes/delete_huggingface_key", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /secretes/delete_huggingface_key`

*Delete Huggingface Key Route*

Delete the saved Hugging Face API key for the current user.

Authentication:
    Required.

Request Body:
    None.

Returns:
    success: bool - True when key deletion succeeds.

> Example responses

> 200 Response

```json
{}
```

<h3 id="delete_huggingface_key_route_secretes_delete_huggingface_key_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="delete_huggingface_key_route_secretes_delete_huggingface_key_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Delete Huggingface Key Route Secretes Delete Huggingface Key Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## delete_pollination_key_route_secretes_delete_pollination_key_post

<a id="opIddelete_pollination_key_route_secretes_delete_pollination_key_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /secretes/delete_pollination_key \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /secretes/delete_pollination_key HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/secretes/delete_pollination_key',
{
  method: 'POST',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/secretes/delete_pollination_key',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/secretes/delete_pollination_key', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/secretes/delete_pollination_key', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/secretes/delete_pollination_key");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/secretes/delete_pollination_key", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /secretes/delete_pollination_key`

*Delete Pollination Key Route*

Delete the saved Pollinations API key for the current user.

Authentication:
    Required.

Request Body:
    None.

Returns:
    success: bool - True when key deletion succeeds.

> Example responses

> 200 Response

```json
{}
```

<h3 id="delete_pollination_key_route_secretes_delete_pollination_key_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="delete_pollination_key_route_secretes_delete_pollination_key_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Delete Pollination Key Route Secretes Delete Pollination Key Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

<h1 id="mail-final-api-meta">meta</h1>

## get_login_providers_meta_login_providers_get

<a id="opIdget_login_providers_meta_login_providers_get"></a>

> Code samples

```shell
# You can also use wget
curl -X GET /meta/login_providers \
  -H 'Accept: application/json'

```

```http
GET /meta/login_providers HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/meta/login_providers',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get '/meta/login_providers',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('/meta/login_providers', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','/meta/login_providers', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/meta/login_providers");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/meta/login_providers", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /meta/login_providers`

*Get Login Providers*

List the login providers supported by the application.

Authentication:
    Not required.

Request Body:
    None.

Returns:
    items: list[LoginProviderFront] - Provider entries with id/name/label fields used by the frontend login chooser.

> Example responses

> 200 Response

```json
[
  {
    "id": "string",
    "label": "string",
    "provider_type": "string",
    "auth_flow": "oauth_redirect",
    "icon": "string",
    "start_route": "string",
    "verify_route": "string",
    "relogin_route": "string"
  }
]
```

<h3 id="get_login_providers_meta_login_providers_get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="get_login_providers_meta_login_providers_get-responseschema">Response Schema</h3>

Status Code **200**

*Response Get Login Providers Meta Login Providers Get*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|Response Get Login Providers Meta Login Providers Get|[[LoginProviderFront](#schemaloginproviderfront)]|false|none|none|
|» LoginProviderFront|[LoginProviderFront](#schemaloginproviderfront)|false|none|none|
|»» id|string|true|none|none|
|»» label|string|true|none|none|
|»» provider_type|string|true|none|none|
|»» auth_flow|[AuthFlow](#schemaauthflow)|true|none|none|
|»» icon|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» start_route|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» verify_route|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» relogin_route|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|auth_flow|oauth_redirect|
|auth_flow|staged_credentials|

<aside class="success">
This operation does not require authentication
</aside>

## get_hugging_face_text_models_meta_hugging_face_text_models_get

<a id="opIdget_hugging_face_text_models_meta_hugging_face_text_models_get"></a>

> Code samples

```shell
# You can also use wget
curl -X GET /meta/hugging_face_text_models \
  -H 'Accept: application/json'

```

```http
GET /meta/hugging_face_text_models HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/meta/hugging_face_text_models',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get '/meta/hugging_face_text_models',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('/meta/hugging_face_text_models', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','/meta/hugging_face_text_models', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/meta/hugging_face_text_models");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/meta/hugging_face_text_models", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /meta/hugging_face_text_models`

*Get Hugging Face Text Models*

List available Hugging Face text-generation models.

Authentication:
    Not required.

Request Body:
    None.

Returns:
    items: list[dict] - Model rows, typically including id: str and downloads: int.

> Example responses

> 200 Response

```json
[
  {}
]
```

<h3 id="get_hugging_face_text_models_meta_hugging_face_text_models_get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="get_hugging_face_text_models_meta_hugging_face_text_models_get-responseschema">Response Schema</h3>

Status Code **200**

*Response Get Hugging Face Text Models Meta Hugging Face Text Models Get*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|Response Get Hugging Face Text Models Meta Hugging Face Text Models Get|[object]|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## get_pollination_text_models_meta_pollination_text_models_get

<a id="opIdget_pollination_text_models_meta_pollination_text_models_get"></a>

> Code samples

```shell
# You can also use wget
curl -X GET /meta/pollination_text_models \
  -H 'Accept: application/json'

```

```http
GET /meta/pollination_text_models HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/meta/pollination_text_models',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get '/meta/pollination_text_models',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('/meta/pollination_text_models', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','/meta/pollination_text_models', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/meta/pollination_text_models");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/meta/pollination_text_models", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /meta/pollination_text_models`

*Get Pollination Text Models*

List available Pollinations text-generation models.

Authentication:
    Not required.

Request Body:
    None.

Returns:
    items: list[dict] - Model rows, typically including name: str and pricing metadata.

> Example responses

> 200 Response

```json
[
  {}
]
```

<h3 id="get_pollination_text_models_meta_pollination_text_models_get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="get_pollination_text_models_meta_pollination_text_models_get-responseschema">Response Schema</h3>

Status Code **200**

*Response Get Pollination Text Models Meta Pollination Text Models Get*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|Response Get Pollination Text Models Meta Pollination Text Models Get|[object]|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## get_embedders_meta_embedders_types_get

<a id="opIdget_embedders_meta_embedders_types_get"></a>

> Code samples

```shell
# You can also use wget
curl -X GET /meta/embedders_types \
  -H 'Accept: application/json'

```

```http
GET /meta/embedders_types HTTP/1.1

Accept: application/json

```

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/meta/embedders_types',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => 'application/json'
}

result = RestClient.get '/meta/embedders_types',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': 'application/json'
}

r = requests.get('/meta/embedders_types', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','/meta/embedders_types', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/meta/embedders_types");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/meta/embedders_types", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /meta/embedders_types`

*Get Embedders*

List the embedding providers available to the application.

Authentication:
    Not required.

Request Body:
    None.

Returns:
    items: list[dict] - Embedder definitions including id, label, description, availability, default model, and external model source links.

> Example responses

> 200 Response

```json
{}
```

<h3 id="get_embedders_meta_embedders_types_get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="get_embedders_meta_embedders_types_get-responseschema">Response Schema</h3>

Status Code **200**

*Response Get Embedders Meta Embedders Types Get*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="mail-final-api-gmail">gmail</h1>

## get_inbox_meta_route_email_get_inbox_meta_post

<a id="opIdget_inbox_meta_route_email_get_inbox_meta_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /email/get_inbox_meta \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /email/get_inbox_meta HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "account_id": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/email/get_inbox_meta',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/email/get_inbox_meta',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/email/get_inbox_meta', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/email/get_inbox_meta', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/email/get_inbox_meta");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/email/get_inbox_meta", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /email/get_inbox_meta`

*Get Inbox Meta Route*

Return metadata about the inbox of one connected email account.

Authentication:
    Required.

Request Body:
    account_id: int - Connected account identifier to inspect.

Returns:
    senders_emails: dict[str, str] - Mapping of sender signature to sender email.
    subjects: list[str] - Distinct subjects detected in the inbox sample.
    min_date: str - Oldest email date in the dataset.
    max_date: str - Newest email date in the dataset.
    top_senders: dict[str, int] - Sender frequency summary.

> Body parameter

```json
{
  "account_id": 0
}
```

<h3 id="get_inbox_meta_route_email_get_inbox_meta_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AccountRequest](#schemaaccountrequest)|true|none|

> Example responses

> 200 Response

```json
{
  "senders_emails": {},
  "subjects": [
    "string"
  ],
  "min_date": "string",
  "max_date": "string",
  "top_senders": {}
}
```

<h3 id="get_inbox_meta_route_email_get_inbox_meta_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[InboxMeta](#schemainboxmeta)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_inbox_count_route_email_get_inbox_count_post

<a id="opIdget_inbox_count_route_email_get_inbox_count_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /email/get_inbox_count \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /email/get_inbox_count HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "account_id": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/email/get_inbox_count',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/email/get_inbox_count',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/email/get_inbox_count', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/email/get_inbox_count', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/email/get_inbox_count");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/email/get_inbox_count", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /email/get_inbox_count`

*Get Inbox Count Route*

Return the number of emails in one connected inbox.

Authentication:
    Required.

Request Body:
    account_id: int - Connected account identifier to count.

Returns:
    count: int - Total emails available in the selected inbox.

> Body parameter

```json
{
  "account_id": 0
}
```

<h3 id="get_inbox_count_route_email_get_inbox_count_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AccountRequest](#schemaaccountrequest)|true|none|

> Example responses

> 200 Response

```json
0
```

<h3 id="get_inbox_count_route_email_get_inbox_count_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|integer|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_inbox_criteria_route_email_get_inbox_criteria_post

<a id="opIdget_inbox_criteria_route_email_get_inbox_criteria_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /email/get_inbox_criteria \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /email/get_inbox_criteria HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "account_id": 0,
  "criteria": {
    "sender_email": "string",
    "subject": "string",
    "date_from": "string",
    "date_to": "string",
    "only_unseen": false,
    "sort_by": "newest_first"
  },
  "page_num": 1,
  "num_rows": 50,
  "all": false
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/email/get_inbox_criteria',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/email/get_inbox_criteria',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/email/get_inbox_criteria', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/email/get_inbox_criteria', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/email/get_inbox_criteria");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/email/get_inbox_criteria", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /email/get_inbox_criteria`

*Get Inbox Criteria Route*

List inbox emails for an account using filter and pagination criteria.

Authentication:
    Required.

Request Body:
    account_id: int - Connected account identifier to query.
    criteria: dict - Optional filters with sender_email, subject, date_from, date_to, only_unseen, and sort_by.
    page_num: int - 1-based page number.
    num_rows: int - Page size.
    all: bool - When true, bypass filter criteria.

Returns:
    items: list[EmailFront] - Paginated email items.
    total_count: int - Total items matching the filter.
    page_num: int - Current page number.
    num_rows: int - Current page size.

> Body parameter

```json
{
  "account_id": 0,
  "criteria": {
    "sender_email": "string",
    "subject": "string",
    "date_from": "string",
    "date_to": "string",
    "only_unseen": false,
    "sort_by": "newest_first"
  },
  "page_num": 1,
  "num_rows": 50,
  "all": false
}
```

<h3 id="get_inbox_criteria_route_email_get_inbox_criteria_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[GmailInboxCriteriaRequest](#schemagmailinboxcriteriarequest)|true|none|

> Example responses

> 200 Response

```json
{
  "items": [
    {
      "email_id": "string",
      "subject": "string",
      "sender_signature": "string",
      "sender_email": "string",
      "date": "string",
      "content_clean": "string",
      "contains_attachement": false,
      "flags": [
        "string"
      ],
      "language": "en"
    }
  ],
  "total_count": 0,
  "page_num": 0,
  "num_rows": 0
}
```

<h3 id="get_inbox_criteria_route_email_get_inbox_criteria_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[InboxCriteriaPageResponse](#schemainboxcriteriapageresponse)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_html_content_route_email_get_html_content_post

<a id="opIdget_html_content_route_email_get_html_content_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /email/get_html_content \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /email/get_html_content HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "email_id": "string",
  "account_id": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/email/get_html_content',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/email/get_html_content',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/email/get_html_content', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/email/get_html_content', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/email/get_html_content");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/email/get_html_content", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /email/get_html_content`

*Get Html Content Route*

Return the HTML body of one email from a connected inbox.

Authentication:
    Required.

Request Body:
    account_id: int - Connected account identifier that owns the email.
    email_id: str - Email identifier to fetch.

Returns:
    html_content: str - HTML body of the selected email.

> Body parameter

```json
{
  "email_id": "string",
  "account_id": 0
}
```

<h3 id="get_html_content_route_email_get_html_content_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[EmailRequest](#schemaemailrequest)|true|none|

> Example responses

> 200 Response

```json
"string"
```

<h3 id="get_html_content_route_email_get_html_content_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|string|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

<h1 id="mail-final-api-telegram">telegram</h1>

## get_entities_route_telegram_get_entities_post

<a id="opIdget_entities_route_telegram_get_entities_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /telegram/get_entities \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /telegram/get_entities HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "account_id": 0,
  "limit": 100
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/telegram/get_entities',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/telegram/get_entities',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/telegram/get_entities', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/telegram/get_entities', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/telegram/get_entities");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/telegram/get_entities", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /telegram/get_entities`

*Get Entities Route*

List Telegram chats or entities for a connected account.

Authentication:
    Required.

Request Body:
    account_id: int - Connected Telegram account identifier.
    limit: int - Max entities/chats to return.

Returns:
    items: list[TelegramEntityFront] - Each item typically includes chat_id: str, chat_name: str, and chat_type: str.

> Body parameter

```json
{
  "account_id": 0,
  "limit": 100
}
```

<h3 id="get_entities_route_telegram_get_entities_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[TelegramEntitiesRequest](#schematelegramentitiesrequest)|true|none|

> Example responses

> 200 Response

```json
[
  {
    "chat_id": "string",
    "chat_name": "string",
    "chat_type": "string"
  }
]
```

<h3 id="get_entities_route_telegram_get_entities_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_entities_route_telegram_get_entities_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Get Entities Route Telegram Get Entities Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|Response Get Entities Route Telegram Get Entities Post|[[TelegramEntityFront](#schematelegramentityfront)]|false|none|none|
|» TelegramEntityFront|[TelegramEntityFront](#schematelegramentityfront)|false|none|none|
|»» chat_id|string|true|none|none|
|»» chat_name|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» chat_type|string|true|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_messages_route_telegram_get_messages_post

<a id="opIdget_messages_route_telegram_get_messages_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /telegram/get_messages \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /telegram/get_messages HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "account_id": 0,
  "limit": 500,
  "chat_id": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/telegram/get_messages',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/telegram/get_messages',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/telegram/get_messages', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/telegram/get_messages', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/telegram/get_messages");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/telegram/get_messages", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /telegram/get_messages`

*Get Messages Route*

List messages from one Telegram chat.

Authentication:
    Required.

Request Body:
    account_id: int - Connected Telegram account identifier.
    chat_id: str - Chat identifier to read.
    limit: int - Max messages to return.

Returns:
    items: list[TelegramMessageFront] - Message payloads for the selected chat.

> Body parameter

```json
{
  "account_id": 0,
  "limit": 500,
  "chat_id": "string"
}
```

<h3 id="get_messages_route_telegram_get_messages_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[TelegramMessagesRequest](#schematelegrammessagesrequest)|true|none|

> Example responses

> 200 Response

```json
[
  {
    "message_id": "string",
    "date": "string",
    "text": "string",
    "clean_text": "string",
    "chat_id": "string",
    "sender_id": "string",
    "sender_username": "string",
    "views": 0,
    "forwards": 0,
    "media": true,
    "language": "en"
  }
]
```

<h3 id="get_messages_route_telegram_get_messages_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_messages_route_telegram_get_messages_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Get Messages Route Telegram Get Messages Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|Response Get Messages Route Telegram Get Messages Post|[[TelegramMessageFront](#schematelegrammessagefront)]|false|none|none|
|» TelegramMessageFront|[TelegramMessageFront](#schematelegrammessagefront)|false|none|none|
|»» message_id|string|true|none|none|
|»» date|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» text|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» clean_text|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» chat_id|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» sender_id|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» sender_username|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» views|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|integer|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» forwards|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|integer|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» media|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|boolean|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» language|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_messages_multiple_chats_route_telegram_get_messages_multiple_chats_post

<a id="opIdget_messages_multiple_chats_route_telegram_get_messages_multiple_chats_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /telegram/get_messages_multiple_chats \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /telegram/get_messages_multiple_chats HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "account_id": 0,
  "entities": [
    {
      "chat_id": "123456",
      "limit": 100
    }
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/telegram/get_messages_multiple_chats',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/telegram/get_messages_multiple_chats',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/telegram/get_messages_multiple_chats', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/telegram/get_messages_multiple_chats', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/telegram/get_messages_multiple_chats");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/telegram/get_messages_multiple_chats", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /telegram/get_messages_multiple_chats`

*Get Messages Multiple Chats Route*

List messages from multiple Telegram chats in one request.

Authentication:
    Required.
Request Body:
    account_id: int - Connected Telegram account identifier.
    entities: list[dict] - Each dict containing {chat_id, limit} for the chat to read.
Returns:
    items: list[TelegramMessageFront] - Message payloads for the selected chats.

> Body parameter

```json
{
  "account_id": 0,
  "entities": [
    {
      "chat_id": "123456",
      "limit": 100
    }
  ]
}
```

<h3 id="get_messages_multiple_chats_route_telegram_get_messages_multiple_chats_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[TelegramAnalyzeMessagesRequest](#schematelegramanalyzemessagesrequest)|true|none|

> Example responses

> 200 Response

```json
[
  {
    "message_id": "string",
    "date": "string",
    "text": "string",
    "clean_text": "string",
    "chat_id": "string",
    "sender_id": "string",
    "sender_username": "string",
    "views": 0,
    "forwards": 0,
    "media": true,
    "language": "en"
  }
]
```

<h3 id="get_messages_multiple_chats_route_telegram_get_messages_multiple_chats_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_messages_multiple_chats_route_telegram_get_messages_multiple_chats_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Get Messages Multiple Chats Route Telegram Get Messages Multiple Chats Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|Response Get Messages Multiple Chats Route Telegram Get Messages Multiple Chats Post|[[TelegramMessageFront](#schematelegrammessagefront)]|false|none|none|
|» TelegramMessageFront|[TelegramMessageFront](#schematelegrammessagefront)|false|none|none|
|»» message_id|string|true|none|none|
|»» date|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» text|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» clean_text|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» chat_id|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» sender_id|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» sender_username|any|true|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» views|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|integer|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» forwards|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|integer|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» media|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|boolean|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» language|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## analyze_messages_route_telegram_analyze_messages_post

<a id="opIdanalyze_messages_route_telegram_analyze_messages_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /telegram/analyze_messages \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /telegram/analyze_messages HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "account_id": 0,
  "entities": [
    {
      "chat_id": "123456",
      "limit": 100
    }
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/telegram/analyze_messages',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/telegram/analyze_messages',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/telegram/analyze_messages', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/telegram/analyze_messages', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/telegram/analyze_messages");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/telegram/analyze_messages", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /telegram/analyze_messages`

*Analyze Messages Route*

Analyze entities found in messages from active Telegram chats.

Authentication:
    Required.

Request Body:
    account_id: int - Connected Telegram account identifier.
    entities: List[dict] - Each dict containing {chat_id, limit}

Returns:
    analysis_entities: dict[str, dict[str, list[str]]] - Entity label to entity value to message IDs.
    entities_descriptions: dict[str, str] - Human-readable description per entity label.

> Body parameter

```json
{
  "account_id": 0,
  "entities": [
    {
      "chat_id": "123456",
      "limit": 100
    }
  ]
}
```

<h3 id="analyze_messages_route_telegram_analyze_messages_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[TelegramAnalyzeMessagesRequest](#schematelegramanalyzemessagesrequest)|true|none|

> Example responses

> 200 Response

```json
{}
```

<h3 id="analyze_messages_route_telegram_analyze_messages_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="analyze_messages_route_telegram_analyze_messages_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Analyze Messages Route Telegram Analyze Messages Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_message_media_route_telegram_get_message_media_post

<a id="opIdget_message_media_route_telegram_get_message_media_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /telegram/get_message_media \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /telegram/get_message_media HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "account_id": 0,
  "chat_id": "string",
  "message_id": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/telegram/get_message_media',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/telegram/get_message_media',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/telegram/get_message_media', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/telegram/get_message_media', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/telegram/get_message_media");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/telegram/get_message_media", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /telegram/get_message_media`

*Get Message Media Route*

Return the media attached to one Telegram message.

Authentication:
    Required.

Request Body:
    account_id: int - Connected Telegram account identifier.
    chat_id: str - Chat identifier containing the message.
    message_id: str - Message identifier with media.

Returns:
    Binary response body with media bytes.
    Headers include Content-Type and inline filename via Content-Disposition.

> Body parameter

```json
{
  "account_id": 0,
  "chat_id": "string",
  "message_id": "string"
}
```

<h3 id="get_message_media_route_telegram_get_message_media_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[TelegramMessageMediaRequest](#schematelegrammessagemediarequest)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="get_message_media_route_telegram_get_message_media_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_message_media_route_telegram_get_message_media_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

<h1 id="mail-final-api-nlp">nlp</h1>

## get_important_tokens_nlp_get_important_tokens_post

<a id="opIdget_important_tokens_nlp_get_important_tokens_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /nlp/get_important_tokens \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /nlp/get_important_tokens HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "dataset_id": 0,
  "minimum_gram": 1,
  "maximum_gram": 5,
  "grams_n": 100
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/nlp/get_important_tokens',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/nlp/get_important_tokens',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/nlp/get_important_tokens', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/nlp/get_important_tokens', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/nlp/get_important_tokens");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/nlp/get_important_tokens", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /nlp/get_important_tokens`

*Get Important Tokens*

Return the highest-ranked tokens or n-grams for a dataset.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier to analyze.
    minimum_gram: int | None - Smallest n-gram size.
    maximum_gram: int | None - Largest n-gram size.
    grams_n: int | None - Maximum number of token rows to return.

Returns:
    items: list[dict] - Ranked rows with text: str and value: float.

> Body parameter

```json
{
  "dataset_id": 0,
  "minimum_gram": 1,
  "maximum_gram": 5,
  "grams_n": 100
}
```

<h3 id="get_important_tokens_nlp_get_important_tokens_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[MostImprtantTokensRequest](#schemamostimprtanttokensrequest)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="get_important_tokens_nlp_get_important_tokens_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_important_tokens_nlp_get_important_tokens_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_dataset_keywords_route_nlp_get_dataset_keywords_post

<a id="opIdget_dataset_keywords_route_nlp_get_dataset_keywords_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /nlp/get_dataset_keywords \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /nlp/get_dataset_keywords HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "dataset_id": 0,
  "minimum_gram": 1,
  "maximum_gram": 5,
  "grams_n": 100
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/nlp/get_dataset_keywords',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/nlp/get_dataset_keywords',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/nlp/get_dataset_keywords', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/nlp/get_dataset_keywords', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/nlp/get_dataset_keywords");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/nlp/get_dataset_keywords", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /nlp/get_dataset_keywords`

*Get Dataset Keywords Route*

Return extracted keywords for a dataset.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier to analyze.
    minimum_gram: int | None - Smallest n-gram size.
    maximum_gram: int | None - Largest n-gram size.
    grams_n: int | None - Maximum number of keyword rows to return.

Returns:
    dataset_keywords: list[dict] - Ranked rows with text: str and value: float.

> Body parameter

```json
{
  "dataset_id": 0,
  "minimum_gram": 1,
  "maximum_gram": 5,
  "grams_n": 100
}
```

<h3 id="get_dataset_keywords_route_nlp_get_dataset_keywords_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[MostImprtantTokensRequest](#schemamostimprtanttokensrequest)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="get_dataset_keywords_route_nlp_get_dataset_keywords_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_dataset_keywords_route_nlp_get_dataset_keywords_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_clusters_per_sender_route_nlp_clusters_per_sender_post

<a id="opIdget_clusters_per_sender_route_nlp_clusters_per_sender_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /nlp/clusters_per_sender \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /nlp/clusters_per_sender HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "dataset_id": 0,
  "clustering_algorithm": "string",
  "embedder_type": "string",
  "embedder_model": "string",
  "k_clusters": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/nlp/clusters_per_sender',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/nlp/clusters_per_sender',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/nlp/clusters_per_sender', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/nlp/clusters_per_sender', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/nlp/clusters_per_sender");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/nlp/clusters_per_sender", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /nlp/clusters_per_sender`

*Get Clusters Per Sender Route*

Cluster dataset content separately for top senders.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier to cluster.
    clustering_algorithm: str - Clustering strategy key.
    k_clusters: int | None - Explicit cluster count when required.
    embedder_type: str | None - Embedding backend type.
    embedder_model: str | None - Embedding model name.

Returns:
    items: list[dict] - Sender-level groups.
    sender_signature: str - Sender grouping key.
    num_emails: int - Number of emails in the sender group.
    clusters: list[dict] - Cluster payloads with title and docs.

> Body parameter

```json
{
  "dataset_id": 0,
  "clustering_algorithm": "string",
  "embedder_type": "string",
  "embedder_model": "string",
  "k_clusters": 0
}
```

<h3 id="get_clusters_per_sender_route_nlp_clusters_per_sender_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ClusteringRequest](#schemaclusteringrequest)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="get_clusters_per_sender_route_nlp_clusters_per_sender_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_clusters_per_sender_route_nlp_clusters_per_sender_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_clusters_all_route_nlp_clusters_all_post

<a id="opIdget_clusters_all_route_nlp_clusters_all_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /nlp/clusters_all \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /nlp/clusters_all HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "dataset_id": 0,
  "clustering_algorithm": "string",
  "embedder_type": "string",
  "embedder_model": "string",
  "k_clusters": 0
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/nlp/clusters_all',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/nlp/clusters_all',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/nlp/clusters_all', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/nlp/clusters_all', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/nlp/clusters_all");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/nlp/clusters_all", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /nlp/clusters_all`

*Get Clusters All Route*

Cluster all dataset content into a single clustering result set.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier to cluster.
    clustering_algorithm: str - Clustering strategy key.
    k_clusters: int | None - Explicit cluster count when required.
    embedder_type: str | None - Embedding backend type.
    embedder_model: str | None - Embedding model name.

Returns:
    clusters: list[dict] - Cluster payloads with title and docs for the whole dataset.

> Body parameter

```json
{
  "dataset_id": 0,
  "clustering_algorithm": "string",
  "embedder_type": "string",
  "embedder_model": "string",
  "k_clusters": 0
}
```

<h3 id="get_clusters_all_route_nlp_clusters_all_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ClusteringRequest](#schemaclusteringrequest)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="get_clusters_all_route_nlp_clusters_all_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_clusters_all_route_nlp_clusters_all_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_cluster_title_prompt_route_nlp_get_cluster_title_prompt_post

<a id="opIdget_cluster_title_prompt_route_nlp_get_cluster_title_prompt_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /nlp/get_cluster_title_prompt \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /nlp/get_cluster_title_prompt HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "dataset_id": 0,
  "cluster_docs_ids": [
    "string"
  ],
  "provider": "string",
  "model": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/nlp/get_cluster_title_prompt',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/nlp/get_cluster_title_prompt',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/nlp/get_cluster_title_prompt', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/nlp/get_cluster_title_prompt', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/nlp/get_cluster_title_prompt");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/nlp/get_cluster_title_prompt", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /nlp/get_cluster_title_prompt`

*Get Cluster Title Prompt Route*

Build a prompt and candidate title for a selected cluster.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier.
    cluster_docs_ids: list[str | int] - Document IDs in the target cluster.
    provider: str - Text generation provider key.
    model: str - Provider model name.

Returns:
    keywords: list[tuple[str, float]] - Weighted keywords.
    prompt: str - Generated prompt text.
    title: str - Suggested cluster title.

> Body parameter

```json
{
  "dataset_id": 0,
  "cluster_docs_ids": [
    "string"
  ],
  "provider": "string",
  "model": "string"
}
```

<h3 id="get_cluster_title_prompt_route_nlp_get_cluster_title_prompt_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ClusterPromptTitleRequest](#schemaclusterprompttitlerequest)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="get_cluster_title_prompt_route_nlp_get_cluster_title_prompt_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_cluster_title_prompt_route_nlp_get_cluster_title_prompt_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_group_messages_summary_prompt_route_nlp_get_group_messages_summary_prompt_post

<a id="opIdget_group_messages_summary_prompt_route_nlp_get_group_messages_summary_prompt_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /nlp/get_group_messages_summary_prompt \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /nlp/get_group_messages_summary_prompt HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "dataset_id": 0,
  "cluster_docs_ids": [
    "string"
  ]
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/nlp/get_group_messages_summary_prompt',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/nlp/get_group_messages_summary_prompt',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/nlp/get_group_messages_summary_prompt', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/nlp/get_group_messages_summary_prompt', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/nlp/get_group_messages_summary_prompt");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/nlp/get_group_messages_summary_prompt", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /nlp/get_group_messages_summary_prompt`

*Get Group Messages Summary Prompt Route*

Build the summarization prompt for a group of selected messages.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier.
    cluster_docs_ids: list[str | int] - Message IDs to summarize.

Returns:
    prompt: str - Summarization prompt text.
    input_token_size_estimated: int - Estimated input token count.
    output_token_size_estimated: int - Estimated output token count.

> Body parameter

```json
{
  "dataset_id": 0,
  "cluster_docs_ids": [
    "string"
  ]
}
```

<h3 id="get_group_messages_summary_prompt_route_nlp_get_group_messages_summary_prompt_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[GroupMessagesSummarizePromptRequest](#schemagroupmessagessummarizepromptrequest)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="get_group_messages_summary_prompt_route_nlp_get_group_messages_summary_prompt_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_group_messages_summary_prompt_route_nlp_get_group_messages_summary_prompt_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

## get_group_messages_summary_route_nlp_get_group_messages_summary_post

<a id="opIdget_group_messages_summary_route_nlp_get_group_messages_summary_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /nlp/get_group_messages_summary \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer {access-token}'

```

```http
POST /nlp/get_group_messages_summary HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "dataset_id": 0,
  "cluster_docs_ids": [
    "string"
  ],
  "provider": "string",
  "model": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/nlp/get_group_messages_summary',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'Authorization' => 'Bearer {access-token}'
}

result = RestClient.post '/nlp/get_group_messages_summary',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {access-token}'
}

r = requests.post('/nlp/get_group_messages_summary', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'Authorization' => 'Bearer {access-token}',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/nlp/get_group_messages_summary', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/nlp/get_group_messages_summary");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
        "Authorization": []string{"Bearer {access-token}"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/nlp/get_group_messages_summary", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /nlp/get_group_messages_summary`

*Get Group Messages Summary Route*

Generate a summary for a selected group of messages.

Authentication:
    Required.

Request Body:
    dataset_id: int - Dataset identifier.
    cluster_docs_ids: list[str | int] - Message IDs to summarize.
    provider: str - Text generation provider key.
    model: str - Provider model name.

Returns:
    answer: str - Generated summary.
    input_token_size_estimated: int - Estimated input token count.
    output_token_size_estimated: int - Estimated output token count.

> Body parameter

```json
{
  "dataset_id": 0,
  "cluster_docs_ids": [
    "string"
  ],
  "provider": "string",
  "model": "string"
}
```

<h3 id="get_group_messages_summary_route_nlp_get_group_messages_summary_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ClusterPromptTitleRequest](#schemaclusterprompttitlerequest)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="get_group_messages_summary_route_nlp_get_group_messages_summary_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_group_messages_summary_route_nlp_get_group_messages_summary_post-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
OAuth2PasswordBearer
</aside>

<h1 id="mail-final-api-admin">admin</h1>

## read_user_me_admin_get_all_users_post

<a id="opIdread_user_me_admin_get_all_users_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /admin/get_all_users \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST /admin/get_all_users HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "special_password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/admin/get_all_users',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post '/admin/get_all_users',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('/admin/get_all_users', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/admin/get_all_users', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/admin/get_all_users");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/admin/get_all_users", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /admin/get_all_users`

*Read User Me*

List all users when the admin password is provided.

Authentication:
    Not session-based. Requires the admin special password in the request body.

Request Body:
    special_password: str - Admin password gate.

Returns:
    items: list[User_Front] - Full user list when password is valid.
    [] - Empty list when password is invalid.

> Body parameter

```json
{
  "special_password": "string"
}
```

<h3 id="read_user_me_admin_get_all_users_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AdminRequest](#schemaadminrequest)|true|none|

> Example responses

> 200 Response

```json
[
  {
    "user_id": 0,
    "username": "string"
  }
]
```

<h3 id="read_user_me_admin_get_all_users_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="read_user_me_admin_get_all_users_post-responseschema">Response Schema</h3>

Status Code **200**

*Response Read User Me Admin Get All Users Post*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|Response Read User Me Admin Get All Users Post|[[User_Front](#schemauser_front)]|false|none|none|
|» User_Front|[User_Front](#schemauser_front)|false|none|none|
|»» user_id|integer|true|none|none|
|»» username|string|true|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## read_user_me_admin_delete_user_post

<a id="opIdread_user_me_admin_delete_user_post"></a>

> Code samples

```shell
# You can also use wget
curl -X POST /admin/delete_user \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'

```

```http
POST /admin/delete_user HTTP/1.1

Content-Type: application/json
Accept: application/json

```

```javascript
const inputBody = '{
  "user_id": 0,
  "special_password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/admin/delete_user',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Content-Type' => 'application/json',
  'Accept' => 'application/json'
}

result = RestClient.post '/admin/delete_user',
  params: {
  }, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

r = requests.post('/admin/delete_user', headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('POST','/admin/delete_user', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/admin/delete_user");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("POST");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Content-Type": []string{"application/json"},
        "Accept": []string{"application/json"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("POST", "/admin/delete_user", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`POST /admin/delete_user`

*Read User Me*

Delete a user account when the admin password is provided.

Authentication:
    Not session-based. Requires the admin special password in the request body.

Request Body:
    user_id: int - User identifier to delete.
    special_password: str - Admin password gate.

Returns:
    success: bool - True when deletion succeeds.
    [] - Empty list when password is invalid (current behavior).

> Body parameter

```json
{
  "user_id": 0,
  "special_password": "string"
}
```

<h3 id="read_user_me_admin_delete_user_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[UserDeleteRequest](#schemauserdeleterequest)|true|none|

> Example responses

> 200 Response

```json
true
```

<h3 id="read_user_me_admin_delete_user_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|boolean|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="success">
This operation does not require authentication
</aside>

# Schemas

<h2 id="tocS_AccountFront">AccountFront</h2>
<!-- backwards compatibility -->
<a id="schemaaccountfront"></a>
<a id="schema_AccountFront"></a>
<a id="tocSaccountfront"></a>
<a id="tocsaccountfront"></a>

```json
{
  "account_id": 0,
  "user_id": 0,
  "email": "string",
  "email_provider_id": "string",
  "provider_type": "EMAIL",
  "need_to_login": false,
  "inbox_count": 0
}

```

AccountFront

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|account_id|integer|true|none|none|
|user_id|integer|true|none|none|
|email|string|true|none|none|
|email_provider_id|string|true|none|none|
|provider_type|string|false|none|none|
|need_to_login|boolean|false|none|none|
|inbox_count|integer|false|none|none|

<h2 id="tocS_AccountProviderRequest">AccountProviderRequest</h2>
<!-- backwards compatibility -->
<a id="schemaaccountproviderrequest"></a>
<a id="schema_AccountProviderRequest"></a>
<a id="tocSaccountproviderrequest"></a>
<a id="tocsaccountproviderrequest"></a>

```json
{
  "provider_id": "string"
}

```

AccountProviderRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|provider_id|string|true|none|Provider identifier, such as gmail or telegram.|

<h2 id="tocS_AccountRequest">AccountRequest</h2>
<!-- backwards compatibility -->
<a id="schemaaccountrequest"></a>
<a id="schema_AccountRequest"></a>
<a id="tocSaccountrequest"></a>
<a id="tocsaccountrequest"></a>

```json
{
  "account_id": 0
}

```

AccountRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|account_id|integer|true|none|Identifier of the connected account to target.|

<h2 id="tocS_AdminRequest">AdminRequest</h2>
<!-- backwards compatibility -->
<a id="schemaadminrequest"></a>
<a id="schema_AdminRequest"></a>
<a id="tocSadminrequest"></a>
<a id="tocsadminrequest"></a>

```json
{
  "special_password": "string"
}

```

AdminRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|special_password|string|true|none|Administrative password required to access admin-only endpoints.|

<h2 id="tocS_AppKey">AppKey</h2>
<!-- backwards compatibility -->
<a id="schemaappkey"></a>
<a id="schema_AppKey"></a>
<a id="tocSappkey"></a>
<a id="tocsappkey"></a>

```json
{
  "encrypted_key": "string"
}

```

AppKey

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|encrypted_key|string|true|none|Provider API key encrypted on the client before upload.|

<h2 id="tocS_AuthFlow">AuthFlow</h2>
<!-- backwards compatibility -->
<a id="schemaauthflow"></a>
<a id="schema_AuthFlow"></a>
<a id="tocSauthflow"></a>
<a id="tocsauthflow"></a>

```json
"oauth_redirect"

```

AuthFlow

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|AuthFlow|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|AuthFlow|oauth_redirect|
|AuthFlow|staged_credentials|

<h2 id="tocS_ClusterPromptTitleRequest">ClusterPromptTitleRequest</h2>
<!-- backwards compatibility -->
<a id="schemaclusterprompttitlerequest"></a>
<a id="schema_ClusterPromptTitleRequest"></a>
<a id="tocSclusterprompttitlerequest"></a>
<a id="tocsclusterprompttitlerequest"></a>

```json
{
  "dataset_id": 0,
  "cluster_docs_ids": [
    "string"
  ],
  "provider": "string",
  "model": "string"
}

```

ClusterPromptTitleRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|dataset_id|integer|true|none|Identifier of the dataset that owns the selected cluster documents.|
|cluster_docs_ids|any|true|none|Identifiers of the documents that belong to the cluster.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[string]|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[integer]|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|provider|string|true|none|Text-generation provider used to build the prompt or title.|
|model|string|true|none|Provider model name used for prompt or title generation.|

<h2 id="tocS_ClusteringRequest">ClusteringRequest</h2>
<!-- backwards compatibility -->
<a id="schemaclusteringrequest"></a>
<a id="schema_ClusteringRequest"></a>
<a id="tocSclusteringrequest"></a>
<a id="tocsclusteringrequest"></a>

```json
{
  "dataset_id": 0,
  "clustering_algorithm": "string",
  "embedder_type": "string",
  "embedder_model": "string",
  "k_clusters": 0
}

```

ClusteringRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|dataset_id|integer|true|none|Identifier of the dataset whose content will be clustered.|
|clustering_algorithm|string|true|none|Clustering algorithm to apply. Supported values come from domain.enums.clustering_algorithms: <enum 'clustering_algorithms'>.|
|embedder_type|any|false|none|Embedding provider family used before clustering when embeddings are required.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|embedder_model|any|false|none|Embedding model name used by the selected embedder type.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|k_clusters|any|false|none|Explicit number of clusters to create when the algorithm requires it.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|integer|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

<h2 id="tocS_DatasetMessages">DatasetMessages</h2>
<!-- backwards compatibility -->
<a id="schemadatasetmessages"></a>
<a id="schema_DatasetMessages"></a>
<a id="tocSdatasetmessages"></a>
<a id="tocsdatasetmessages"></a>

```json
{
  "message_id": 0,
  "entity_id": "string",
  "entity_name": "string",
  "message_date": "string",
  "message_text": "string",
  "message_clean_text": "string",
  "sender_username": "string",
  "emojis": "string",
  "tags": "string"
}

```

DatasetMessages

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|message_id|integer|true|none|none|
|entity_id|string|true|none|none|
|entity_name|any|true|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|message_date|any|true|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|message_text|string|true|none|none|
|message_clean_text|string|true|none|none|
|sender_username|any|true|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|emojis|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|tags|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

<h2 id="tocS_DsEmailRequest">DsEmailRequest</h2>
<!-- backwards compatibility -->
<a id="schemadsemailrequest"></a>
<a id="schema_DsEmailRequest"></a>
<a id="tocSdsemailrequest"></a>
<a id="tocsdsemailrequest"></a>

```json
{
  "dataset_id": 0,
  "email_id": "string"
}

```

DsEmailRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|dataset_id|integer|true|none|Identifier of the dataset that contains the email.|
|email_id|string|true|none|Identifier of the email inside the dataset.|

<h2 id="tocS_DsRequest">DsRequest</h2>
<!-- backwards compatibility -->
<a id="schemadsrequest"></a>
<a id="schema_DsRequest"></a>
<a id="tocSdsrequest"></a>
<a id="tocsdsrequest"></a>

```json
{
  "dataset_id": 0
}

```

DsRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|dataset_id|integer|true|none|Identifier of the dataset to retrieve or mutate.|

<h2 id="tocS_EmailFront">EmailFront</h2>
<!-- backwards compatibility -->
<a id="schemaemailfront"></a>
<a id="schema_EmailFront"></a>
<a id="tocSemailfront"></a>
<a id="tocsemailfront"></a>

```json
{
  "email_id": "string",
  "subject": "string",
  "sender_signature": "string",
  "sender_email": "string",
  "date": "string",
  "content_clean": "string",
  "contains_attachement": false,
  "flags": [
    "string"
  ],
  "language": "en"
}

```

EmailFront

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|email_id|string|true|none|none|
|subject|string|true|none|none|
|sender_signature|string|true|none|none|
|sender_email|string|true|none|none|
|date|string|true|none|none|
|content_clean|string|true|none|none|
|contains_attachement|boolean|false|none|none|
|flags|[string]|false|none|none|
|language|string|false|none|none|

<h2 id="tocS_EmailRequest">EmailRequest</h2>
<!-- backwards compatibility -->
<a id="schemaemailrequest"></a>
<a id="schema_EmailRequest"></a>
<a id="tocSemailrequest"></a>
<a id="tocsemailrequest"></a>

```json
{
  "email_id": "string",
  "account_id": 0
}

```

EmailRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|email_id|string|true|none|Identifier of the email to retrieve.|
|account_id|integer|true|none|Identifier of the connected email account that owns the email.|

<h2 id="tocS_GmailInboxCriteriaRequest">GmailInboxCriteriaRequest</h2>
<!-- backwards compatibility -->
<a id="schemagmailinboxcriteriarequest"></a>
<a id="schema_GmailInboxCriteriaRequest"></a>
<a id="tocSgmailinboxcriteriarequest"></a>
<a id="tocsgmailinboxcriteriarequest"></a>

```json
{
  "account_id": 0,
  "criteria": {
    "sender_email": "string",
    "subject": "string",
    "date_from": "string",
    "date_to": "string",
    "only_unseen": false,
    "sort_by": "newest_first"
  },
  "page_num": 1,
  "num_rows": 50,
  "all": false
}

```

GmailInboxCriteriaRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|account_id|integer|true|none|Identifier of the connected email account to browse.|
|criteria|[InboxCriteria](#schemainboxcriteria)|false|none|Filter criteria applied to the inbox query.|
|page_num|integer|false|none|1-based page number to fetch.|
|num_rows|integer|false|none|Maximum number of items to include in one page.|
|all|boolean|false|none|When true, ignore the criteria and return the full inbox page.|

<h2 id="tocS_GroupMessagesSummarizePromptRequest">GroupMessagesSummarizePromptRequest</h2>
<!-- backwards compatibility -->
<a id="schemagroupmessagessummarizepromptrequest"></a>
<a id="schema_GroupMessagesSummarizePromptRequest"></a>
<a id="tocSgroupmessagessummarizepromptrequest"></a>
<a id="tocsgroupmessagessummarizepromptrequest"></a>

```json
{
  "dataset_id": 0,
  "cluster_docs_ids": [
    "string"
  ]
}

```

GroupMessagesSummarizePromptRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|dataset_id|integer|true|none|Identifier of the dataset that owns the selected messages.|
|cluster_docs_ids|any|true|none|Identifiers of the messages to summarize together.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[string]|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[integer]|false|none|none|

<h2 id="tocS_HTTPValidationError">HTTPValidationError</h2>
<!-- backwards compatibility -->
<a id="schemahttpvalidationerror"></a>
<a id="schema_HTTPValidationError"></a>
<a id="tocShttpvalidationerror"></a>
<a id="tocshttpvalidationerror"></a>

```json
{
  "detail": [
    {
      "loc": [
        "string"
      ],
      "msg": "string",
      "type": "string",
      "input": null,
      "ctx": {}
    }
  ]
}

```

HTTPValidationError

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|detail|[[ValidationError](#schemavalidationerror)]|false|none|none|

<h2 id="tocS_InboxCriteria">InboxCriteria</h2>
<!-- backwards compatibility -->
<a id="schemainboxcriteria"></a>
<a id="schema_InboxCriteria"></a>
<a id="tocSinboxcriteria"></a>
<a id="tocsinboxcriteria"></a>

```json
{
  "sender_email": "string",
  "subject": "string",
  "date_from": "string",
  "date_to": "string",
  "only_unseen": false,
  "sort_by": "newest_first"
}

```

InboxCriteria

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|sender_email|any|false|none|Optional sender email address to filter the inbox results.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|subject|any|false|none|Optional subject fragment used to filter inbox results.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|date_from|any|false|none|Inclusive lower bound for the email date filter.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|date_to|any|false|none|Inclusive upper bound for the email date filter.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|only_unseen|boolean|false|none|When true, only unread emails are returned.|
|sort_by|string|false|none|Sort order for the inbox results.|

<h2 id="tocS_InboxCriteriaPageResponse">InboxCriteriaPageResponse</h2>
<!-- backwards compatibility -->
<a id="schemainboxcriteriapageresponse"></a>
<a id="schema_InboxCriteriaPageResponse"></a>
<a id="tocSinboxcriteriapageresponse"></a>
<a id="tocsinboxcriteriapageresponse"></a>

```json
{
  "items": [
    {
      "email_id": "string",
      "subject": "string",
      "sender_signature": "string",
      "sender_email": "string",
      "date": "string",
      "content_clean": "string",
      "contains_attachement": false,
      "flags": [
        "string"
      ],
      "language": "en"
    }
  ],
  "total_count": 0,
  "page_num": 0,
  "num_rows": 0
}

```

InboxCriteriaPageResponse

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|items|[[EmailFront](#schemaemailfront)]|true|none|none|
|total_count|integer|true|none|none|
|page_num|integer|true|none|none|
|num_rows|integer|true|none|none|

<h2 id="tocS_InboxMeta">InboxMeta</h2>
<!-- backwards compatibility -->
<a id="schemainboxmeta"></a>
<a id="schema_InboxMeta"></a>
<a id="tocSinboxmeta"></a>
<a id="tocsinboxmeta"></a>

```json
{
  "senders_emails": {},
  "subjects": [
    "string"
  ],
  "min_date": "string",
  "max_date": "string",
  "top_senders": {}
}

```

InboxMeta

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|senders_emails|object|true|none|none|
|subjects|[string]|true|none|none|
|min_date|string|true|none|none|
|max_date|string|true|none|none|
|top_senders|object|true|none|none|

<h2 id="tocS_LoginProviderFront">LoginProviderFront</h2>
<!-- backwards compatibility -->
<a id="schemaloginproviderfront"></a>
<a id="schema_LoginProviderFront"></a>
<a id="tocSloginproviderfront"></a>
<a id="tocsloginproviderfront"></a>

```json
{
  "id": "string",
  "label": "string",
  "provider_type": "string",
  "auth_flow": "oauth_redirect",
  "icon": "string",
  "start_route": "string",
  "verify_route": "string",
  "relogin_route": "string"
}

```

LoginProviderFront

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|string|true|none|none|
|label|string|true|none|none|
|provider_type|string|true|none|none|
|auth_flow|[AuthFlow](#schemaauthflow)|true|none|none|
|icon|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|start_route|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|verify_route|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|relogin_route|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

<h2 id="tocS_MostImprtantTokensRequest">MostImprtantTokensRequest</h2>
<!-- backwards compatibility -->
<a id="schemamostimprtanttokensrequest"></a>
<a id="schema_MostImprtantTokensRequest"></a>
<a id="tocSmostimprtanttokensrequest"></a>
<a id="tocsmostimprtanttokensrequest"></a>

```json
{
  "dataset_id": 0,
  "minimum_gram": 1,
  "maximum_gram": 5,
  "grams_n": 100
}

```

MostImprtantTokensRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|dataset_id|integer|true|none|Identifier of the dataset to analyze.|
|minimum_gram|any|false|none|Smallest n-gram size to include in the analysis.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|integer|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|maximum_gram|any|false|none|Largest n-gram size to include in the analysis.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|integer|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|grams_n|any|false|none|Maximum number of ranked tokens or n-grams to return.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|integer|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

<h2 id="tocS_SaveEmailsDatasetRequest">SaveEmailsDatasetRequest</h2>
<!-- backwards compatibility -->
<a id="schemasaveemailsdatasetrequest"></a>
<a id="schema_SaveEmailsDatasetRequest"></a>
<a id="tocSsaveemailsdatasetrequest"></a>
<a id="tocssaveemailsdatasetrequest"></a>

```json
{
  "account_id": 0,
  "criteria": {
    "sender_email": "string",
    "subject": "string",
    "date_from": "string",
    "date_to": "string",
    "only_unseen": false,
    "sort_by": "newest_first"
  },
  "ds_name": "string"
}

```

SaveEmailsDatasetRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|account_id|integer|true|none|Identifier of the connected email account that owns the source emails.|
|criteria|[InboxCriteria](#schemainboxcriteria)|false|none|Filter criteria used to select emails for the dataset.|
|ds_name|string|true|none|Name to assign to the saved dataset.|

<h2 id="tocS_TelegramAnalyzeMessagesRequest">TelegramAnalyzeMessagesRequest</h2>
<!-- backwards compatibility -->
<a id="schematelegramanalyzemessagesrequest"></a>
<a id="schema_TelegramAnalyzeMessagesRequest"></a>
<a id="tocStelegramanalyzemessagesrequest"></a>
<a id="tocstelegramanalyzemessagesrequest"></a>

```json
{
  "account_id": 0,
  "entities": [
    {
      "chat_id": "123456",
      "limit": 100
    }
  ]
}

```

TelegramAnalyzeMessagesRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|account_id|integer|true|none|Identifier of the Telegram account whose entities will be analyzed.|
|entities|[object]|true|none|List of objects, each containing 'chat_id' (str) and 'limit' (int) for Telegram message analysis.|

<h2 id="tocS_TelegramAuthReloginRequest">TelegramAuthReloginRequest</h2>
<!-- backwards compatibility -->
<a id="schematelegramauthreloginrequest"></a>
<a id="schema_TelegramAuthReloginRequest"></a>
<a id="tocStelegramauthreloginrequest"></a>
<a id="tocstelegramauthreloginrequest"></a>

```json
{
  "account_id": 0
}

```

TelegramAuthReloginRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|account_id|integer|true|none|Identifier of the Telegram account that should be reauthenticated.|

<h2 id="tocS_TelegramAuthStartRequest">TelegramAuthStartRequest</h2>
<!-- backwards compatibility -->
<a id="schematelegramauthstartrequest"></a>
<a id="schema_TelegramAuthStartRequest"></a>
<a id="tocStelegramauthstartrequest"></a>
<a id="tocstelegramauthstartrequest"></a>

```json
{
  "state": "string",
  "api_id": 0,
  "api_hash": "string",
  "phone_number": "string"
}

```

TelegramAuthStartRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|state|string|true|none|Temporary OAuth-like state token created for the Telegram login flow.|
|api_id|integer|true|none|Telegram API ID associated with the client application.|
|api_hash|string|true|none|Telegram API hash associated with the client application.|
|phone_number|string|true|none|Phone number of the Telegram account being connected.|

<h2 id="tocS_TelegramAuthVerifyRequest">TelegramAuthVerifyRequest</h2>
<!-- backwards compatibility -->
<a id="schematelegramauthverifyrequest"></a>
<a id="schema_TelegramAuthVerifyRequest"></a>
<a id="tocStelegramauthverifyrequest"></a>
<a id="tocstelegramauthverifyrequest"></a>

```json
{
  "state": "string",
  "code": "string",
  "password": "string"
}

```

TelegramAuthVerifyRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|state|string|true|none|Temporary state token returned by the Telegram start step.|
|code|string|true|none|Verification code sent by Telegram to complete sign-in.|
|password|any|false|none|Two-factor authentication password when the Telegram account requires it.|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

<h2 id="tocS_TelegramEntitiesRequest">TelegramEntitiesRequest</h2>
<!-- backwards compatibility -->
<a id="schematelegramentitiesrequest"></a>
<a id="schema_TelegramEntitiesRequest"></a>
<a id="tocStelegramentitiesrequest"></a>
<a id="tocstelegramentitiesrequest"></a>

```json
{
  "account_id": 0,
  "limit": 100
}

```

TelegramEntitiesRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|account_id|integer|true|none|Identifier of the Telegram account whose entities will be listed.|
|limit|integer|false|none|Maximum number of entities to return.|

<h2 id="tocS_TelegramEntityFront">TelegramEntityFront</h2>
<!-- backwards compatibility -->
<a id="schematelegramentityfront"></a>
<a id="schema_TelegramEntityFront"></a>
<a id="tocStelegramentityfront"></a>
<a id="tocstelegramentityfront"></a>

```json
{
  "chat_id": "string",
  "chat_name": "string",
  "chat_type": "string"
}

```

TelegramEntityFront

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|chat_id|string|true|none|none|
|chat_name|any|true|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|chat_type|string|true|none|none|

<h2 id="tocS_TelegramEntityMessageTupleRequest">TelegramEntityMessageTupleRequest</h2>
<!-- backwards compatibility -->
<a id="schematelegramentitymessagetuplerequest"></a>
<a id="schema_TelegramEntityMessageTupleRequest"></a>
<a id="tocStelegramentitymessagetuplerequest"></a>
<a id="tocstelegramentitymessagetuplerequest"></a>

```json
{
  "entity_id": "string",
  "message_id": "string"
}

```

TelegramEntityMessageTupleRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|entity_id|string|true|none|Telegram entity identifier selected for dataset creation.|
|message_id|string|true|none|Telegram message identifier selected for dataset creation.|

<h2 id="tocS_TelegramMessageFront">TelegramMessageFront</h2>
<!-- backwards compatibility -->
<a id="schematelegrammessagefront"></a>
<a id="schema_TelegramMessageFront"></a>
<a id="tocStelegrammessagefront"></a>
<a id="tocstelegrammessagefront"></a>

```json
{
  "message_id": "string",
  "date": "string",
  "text": "string",
  "clean_text": "string",
  "chat_id": "string",
  "sender_id": "string",
  "sender_username": "string",
  "views": 0,
  "forwards": 0,
  "media": true,
  "language": "en"
}

```

TelegramMessageFront

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|message_id|string|true|none|none|
|date|any|true|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|text|any|true|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|clean_text|any|true|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|chat_id|any|true|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|sender_id|any|true|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|sender_username|any|true|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|views|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|integer|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|forwards|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|integer|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|media|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|boolean|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|language|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

<h2 id="tocS_TelegramMessageMediaRequest">TelegramMessageMediaRequest</h2>
<!-- backwards compatibility -->
<a id="schematelegrammessagemediarequest"></a>
<a id="schema_TelegramMessageMediaRequest"></a>
<a id="tocStelegrammessagemediarequest"></a>
<a id="tocstelegrammessagemediarequest"></a>

```json
{
  "account_id": 0,
  "chat_id": "string",
  "message_id": "string"
}

```

TelegramMessageMediaRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|account_id|integer|true|none|Identifier of the Telegram account that owns the chat.|
|chat_id|string|true|none|Telegram chat identifier that contains the message.|
|message_id|string|true|none|Telegram message identifier whose media should be retrieved.|

<h2 id="tocS_TelegramMessagesRequest">TelegramMessagesRequest</h2>
<!-- backwards compatibility -->
<a id="schematelegrammessagesrequest"></a>
<a id="schema_TelegramMessagesRequest"></a>
<a id="tocStelegrammessagesrequest"></a>
<a id="tocstelegrammessagesrequest"></a>

```json
{
  "account_id": 0,
  "limit": 500,
  "chat_id": "string"
}

```

TelegramMessagesRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|account_id|integer|true|none|Identifier of the Telegram account that owns the chat.|
|limit|integer|false|none|Maximum number of messages to fetch from the chat.|
|chat_id|string|true|none|Telegram chat identifier to read messages from.|

<h2 id="tocS_TelegramSaveDatasetRequest">TelegramSaveDatasetRequest</h2>
<!-- backwards compatibility -->
<a id="schematelegramsavedatasetrequest"></a>
<a id="schema_TelegramSaveDatasetRequest"></a>
<a id="tocStelegramsavedatasetrequest"></a>
<a id="tocstelegramsavedatasetrequest"></a>

```json
{
  "account_id": 0,
  "dataset_name": "string",
  "entity_message_tuples": [
    {
      "entity_id": "string",
      "message_id": "string"
    }
  ]
}

```

TelegramSaveDatasetRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|account_id|integer|true|none|Identifier of the Telegram account that owns the selected messages.|
|dataset_name|string|true|none|Name to assign to the generated dataset.|
|entity_message_tuples|[[TelegramEntityMessageTupleRequest](#schematelegramentitymessagetuplerequest)]|true|none|Pairs of entity and message identifiers that should be included in the dataset.|

<h2 id="tocS_UserDeleteRequest">UserDeleteRequest</h2>
<!-- backwards compatibility -->
<a id="schemauserdeleterequest"></a>
<a id="schema_UserDeleteRequest"></a>
<a id="tocSuserdeleterequest"></a>
<a id="tocsuserdeleterequest"></a>

```json
{
  "user_id": 0,
  "special_password": "string"
}

```

UserDeleteRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|user_id|integer|true|none|Identifier of the user account to delete.|
|special_password|string|true|none|Administrative password required to authorize the operation.|

<h2 id="tocS_UserLoginRequest">UserLoginRequest</h2>
<!-- backwards compatibility -->
<a id="schemauserloginrequest"></a>
<a id="schema_UserLoginRequest"></a>
<a id="tocSuserloginrequest"></a>
<a id="tocsuserloginrequest"></a>

```json
{
  "username": "string",
  "password": "string"
}

```

UserLoginRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|username|string|true|none|Username used to authenticate the local account.|
|password|string|true|none|Plain-text password submitted for authentication.|

<h2 id="tocS_User_Front">User_Front</h2>
<!-- backwards compatibility -->
<a id="schemauser_front"></a>
<a id="schema_User_Front"></a>
<a id="tocSuser_front"></a>
<a id="tocsuser_front"></a>

```json
{
  "user_id": 0,
  "username": "string"
}

```

User_Front

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|user_id|integer|true|none|none|
|username|string|true|none|none|

<h2 id="tocS_ValidationError">ValidationError</h2>
<!-- backwards compatibility -->
<a id="schemavalidationerror"></a>
<a id="schema_ValidationError"></a>
<a id="tocSvalidationerror"></a>
<a id="tocsvalidationerror"></a>

```json
{
  "loc": [
    "string"
  ],
  "msg": "string",
  "type": "string",
  "input": null,
  "ctx": {}
}

```

ValidationError

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|loc|[anyOf]|true|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|integer|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|msg|string|true|none|none|
|type|string|true|none|none|
|input|any|false|none|none|
|ctx|object|false|none|none|

