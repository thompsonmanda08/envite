# PAY BOSS MERCHANT PORTAL

## DEVELOPMENT

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
bun dev

```

## RUN DOCKER BUILD IN DEV

```bash
docker build -t merchant-web-portal .

docker run docker run -p 3000:3000 --name merchant-web-portal merchant-web-portal

```

# PRODUCTION

### TO BUILD A DOCKER IMAGE BUILD

```bash
# BUILD A DOCKER IMAGE
 docker build --build-arg VERSION=1.0.0 -t merchant-web-portal:1.0.0 .

# TAG REGISTRY ON GITLAB REPO (Only for the Private REPO - FIRST TIME ONLY)
docker tag merchant-web-portal:1.0.0 registry.gitlab.com/payboss/frontend/merchant-web-portal

docker push merchant-web-portal:1.0.0
docker push registry.gitlab.com/payboss/frontend/merchant-web-portal

```

# PULL & RUN A DOCKER IMAGE

```bash
### DOCKER IMAGE PULL
sudo docker pull registry.gitlab.com/payboss/frontend/merchant-web-portal:latest

### RUN BUILD
sudo docker run -p 3000:3000 --name merchant-web-portal registry.gitlab.com/payboss/frontend/merchant-web-portal:latest

```
