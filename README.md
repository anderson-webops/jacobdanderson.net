# jacobdanderson

## Project setup

```
npm install
```

### Compiles and loads the back-end for development

```
npm run server
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint-fix
```

## Deployment note

Current static output can produce flat route files such as `classes.html`, so
web-server rewrite rules may need to account for that shape explicitly.

Web-code note:

- nothing has to change for the current fix
- if you want a more future-proof build shape, the web build should emit nested
  directory output like `/classes/index.html` instead of flat `classes.html`
- that would let the site use the cleaner generic rule:

```nginx
try_files $uri $uri/ $uri/index.html =404;
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
