## strapi-docker-launcher

Launcher for strapi that works for all strapi versions including v4.
Differences from the official https://github.com/strapi/strapi-docker:
- Supports Strapi v4 as well as older versions of Strapi (3x, 2x).
- Specify Strapi versions *and* Node.js versions when building images. 
- Updated to use ES modules. As such this library requires Node.js >= 12.
- Uses commander instead of argv for CLI.

Issues: requires Node 12 or newer.

See the official repo for more information.

### Credits

Largely based off of strapi/strapi-docker.
https://github.com/strapi/strapi-docker

### Quickstart

1) Install package dependencies using yarn or npm `yarn install`.
2) Run `yarn build` to build base and strapi images using the latest Node.js version.
3) Run `docker run -p 1337:1337 -it strapi/strapi:4.1.12-node16-alpine` to start Strapi.

When running this image, strapi will check if there is a project in the /src/app folder of the container. 
If there is nothing then it will run the strapi new command in the container /srv/app folder.
You can create a new project by running this command.

### Building images

Simply run `yarn build` to build using defaults. Run `yarn build -h` to view help.

Options:
```
-i, --info                             Output the current CLI version number
-t, --type <type>                      Which images to build (all, strapi, base) (default: "all")
-p, --push                             Push the image(s) after creating
-v, --strapi-version <strapiVersion>   Strapi version to build (default: "latest")
-n, --node-versions <nodeVersions...>  Node (default: ["16"])
-h, --help
```

```shell
docker run -p 1337:1337 -v `pwd`/app:/srv/app -it strapi/strapi:4.1.12-node16-alpine
```
