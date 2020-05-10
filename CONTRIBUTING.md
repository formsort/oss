# Adding packages

Create a folder in `/packages` and initialize an npm project there (`npm init`).

To allow the project to be public on NPM, specify the following in the `package.json`:

```
"publishConfig": {
  "access": "public"
}

```
# Publishing

In the root of this repository:

```
lerna publish
```
