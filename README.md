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

#### More Examples

You can create a strapi project that will connect to a remote postgres database like so:

```shell
docker run -it \
  -p 1337:1337 \
  -p 5432:5432 \
  -v `pwd`/app:/srv/app \
  -e DATABASE_CLIENT=postgres \
  -e DATABASE_NAME=strapi_demo \
  -e DATABASE_HOST=host.docker.internal \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USERNAME=postgres \
  -e DATABASE_PASSWORD=postgres \
  strapi/strapi:4.1.12-node16-alpine
```

### Building images

Simply run `yarn build` to build using defaults. Run `yarn build -h` to view help.

#### Options:
```
-i, --info                                                  Output the current CLI version number
-t, --type <type>                                           Which images to build (all, strapi, base) (default: "all")
-p, --push                                                  Push the image(s) after creating
-v, --strapi-version <strapiVersion>                        Strapi version to build (default: "latest")
-n, --node-versions <nodeVersions...>                       Node (default: ["16"])
-x, --image-base-name-override <imageBaseNameOverride>      Override the base image name (default: "strapi/base")
-y, --image-strapi-name-override <imageStrapiNameOverride>  Override the strapi image name (default: "strapi/strapi")
-b, --buildx-platform <buildxPlatform>                      IF exists THEN docker buildx build --platform <buildxPlatform> is used. ELSE docker build...
-h, --help                                                  display help for command
```

#### Examples:
- Private registries (custom image name)

Create a custom image name for the base image and/or final strapi image (to prefix tags). For example to change both (using default option -t 'all').
```
yarn run build -x myregistry.com/base -y myregistry.com/strapi
```
Will result in the following tags:
```
---------------------------------------
Images created:
- myregistry.com/base:16
- myregistry.com/base:latest
- myregistry.com/base:16-alpine
- myregistry.com/base:alpine
- myregistry.com/strapi:4.1.12-node16
- myregistry.com/strapi:4.1.12
- myregistry.com/strapi:latest
- myregistry.com/strapi:4.1.12-node16-alpine
- myregistry.com/strapi:4.1.12-alpine
- myregistry.com/strapi:alpine
---------------------------------------
```

- Buildx platform

Create an image for a target architecture and operating system using `docker buildx build`. When not set, the image will build using the default `docker build...`
```
yarn run build -b linux/amd64
```