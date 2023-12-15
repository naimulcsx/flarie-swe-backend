## Backend Test 1 Submission

## Step 1: Install Dependencies

```bash
$ npm install
```

## Step 2: Run necessary components

```
docker-compose up -d
```

## Step 3: Migration 

Update your mysql config in `env` file accordingly if you are not using docker-compose to spin up mysql.

```bash
$ npm run migration:run
```

## Step 4: Seed

After migration, to populate the database with some dummy data. It will create 5 players and 5 rewards.

```bash
$ npm run seed
```

## Step 5: Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Unit Test

Running e2e tests will spin up a `test-db` mysql container.

```bash
$ npm run test:e2e
```

## E2E Test

```bash
$ npm run test
```