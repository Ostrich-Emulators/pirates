#! /bin/bash

docker pull swaggerapi/swagger-codegen-cli-v3

# also put everything in the client source directories
docker run --rm -v "${PWD}/../common:/local" -v "${PWD}/src/app:/output" swaggerapi/swagger-codegen-cli-v3 generate \
    --input /local/pirates-api.yaml \
    --output /output/generated \
    -l typescript-angular \
    --additional-properties="ngVersion=17.0.23,providedInRoot=true"

