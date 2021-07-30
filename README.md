# Bluepages

![version badge](https://img.shields.io/badge/version-1.0.0-blue)

Bluepages is a TypeScript library that allows you to easily lookup people in the UConn Phonebook.

## Installation

Use npm to install Bluepages.

```bash
npm install @ilefa/bluepages
```

Since Bluepages is currently hosted on GitHub packages, you will need to make a ``.npmrc`` file in the root of your project, and insert the following:

```env
@ilefa:registry=https://npm.pkg.github.com
```

## Usage

```ts
import { lookup } from '@ilefa/bluepages';

// Lookup someone by their name
let person = await lookup('Jacob Scoggin');

// or by their email
let person = await lookup('jake.scoggin@uconn.edu');

// or by their phone number (not really encouraged since some phone numbers are shared)
let person = await lookup('860 486-3723');

// or by their NetID
let person = await lookup('jas14034');
```

## CAS Tickets

The UConn phonebook only displays information about employees and other public university affiliates.

If you want to have access to student records, you need to supply a valid CAS Ticket. This ticket acts like an OAuth2 Access Token,
and can be obtained by using the CAS Login for the Phonebook. As of right now, there is no way to automate logging in, and obtaining such a token besides doing it manually.

However, how long the ticket lasts is kind of up in the air, so most likely you won't be able to manually log in, and just indefinitely use that token
for your service.

Regardless, the link for the login can be found [here](https://phonebook.uconn.edu/login.php?redirect=index), and you can extract the ticket as the value of the ``PHPSESSID`` cookie.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[GPL-3.0](https://choosealicense.com/licenses/gpl-3.0/)