#! /bin/bash


docker pull swaggerapi/swagger-codegen-cli-v3
docker run --rm -v "${PWD}:/local" swaggerapi/swagger-codegen-cli-v3 generate \
    --input /local/pirates-api.yaml \
    --output /local/generated \
    -l typescript-angular \
    --additional-properties="ngVersion=14.15.4,providedInRoot=true"

