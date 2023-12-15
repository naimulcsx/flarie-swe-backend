import { connectionSource } from './typeorm';
import { Seeder } from './seeder';

(async function seed() {
  connectionSource
    .initialize()
    .then(async (dataSource) => {
      const seeder = new Seeder(dataSource);
      await seeder.reset();
      await seeder.seed();
      process.exit(0);
    })
    .catch((error) => console.log(error));
})();
