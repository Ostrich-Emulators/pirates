#! /bin/bash


docker pull swaggerapi/swagger-codegen-cli-v3
docker run --rm -v "${PWD}:/local" swaggerapi/swagger-codegen-cli-v3 generate \
    --input /local/pirates-api.yaml \
    --output /local/generated \
    -l typescript-angular \
    --additional-properties="ngVersion=14.15.4,providedInRoot=true"

# also put everything in the client source directories
# docker run --rm -v "${PWD}:/local" -v "${PWD}/../client/src/app:/output" swaggerapi/swagger-codegen-cli-v3 generate \
#     --input /local/pirates-api.yaml \
#     --output /output/generated \
#     -l typescript-angular \
#     --additional-properties="ngVersion=14.15.4,providedInRoot=true"

